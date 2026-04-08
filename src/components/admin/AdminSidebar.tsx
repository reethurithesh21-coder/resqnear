import { useState } from 'react';
import { LayoutDashboard, Users, Droplets, Building2, Settings, LogOut, ChevronLeft, Menu, X } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const navItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Users & Profiles', url: '/admin/users', icon: Users },
  { title: 'Blood Donors', url: '/admin/donors', icon: Droplets },
  { title: 'Emergency Services', url: '/admin/services', icon: Building2 },
  { title: 'Settings', url: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    sessionStorage.removeItem('admin_authenticated');
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const sidebarContent = (
    <>
      {/* Logo / Brand */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Settings className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <span className="font-bold text-base text-white">ResQNear</span>
            <p className="text-[11px] text-white/50 leading-none mt-0.5">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        <p className="text-[11px] uppercase tracking-wider text-white/30 font-semibold px-3 mb-2">
          Menu
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === '/admin'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </NavLink>
        ))}
      </nav>

      {/* Footer actions */}
      <div className="p-3 border-t border-white/10 space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-white/60 hover:text-white hover:bg-white/10"
          onClick={() => { navigate('/home'); setMobileOpen(false); }}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to App
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-900 text-white shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'md:hidden fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 flex flex-col transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-900 min-h-screen flex-col shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
}
