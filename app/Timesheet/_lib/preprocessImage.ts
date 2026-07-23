// Client-side image cleanup that runs before Tesseract OCR. Traditional OCR is
// far more accurate on an adequately-sized, high-contrast image than on a raw
// screenshot/photo — this pipeline does the low-risk, universally-helpful prep
// (upscale small text, grayscale, contrast-stretch) entirely in the browser with
// a <canvas>, no network or AI involved. We deliberately DON'T hard-binarize:
// Tesseract runs its own Otsu thresholding internally, and pre-binarizing can
// fight it and damage anti-aliased screenshot text.

const TARGET_MIN_DIM = 1600; // upscale so the smaller side is at least this many px
const MAX_DIM = 2600; // but never exceed this on the larger side (keeps OCR fast)

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image"));
    };
    img.src = url;
  });
}

/** Scale factor that lifts small images toward TARGET_MIN_DIM while capping the
 * largest side at MAX_DIM (so huge phone photos get downscaled, not upscaled). */
function computeScale(w: number, h: number): number {
  const minDim = Math.min(w, h);
  const maxDim = Math.max(w, h);
  let scale = 1;
  if (minDim < TARGET_MIN_DIM) scale = TARGET_MIN_DIM / minDim;
  if (maxDim * scale > MAX_DIM) scale = MAX_DIM / maxDim;
  return scale;
}

/** Robust min/max for contrast stretch: ignore the darkest/brightest 0.5% of
 * pixels so a few stray specks don't blow out the normalization. */
function robustRange(histogram: number[], total: number): { lo: number; hi: number } {
  const clip = total * 0.005;
  let acc = 0;
  let lo = 0;
  for (let i = 0; i < 256; i++) {
    acc += histogram[i];
    if (acc > clip) {
      lo = i;
      break;
    }
  }
  acc = 0;
  let hi = 255;
  for (let i = 255; i >= 0; i--) {
    acc += histogram[i];
    if (acc > clip) {
      hi = i;
      break;
    }
  }
  return { lo, hi: Math.max(hi, lo + 1) };
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas export failed"))),
      "image/png"
    );
  });
}

/** Returns a cleaned PNG Blob ready for OCR, or the original file if anything
 * goes wrong (canvas unsupported, decode error) so OCR still gets *something*. */
export async function preprocessForOcr(file: File): Promise<Blob> {
  try {
    const img = await loadImage(file);
    const scale = computeScale(img.width, img.height);
    const width = Math.round(img.width * scale);
    const height = Math.round(img.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return file;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, width, height);

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const n = width * height;

    // Pass 1 — grayscale (luminance) + histogram for the robust stretch range.
    const gray = new Uint8ClampedArray(n);
    const histogram = new Array(256).fill(0);
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      const g = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      gray[p] = g;
      histogram[g]++;
    }

    const { lo, hi } = robustRange(histogram, n);
    const range = hi - lo;

    // Pass 2 — grayscale + contrast-stretch to the full 0-255 range. Tesseract
    // still does its own thresholding; we just hand it a clean, high-contrast image.
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      let v = ((gray[p] - lo) / range) * 255;
      v = v < 0 ? 0 : v > 255 ? 255 : v;
      data[i] = data[i + 1] = data[i + 2] = v;
      data[i + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
    return await canvasToBlob(canvas);
  } catch {
    return file;
  }
}
