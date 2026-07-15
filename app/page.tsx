export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}

        <div className="bg-white rounded-xl shadow-md p-8 text-center mb-6">
          <h1 className="text-4xl font-bold text-blue-700">
            RUET Examination Bill Generator
          </h1>

          <p className="text-gray-600 mt-3">
            Upload Total Bill PDF and Generate Individual Teacher Bills
          </p>
        </div>


        {/* Upload Section */}

        <div className="bg-white rounded-xl shadow-md p-8 mb-6">

          <h2 className="text-2xl font-semibold mb-5">
            Upload Total Bill PDF
          </h2>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">

            <button
              className="
              bg-blue-700
              hover:bg-blue-800
              text-white
              px-8
              py-3
              rounded-lg
              font-semibold
              "
            >
              Choose File
            </button>

            <p className="mt-4 text-gray-500">
              PDF file is not uploaded yet.
            </p>

          </div>

        </div>



        {/* PDF Information */}


        <div className="bg-white rounded-xl shadow-md p-8 mb-6">

          <h2 className="text-2xl font-semibold mb-5">
            PDF Information
          </h2>

          <p className="text-gray-600">
            No PDF information available.
          </p>

        </div>



        {/* Teacher Information */}


        <div className="bg-white rounded-xl shadow-md p-8">

          <h2 className="text-2xl font-semibold mb-5">
            Teacher Information
          </h2>

          <p className="text-gray-600">
            Teachers Found : 0
          </p>

          <p className="text-gray-500 mt-3">
            No teacher information available.
          </p>

        </div>

      </div>
    </main>
  );
}