import Dashboard from "./components/dashboard";
import { ThemeToggle } from "./components/theme-toggle";

export default function Home() {
  return (
    <div className="w-full grid grid-rows-[20px_1fr_20px] min-h-screen p-2 pb-20 gap-16 sm:p-5 font-[family-name:var(--font-geist-sans)]">
       <header className="flex items-center justify-between h-14 border-b">
        <h1 className="text-xl font-bold">Frame Builder</h1>
        <ThemeToggle />
      </header>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Dashboard />
      </main>
      <footer className="flex items-center h-14 border-t">
        <a href="https://fvrtrp.com" target="_blank" className="text-sm text-gray-500 hover:text-green-500 hover:underline">
          fvrtrp.com
        </a>
      </footer>
    </div>
  );
}
