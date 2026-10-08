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
import { BrandAssetSlot } from '../brand/brand-asset-slot';
import { ThemeToggle } from '../ui/theme-toggle';
import { UserDropdown } from '../ui/user-dropdown';

/**
 * Chave de persistência do estado da sidebar.
 * Mantida com o nome técnico legado para preservar a preferência já salva
 * pelos usuários (não é exibida na interface).
 */
const SIDEBAR_STORAGE_KEY = 'appstart_sidebar_collapsed';

export function AuthLayout() {
  const { user, isAdmin, logout, manageAccount } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Desktop sidebar collapsed state with localStorage persistence
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
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
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
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

  // The mobile drawer always has room for the complete brand slot.
  const showCompactBrand = isCollapsed && !isMobileOpen;

  return (
    <div className="min-h-screen flex bg-canvas text-body font-sans antialiased">
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-brand-dark/70 backdrop-blur-xs md:hidden animate-in fade-in duration-150"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* OneUI Sidebar (institutional theme) with Edge Floating Toggle Button */}
      <aside
        id="sidebar"
        className={`fixed md:sticky top-0 z-50 h-screen flex flex-col bg-sidebar text-sidebar-fg border-r border-sidebar-line shadow-xl md:shadow-none transition-all duration-300 ease-in-out relative ${
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
          className="hidden md:flex absolute -right-3 top-6 z-50 h-6 w-6 rounded-full bg-sidebar border border-sidebar-line text-sidebar-muted hover:text-sidebar-fg hover:bg-sidebar-active hover:border-sidebar-active shadow-md items-center justify-center transition-all cursor-pointer hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          title={isCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
          aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>

        {/* Sidebar Content Header — Clínica Digital UFPE brand slot */}
        <div
          className={`h-18 flex items-center border-b border-sidebar-line shrink-0 transition-all ${
            showCompactBrand ? 'justify-center px-2' : 'justify-between px-4'
          }`}
        >
          <Link
            to="/"
            aria-label="Clínica Digital UFPE — página inicial"
            className="flex items-center rounded-md text-sidebar-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-indicator"
          >
            {showCompactBrand ? (
              <BrandAssetSlot variant="compact" />
            ) : (
              <BrandAssetSlot variant="header" />
            )}
          </Link>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-sidebar-muted hover:text-sidebar-fg hover:bg-sidebar-hover shrink-0"
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
                <div className="px-3 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-sidebar-muted">
                  {group.heading}
                </div>
              ) : (
                <div className="my-2 border-t border-sidebar-line" />
              )}

              {/* OneUI nav-main-link list */}
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  title={isCollapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg text-sm font-medium transition-colors group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-indicator ${
                      isCollapsed ? 'justify-center h-10 w-10 mx-auto px-0' : 'px-3 py-2'
                    } ${
                      isActive
                        ? 'bg-sidebar-active text-sidebar-fg font-semibold shadow-sm'
                        : 'text-sidebar-muted hover:text-sidebar-fg hover:bg-sidebar-hover'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active indicator (shape cue, not color only) */}
                      {isActive && !isCollapsed && (
                        <span
                          aria-hidden="true"
                          className="absolute -left-3 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r bg-sidebar-indicator"
                        />
                      )}

                      {/* nav-main-link-icon */}
                      <div
                        className={`${
                          isActive
                            ? 'text-sidebar-fg'
                            : 'text-sidebar-muted group-hover:text-sidebar-fg'
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
                                  ? 'bg-sidebar-fg/20 text-sidebar-fg'
                                  : 'bg-sidebar-hover text-sidebar-muted border border-sidebar-line'
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
        <div className="p-3 border-t border-sidebar-line shrink-0">
          {!isCollapsed ? (
            <button
              onClick={manageAccount}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-sidebar-muted hover:text-sidebar-fg hover:bg-sidebar-hover transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <KeyRound className="h-3.5 w-3.5 text-sidebar-indicator" />
                <span>Central de Segurança</span>
              </span>
              <ExternalLink className="h-3.5 w-3.5 opacity-60" />
            </button>
          ) : (
            <button
              onClick={manageAccount}
              title="Central de Segurança"
              aria-label="Central de Segurança"
              className="h-10 w-10 mx-auto flex items-center justify-center rounded-lg text-sidebar-muted hover:text-sidebar-fg hover:bg-sidebar-hover transition-colors cursor-pointer"
            >
              <KeyRound className="h-4 w-4 text-sidebar-indicator" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top App Header (OneUI Header Bar) */}
        <header
          id="page-header"
          className="sticky top-0 z-40 h-18 border-b border-line bg-surface/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-body hover:bg-surface-muted shrink-0"
              aria-label="Abrir menu lateral"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Mobile brand: reduced variant, compact on very narrow viewports */}
            <Link
              to="/"
              aria-label="Clínica Digital UFPE — página inicial"
              data-testid="mobile-brand"
              className="md:hidden flex items-center text-heading rounded-md"
            >
              <BrandAssetSlot variant="compact" className="min-[340px]:hidden" />
              <BrandAssetSlot variant="reduced" className="hidden min-[340px]:inline-flex" />
            </Link>

            {/* Breadcrumb Context Navigation */}
            <div className="hidden md:flex items-center gap-2 text-xs text-muted font-medium">
              <span>{pageContext.category}</span>
              <span aria-hidden="true">/</span>
              <span className="font-bold text-heading text-sm">
                {pageContext.title}
              </span>
            </div>

            {/* Quick Search Input (OneUI Header Search) */}
            <form
              onSubmit={handleQuickSearch}
              className="hidden lg:flex items-center relative max-w-xs w-full ml-4"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar tarefas..."
                aria-label="Buscar tarefas"
                className="w-full h-8 pl-8 pr-3 text-xs text-body bg-surface-muted border border-line rounded-lg placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-focus-ring transition-all"
              />
            </form>
          </div>

          {/* Right Header Controls (OneUI User Dropdown & Theme Toggle) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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

        {/* Footer — institutional NUTES/UFPE lockup */}
        <footer className="border-t border-line bg-surface/60 py-4 px-4 sm:px-6 text-xs text-muted">
          <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-3 text-center lg:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-body">
              <BrandAssetSlot variant="institutional-lockup" />
              <span className="font-bold text-heading">Clínica Digital UFPE</span>
            </div>
            <span className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-accent-text" aria-hidden="true" />
              Sessão OIDC protegida por cookies HTTP-only
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
