import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Icons } from '@/components/Icons';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Search, 
  Droplets, 
  Hospital, 
  User, 
  Settings,
  Menu,
  LogOut,
  Home,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface UserLayoutProps {
  children: ReactNode;
}

const navItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Find Services', url: '/search', icon: Search },
  { title: 'Blood Donors', url: '/blood-donors', icon: Droplets },
  { title: 'Emergency Services', url: '/saved', icon: Hospital },
  { title: 'My Profile', url: '/profile', icon: User },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function UserLayout({ children }: UserLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/home');
  };

  const isActive = (path: string) => location.pathname === path;

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b">
        <Link to="/home" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shrink-0">
            <Icons.Heart className="h-5 w-5 text-primary-foreground" />
          </div>
          {(!collapsed || mobile) && (
            <span className="text-xl font-bold text-foreground">ResQNear</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.url}
            to={item.url}
            onClick={() => mobile && setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive(item.url)
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              collapsed && !mobile && 'justify-center px-2'
            )}
            title={collapsed && !mobile ? item.title : undefined}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {(!collapsed || mobile) && <span>{item.title}</span>}
          </Link>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t space-y-2">
        <Link
          to="/home"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors',
            collapsed && !mobile && 'justify-center px-2'
          )}
          onClick={() => mobile && setMobileOpen(false)}
        >
          <Home className="h-4 w-4 shrink-0" />
          {(!collapsed || mobile) && <span>Back to Home</span>}
        </Link>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-3 text-destructive hover:text-destructive',
            collapsed && !mobile && 'justify-center px-2'
          )}
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {(!collapsed || mobile) && <span>Sign Out</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col border-r bg-card transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <SidebarContent />
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute bottom-20 -right-3 bg-card border rounded-full p-1.5 shadow-sm hover:bg-muted transition-colors z-10"
          style={{ left: collapsed ? '52px' : '248px' }}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </aside>

      {/* Mobile Header & Sidebar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b">
        <div className="flex items-center justify-between p-4">
          <Link to="/home" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Icons.Heart className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">ResQNear</span>
          </Link>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SidebarContent mobile />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto md:p-6 p-4 pt-20 md:pt-6 relative">
        {location.pathname !== '/dashboard' && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="absolute top-20 right-4 md:top-4 md:right-4 z-40 shadow-sm"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        {children}
      </main>
    </div>
  );
}
