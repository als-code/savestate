import { Navbar } from './Navbar';

export function MainLayout({ children }) {
  return (
    <div className="min-h-screen text-gray-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

