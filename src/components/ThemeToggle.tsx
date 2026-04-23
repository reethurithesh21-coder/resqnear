import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative overflow-hidden transition-transform hover:scale-110 ${className ?? ''}`}
    >
      <Sun
        className={`h-5 w-5 transition-all duration-500 ${
          isDark ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
        }`}
      />
      <Moon
        className={`absolute h-5 w-5 transition-all duration-500 ${
          isDark ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
        }`}
      />
    </Button>
  );
}
