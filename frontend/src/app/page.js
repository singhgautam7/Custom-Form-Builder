import Image from "next/image";

export default function Home() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      <p>Welcome to the Form Maker dashboard. Use the left nav to access your forms and submissions.</p>
      <div className="mt-6 flex gap-3">
        <a href="/forms" className="px-4 py-2 bg-white border rounded">My Forms</a>
        <a href="/submissions" className="px-4 py-2 bg-white border rounded">My Submissions</a>
      </div>
    </div>
  )
}
