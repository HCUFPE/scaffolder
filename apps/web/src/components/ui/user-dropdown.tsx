import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ExternalLink, KeyRound, LogOut, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { SafeUserProfileDto } from '../../lib/api-client/models';
import { Badge } from './badge';

export interface UserDropdownProps {
  user: SafeUserProfileDto | null;
  isAdmin: boolean;
  onLogout: () => void;
  onManageAccount: () => void;
}

export function UserDropdown({
  user,
  isAdmin,
  onLogout,
  onManageAccount,
}: UserDropdownProps) {
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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none cursor-pointer"
        aria-expanded={isOpen}
        aria-label="Menu do usuário"
      >
        {/* Avatar */}
        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
          {user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
        </div>

        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
            {user?.name || 'Usuário'}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            {user?.role}
          </span>
        </div>

        <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:inline" />
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header Card */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {user?.name}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user?.email}
                </span>
              </div>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5">
              <Badge
                variant={isAdmin ? 'default' : 'secondary'}
                className="text-[9px] py-0 px-1.5 uppercase font-bold"
              >
                {user?.role}
              </Badge>
              <span className="text-[10px] text-slate-400">Sessão Ativa</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="py-1 px-2 space-y-0.5 text-xs">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <UserIcon className="h-4 w-4 text-slate-500" />
              <span>Meu Perfil</span>
            </Link>

            <button
              onClick={() => {
                setIsOpen(false);
                onManageAccount();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <KeyRound className="h-4 w-4 text-slate-500" />
                <span>Central de Segurança</span>
              </span>
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </button>
          </div>

          {/* Logout Action */}
          <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800/80 px-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Encerrar Sessão (Sair)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
