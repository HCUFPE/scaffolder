import { useEffect, useRef, useState } from 'react';
import { Moon, Sun, Monitor, ChevronDown } from 'lucide-react';
import { useTheme, type Theme } from '../../context/theme-context';
import { Button } from './button';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options: { label: string; value: Theme; icon: React.ReactNode }[] = [
    { label: 'Claro', value: 'light', icon: <Sun className="h-4 w-4 mr-2 text-warning-text" /> },
    { label: 'Escuro', value: 'dark', icon: <Moon className="h-4 w-4 mr-2 text-brand-text" /> },
    { label: 'Sistema', value: 'system', icon: <Monitor className="h-4 w-4 mr-2 text-muted" /> },
  ];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Alternar tema"
        className="flex items-center gap-1.5 px-2.5 h-9"
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="h-4 w-4 text-brand-text" />
        ) : (
          <Sun className="h-4 w-4 text-warning-text" />
        )}
        <span className="hidden sm:inline text-xs font-medium capitalize">{theme}</span>
        <ChevronDown className="h-3 w-3 opacity-60" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-md shadow-lg bg-surface border border-line ring-1 ring-black/5 z-50 py-1">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setTheme(option.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center px-3 py-2 text-xs font-medium transition-colors text-left ${
                theme === option.value
                  ? 'bg-surface-muted text-brand-text font-semibold'
                  : 'text-body hover:bg-surface-muted'
              }`}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
