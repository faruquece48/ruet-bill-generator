export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold text-slate-800">
          RUET Bill Generator
        </h1>

        <p className="mt-2 text-slate-600">
          Examination Bill Management System
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold">Teachers</h2>
            <p className="mt-4 text-3xl font-bold">0</p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold">Bills</h2>
            <p className="mt-4 text-3xl font-bold">0</p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold">Duties</h2>
            <p className="mt-4 text-3xl font-bold">0</p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="text-lg font-semibold">Reports</h2>
            <p className="mt-4 text-3xl font-bold">0</p>
          </div>
        </div>
      </div>
    </main>
  );
}