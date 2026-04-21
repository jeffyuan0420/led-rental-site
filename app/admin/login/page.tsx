import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">管理員登入</h1>
          <p className="text-gray-500 text-sm mt-1">Persona Taiwan 後台系統</p>
        </div>
        <LoginClient />
      </div>
    </div>
  );
}
