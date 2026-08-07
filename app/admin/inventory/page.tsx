import InventoryClient from "./InventoryClient";

export default function InventoryPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">庫存管理</h1>
            <p className="text-gray-500 text-sm">Persona Taiwan 後台</p>
          </div>
          <a href="/admin/bookings" className="text-sm text-gray-500 hover:text-gray-900">
            ← 回預訂管理
          </a>
        </div>
        <InventoryClient />
      </div>
    </div>
  );
}
