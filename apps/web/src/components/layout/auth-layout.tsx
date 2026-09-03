import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  KeyRound,
  LayoutDashboard,
  ListTodo,
  Menu,
  Search,
  Shield,
  User,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/auth-context';
import { ThemeToggle } from '../ui/theme-toggle';
import { UserDropdown } from '../ui/user-dropdown';

export function AuthLayout() {
  const { user, isAdmin, logout, manageAccount } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Desktop sidebar collapsed state with localStorage persistence
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('appstart_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  // Mobile drawer open state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Quick search state in topbar
  const [searchQuery, setSearchQuery] = useState('');

  // Close menus on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('appstart_sidebar_collapsed', String(next));
      } catch (_) {}
      return next;
    });
  };

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tasks?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  // OneUI Exact Navigation Structure with Headings & Links
  const navigationGroups = [
    {
      heading: 'Visão Geral',
      items: [
        {
          label: 'Dashboard',
          path: '/',
          icon: <LayoutDashboard className="h-4 w-4 shrink-0" />,
          badge: null,
        },
      ],
    },
    {
      heading: 'Módulos',
      items: [
        {
          label: 'Tarefas (CRUD)',
          path: '/tasks',
          icon: <ListTodo className="h-4 w-4 shrink-0" />,
          badge: 'Ref',
        },
        ...(isAdmin
          ? [
              {
                label: 'Usuários',
                path: '/users',
                icon: <Users className="h-4 w-4 shrink-0" />,
                badge: 'Admin',
              },
            ]
          : []),
      ],
    },
    {
      heading: 'Conta',
      items: [
        {
          label: 'Meu Perfil',
          path: '/profile',
          icon: <User className="h-4 w-4 shrink-0" />,
          badge: null,
        },
      ],
    },
  ];

  // Dynamic breadcrumb / title
  const getPageContext = () => {
    switch (location.pathname) {
      case '/tasks':
        return { title: 'Tarefas', category: 'Módulos' };
      case '/users':
        return { title: 'Usuários', category: 'Administração' };
      case '/profile':
        return { title: 'Meu Perfil', category: 'Conta' };
      case '/':
      default:
        return { title: 'Dashboard', category: 'Visão Geral' };
    }
  };

  const pageContext = getPageContext();

  return (
    <div className="min-h-screen flex bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased">
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs md:hidden animate-in fade-in duration-150"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* OneUI Sidebar (sidebar-dark theme) with Edge Floating Toggle Button */}
      <aside
        id="sidebar"
        className={`fixed md:sticky top-0 z-50 h-screen flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800 shadow-xl md:shadow-none transition-all duration-300 ease-in-out relative ${
          isCollapsed ? 'md:w-20' : 'md:w-64'
        } ${
          isMobileOpen
            ? 'translate-x-0 w-72'
            : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Floating Toggle Button on the side border (Desktop) */}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex absolute -right-3 top-5 z-50 h-6 w-6 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:bg-blue-600 hover:border-blue-600 shadow-md items-center justify-center transition-all cursor-pointer hover:scale-110"
          title={isCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
          aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>

        {/* Sidebar Content Header */}
        <div
          className={`h-16 flex items-center border-b border-slate-800/90 shrink-0 bg-slate-900/95 transition-all ${
            isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
          }`}
        >
          <Link
            to="/"
            className="flex items-center gap-2.5 font-bold text-white overflow-hidden group min-w-0"
          >
            {/* OneUI Brand Icon */}
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-sm shadow-blue-500/30 group-hover:bg-blue-500 transition-colors shrink-0">
              AS
            </div>

            {!isCollapsed && (
              <span className="tracking-wider font-extrabold text-base text-white leading-tight truncate">
                AppStart
              </span>
            )}
          </Link>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 shrink-0"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Navigation (OneUI nav-main) */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-3 custom-scrollbar">
          {navigationGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {/* OneUI nav-main-heading */}
              {!isCollapsed ? (
                <div className="px-3 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {group.heading}
                </div>
              ) : (
                <div className="my-2 border-t border-slate-800" />
              )}

              {/* OneUI nav-main-link list */}
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  title={isCollapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg text-sm font-medium transition-colors group relative ${
                      isCollapsed ? 'justify-center h-10 w-10 mx-auto px-0' : 'px-3 py-2'
                    } ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-600/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* nav-main-link-icon */}
                      <div
                        className={`${
                          isActive
                            ? 'text-white'
                            : 'text-slate-400 group-hover:text-white'
                        }`}
                      >
                        {item.icon}
                      </div>

                      {/* nav-main-link-name */}
                      {!isCollapsed && (
                        <div className="flex items-center justify-between flex-1 truncate">
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Sidebar Bottom Action (OneUI Style) */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 shrink-0">
          {!isCollapsed ? (
            <button
              onClick={manageAccount}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <KeyRound className="h-3.5 w-3.5 text-blue-400" />
                <span>Central de Segurança</span>
              </span>
              <ExternalLink className="h-3.5 w-3.5 opacity-60" />
            </button>
          ) : (
            <button
              onClick={manageAccount}
              title="Central de Segurança"
              className="h-10 w-10 mx-auto flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <KeyRound className="h-4 w-4 text-blue-400" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top App Header (OneUI Header Bar) */}
        <header
          id="page-header"
          className="sticky top-0 z-40 h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Abrir menu lateral"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb Context Navigation */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span>{pageContext.category}</span>
              <span>/</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                {pageContext.title}
              </span>
            </div>

            {/* Quick Search Input (OneUI Header Search) */}
            <form
              onSubmit={handleQuickSearch}
              className="hidden lg:flex items-center relative max-w-xs w-full ml-4"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar tarefas..."
                className="w-full h-8 pl-8 pr-3 text-xs bg-slate-100 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </form>
          </div>

          {/* Right Header Controls (OneUI User Dropdown & Theme Toggle) */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* Reusable UserDropdown Component */}
            <UserDropdown
              user={user}
              isAdmin={isAdmin}
              onLogout={logout}
              onManageAccount={manageAccount}
            />
          </div>
        </header>

        {/* Page Content */}
        <main id="main-container" className="flex-1 container mx-auto px-4 sm:px-6 py-8 max-w-6xl">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 py-4 px-6 text-center text-xs text-slate-500 dark:text-slate-400">
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>AppStart — Template Pedagógico Full Stack (NestJS & React)</span>
            <span className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-blue-500" />
              Sessão OIDC protegida por cookies HTTP-only
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
