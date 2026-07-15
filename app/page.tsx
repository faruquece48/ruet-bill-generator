"use client";

import { useState } from "react";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please select a PDF file.");
      return;
    }

    setSelectedFile(file);
  };

  return (
    <main className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}

        <section className="bg-white rounded-xl shadow-md p-8 text-center">

          <h1 className="text-4xl font-bold text-blue-700">
            RUET Bill Generator
          </h1>

          <p className="mt-3 text-gray-600 text-lg">
            Generate Individual Honorarium Bills from a Total Bill PDF
          </p>

        </section>

        {/* Upload Section */}

        <section className="bg-white rounded-xl shadow-md p-8">

          <h2 className="text-2xl font-semibold mb-6">
            Upload Total Bill PDF
          </h2>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">

            <input
              id="pdf-upload"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />

            <label
              htmlFor="pdf-upload"
              className="
                inline-block
                cursor-pointer
                bg-blue-700
                hover:bg-blue-800
                text-white
                px-8
                py-3
                rounded-lg
                font-semibold
                transition
              "
            >
              Choose PDF
            </label>

            {selectedFile ? (
              <div className="mt-6 bg-gray-100 rounded-lg p-5 max-w-xl mx-auto text-left">

                <p>
                  <strong>File Name :</strong> {selectedFile.name}
                </p>

                <p className="mt-2">
                  <strong>File Size :</strong>{" "}
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>

                <p className="mt-2">
                  <strong>Last Modified :</strong>{" "}
                  {new Date(selectedFile.lastModified).toLocaleDateString()}
                </p>

                <p className="mt-3 text-green-600 font-semibold">
                  ✓ PDF selected successfully.
                </p>

              </div>
            ) : (
              <p className="mt-5 text-gray-500">
                No PDF selected.
              </p>
            )}

            <button
              disabled={!selectedFile}
              className={`
                mt-8
                px-8
                py-3
                rounded-lg
                font-semibold
                text-white
                transition

                ${
                  selectedFile
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-400 cursor-not-allowed"
                }
              `}
            >
              Process PDF
            </button>

          </div>

        </section>

        {/* Status */}

        <section className="grid grid-cols-1 md:grid-cols-4 gap-5">

          <div className="bg-white rounded-xl shadow-md p-6">

            <p className="text-gray-500 text-sm">
              PDF Status
            </p>

            <h3
              className={`text-xl font-semibold mt-2 ${
                selectedFile ? "text-green-600" : "text-red-500"
              }`}
            >
              {selectedFile ? "Uploaded" : "Not Uploaded"}
            </h3>

          </div>

          <div className="bg-white rounded-xl shadow-md p-6">

            <p className="text-gray-500 text-sm">
              Pages
            </p>

            <h3 className="text-3xl font-bold mt-2">
              0
            </h3>

          </div>

          <div className="bg-white rounded-xl shadow-md p-6">

            <p className="text-gray-500 text-sm">
              Teachers Found
            </p>

            <h3 className="text-3xl font-bold mt-2">
              0
            </h3>

          </div>

          <div className="bg-white rounded-xl shadow-md p-6">

            <p className="text-gray-500 text-sm">
              Bills Generated
            </p>

            <h3 className="text-3xl font-bold mt-2">
              0
            </h3>

          </div>

        </section>

        {/* PDF Information */}

        <section className="bg-white rounded-xl shadow-md p-8">

          <h2 className="text-2xl font-semibold mb-6">
            PDF Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <span className="font-medium">
                File Name :
              </span>{" "}
              {selectedFile?.name || "—"}
            </div>

            <div>
              <span className="font-medium">
                File Size :
              </span>{" "}
              {selectedFile
                ? `${(selectedFile.size / 1024).toFixed(2)} KB`
                : "—"}
            </div>

            <div>
              <span className="font-medium">
                File Type :
              </span>{" "}
              {selectedFile?.type || "—"}
            </div>

            <div>
              <span className="font-medium">
                Last Modified :
              </span>{" "}
              {selectedFile
                ? new Date(
                    selectedFile.lastModified
                  ).toLocaleDateString()
                : "—"}
            </div>

            <div>
              <span className="font-medium">
                Pages :
              </span>{" "}
              —
            </div>

            <div>
              <span className="font-medium">
                Semester :
              </span>{" "}
              —
            </div>

            <div className="md:col-span-2">
              <span className="font-medium">
                Examination :
              </span>{" "}
              —
            </div>

          </div>

        </section>

        {/* Teacher Information */}

        <section className="bg-white rounded-xl shadow-md p-8">

          <h2 className="text-2xl font-semibold mb-6">
            Teacher Information
          </h2>

          <p className="text-gray-600">
            No teachers detected.
          </p>

        </section>

      </div>
    </main>
  );
}