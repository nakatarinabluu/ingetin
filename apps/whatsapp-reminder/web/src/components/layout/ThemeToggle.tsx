import { Moon, Sun } from "lucide-react"
import { useTheme } from "../../context/ThemeContext"

/**
 * 🌓 THEME TOGGLE COMPONENT (v2.0)
 * Rebranded for Modern Studio. 
 * Uses semantic theme variables for seamless integration.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative w-10 h-10 flex items-center justify-center rounded-full bg-secondary text-foreground transition-all hover:bg-muted active:scale-90 border border-border/50 shadow-sm"
      title="Ganti Tema"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-indigo-400" />
      <span className="sr-only">Ganti Tema</span>
    </button>
  )
}
