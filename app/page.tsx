import Dashboard from "./components/dashboard";
import { ThemeToggle } from "../components/theme-toggle";
import { Github } from "lucide-react";

export default function Home() {
  return (
    <div className="w-full grid grid-rows-[20px_1fr_20px] min-h-screen p-2 pb-20 gap-16 sm:p-5 font-[family-name:var(--font-geist-sans)]">
       <header className="flex items-center justify-start gap-5 h-14 border-b">
        <h1 className="text-xl font-bold">Frames Builder</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <a
            href="https://github.com/surajk95/frame-builder"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <Github className="h-5 w-5" />
          </a>
        </div>
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
