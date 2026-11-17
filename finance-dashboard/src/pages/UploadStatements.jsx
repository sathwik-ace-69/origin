
import { useRef, useState } from "react";

import {
  UploadIcon,
  FileTextIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  CloseIcon,
} from "../components/Icons.jsx";

function UploadStatements() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  const allowedTypes = [".csv", ".xlsx", ".xls", ".pdf"];

  const validateFile = (file) => {
    if (!file) return;

    const extension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();

    if (!allowedTypes.includes(extension)) {
      setError(
        "Unsupported file format. Please upload CSV, Excel or PDF."
      );
      setSelectedFile(null);
      setMessage("");
      return;
    }

    setError("");
    setMessage("");
    setSelectedFile(file);
  };

  const handleFileChange = (event) => {
    validateFile(event.target.files[0]);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    validateFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError("");
    setMessage("");
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    setMessage(
      "Your file is selected and ready. Backend upload and transaction analysis will be connected during system integration."
    );
  };

  return (
    <main className="min-h-screen bg-[#080F20] px-5 py-10 text-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">

        {/* Introduction */}
        <div className="mb-9">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400">
            DATA IMPORT CENTER
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            Bring your finances into focus.
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            Upload your bank statements to prepare transaction data
            for categorization, spending analysis and financial
            investigations.
          </p>
        </div>

        {/* Upload area */}
        <div className="rounded-3xl border border-white/10 bg-[#142B4D]/40 p-5 shadow-xl shadow-black/10 sm:p-8">

          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 sm:p-14 ${
              isDragging
                ? "border-sky-400 bg-blue-500/10"
                : "border-sky-400/20 bg-[#080F20]/60 hover:border-sky-400/60"
            }`}
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-sky-400/20 bg-blue-500/10">
              <UploadIcon className="h-10 w-10 text-sky-400" />
            </div>

            <h2 className="mt-6 text-xl font-semibold">
              Drop your bank statement here
            </h2>

            <p className="mt-3 text-sm text-slate-400">
              Drag and drop your file, or browse your computer.
            </p>

            <label className="mt-7 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500">
              <UploadIcon className="h-4 w-4" />
              Choose File

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xls,.xlsx,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <p className="mt-5 text-xs text-slate-500">
              Supported formats: CSV, XLS, XLSX, PDF
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-rose-400/20 bg-rose-500/10 p-4">
              <AlertCircleIcon className="h-5 w-5 shrink-0 text-rose-400" />
              <p className="text-sm text-rose-300">{error}</p>
            </div>
          )}

          {/* Selected file */}
          {selectedFile && (
            <div className="mt-6 rounded-2xl border border-sky-400/20 bg-[#080F20]/60 p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/15">
                  <FileTextIcon className="h-7 w-7 text-sky-400" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">
                    {selectedFile.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>

                <CheckCircleIcon className="h-6 w-6 shrink-0 text-emerald-400" />

                <button
                  type="button"
                  onClick={removeFile}
                  aria-label="Remove selected file"
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-400"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Status message */}
          {message && (
            <div className="mt-5 rounded-xl border border-sky-400/20 bg-sky-400/10 p-4 text-sm leading-6 text-sky-200">
              {message}
            </div>
          )}

          {/* Upload button */}
          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile}
            className="mt-6 w-full rounded-xl bg-blue-600 py-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            Prepare Statement for Analysis →
          </button>

          <p className="mt-3 text-center text-xs text-slate-500">
            Selecting a file does not send it to a server. Backend
            upload integration is not connected yet.
          </p>
        </div>

        {/* How it works */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              number: "01",
              title: "Upload",
              description: "Select your bank statement file.",
            },
            {
              number: "02",
              title: "Analyze",
              description: "Prepare transaction data for processing.",
            },
            {
              number: "03",
              title: "Investigate",
              description: "Explore spending patterns and unusual activity.",
            },
          ].map((step) => (
            <div
              key={step.number}
              className="rounded-2xl border border-white/10 bg-[#142B4D]/40 p-5"
            >
              <p className="text-sm font-bold text-sky-400">
                {step.number}
              </p>

              <h3 className="mt-3 font-semibold text-white">
                {step.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Privacy note */}
        <div className="mt-8 flex gap-3 rounded-2xl border border-amber-400/10 bg-amber-400/5 p-5">
          <span className="text-xl text-amber-300">ⓘ</span>
          <div>
            <h3 className="text-sm font-semibold text-amber-200">
              Demo environment
            </h3>
            <p className="mt-1 text-xs leading-6 text-slate-400">
              This prototype currently validates file selection in
              the browser. Actual secure file transfer, parsing and
              analysis require backend integration.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}

export default UploadStatements;
