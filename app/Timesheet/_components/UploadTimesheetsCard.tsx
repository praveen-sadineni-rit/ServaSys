"use client";

import { useRef, useState } from "react";
import { FileText, X } from "lucide-react";

type Props = {
  files: File[];
  onFilesAdd: (files: File[]) => void;
  onFileRemove: (index: number) => void;
  onRead: () => void;
  reading: boolean;
  readSummary: { dayCount: number; fileCount: number } | null;
};

const ACCEPTED_EXTENSIONS = ".jpg,.jpeg,.png,.pdf,.xlsx,.xls,.csv";

function formatFileSize(bytes: number): string {
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function UploadTimesheetsCard({ files, onFilesAdd, onFileRemove, onRead, reading, readSummary }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  function handleFileList(list: FileList | null) {
    if (!list || list.length === 0) return;
    onFilesAdd(Array.from(list));
  }

  return (
    <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="flex items-baseline gap-2">
        <span style={{ fontFamily: "var(--font-playfair)" }} className="text-xl font-bold text-timesheetRust">
          2
        </span>
        <h2 style={{ fontFamily: "var(--font-playfair)" }} className="text-xl font-bold text-[#1a1a1a]">
          Upload timesheets
        </h2>
      </div>
      <p className="mt-1 text-sm text-gray-600">
        JPG / PNG photo, PDF, XLSX / XLS, or CSV. To load several (e.g. one per vendor), pick them together, or add them one
        at a time with <span className="font-medium text-[#1a1a1a]">+ Add another file</span> — each one stacks in the list
        below. Nothing is stored.
      </p>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFileList(e.dataTransfer.files);
        }}
        className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition ${
          dragActive ? "border-timesheetRust bg-timesheetCream" : "border-gray-300 bg-white hover:border-timesheetRust/50"
        }`}
      >
        <FileText className="text-gray-400" size={28} />
        <p className="mt-3 text-sm font-semibold text-[#1a1a1a]">Click to choose file(s) — or drag them here</p>
        <p className="mt-1 text-xs text-gray-500">image · pdf · xlsx · xls · csv</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS}
          className="hidden"
          onChange={(e) => {
            handleFileList(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-2 truncate text-[#1a1a1a]">
                <FileText size={16} className="shrink-0 text-gray-400" />
                <span className="truncate">{file.name}</span>
              </span>
              <span className="flex shrink-0 items-center gap-3 text-gray-500">
                {formatFileSize(file.size)}
                <button type="button" onClick={() => onFileRemove(i)} aria-label={`Remove ${file.name}`}>
                  <X size={16} className="text-timesheetRust hover:text-timesheetRustDark" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-lg border border-timesheetRust px-4 py-2 text-sm font-semibold text-timesheetRust transition hover:bg-timesheetCream"
        >
          + Add another file
        </button>
        <button
          type="button"
          onClick={onRead}
          disabled={files.length === 0 || reading}
          className="rounded-lg bg-timesheetRust px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-timesheetRustDark disabled:cursor-not-allowed disabled:opacity-40"
        >
          {reading ? "Reading…" : `Read ${files.length} timesheet${files.length === 1 ? "" : "s"}`}
        </button>
      </div>

      {readSummary && (
        <p className="mt-3 text-sm text-gray-600">
          Read {readSummary.dayCount} days from {readSummary.fileCount} file{readSummary.fileCount === 1 ? "" : "s"}. Review
          below, then total.
        </p>
      )}
    </section>
  );
}
