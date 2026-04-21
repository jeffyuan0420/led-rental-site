import AdminBookingsClient from "./AdminBookingsClient";

export default function AdminBookingsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">預訂管理</h1>
            <p className="text-gray-500 text-sm">Persona Taiwan 後台</p>
          </div>
        </div>
        <AdminBookingsClient />
      </div>
    </div>
  );
}
