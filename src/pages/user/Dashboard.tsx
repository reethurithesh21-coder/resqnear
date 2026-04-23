import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserLayout } from '@/components/user/UserLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Icons } from '@/components/Icons';
import { 
  Search, 
  Droplets, 
  Bookmark,
  Phone,
} from 'lucide-react';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/auth?redirect=/dashboard', { replace: true });
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', user.id)
          .maybeSingle();

        if (cancelled) return;
        if (error) {
          console.error('[Dashboard] profile fetch error:', error);
        } else if (profile?.full_name) {
          setUserName(profile.full_name);
        }
      } catch (err) {
        console.error('[Dashboard] unexpected error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <UserLayout>
        <div className="flex justify-center items-center py-24">
          <Icons.Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </UserLayout>
    );
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <UserLayout>
      <div className="space-y-6 max-w-6xl">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {greeting()}, {userName || 'there'}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's your ResQNear dashboard overview
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/search')}
            className="group h-auto py-6 px-4 rounded-xl border border-primary/20 bg-transparent hover:bg-primary/5 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col items-center gap-2 cursor-pointer"
          >
            <div className="h-11 w-11 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">Find Services</span>
          </button>
          <button
            onClick={() => navigate('/blood-donors')}
            className="group h-auto py-6 px-4 rounded-xl border border-blood/20 bg-transparent hover:bg-blood/5 hover:border-blood/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col items-center gap-2 cursor-pointer"
          >
            <div className="h-11 w-11 rounded-full bg-blood/10 group-hover:bg-blood/20 flex items-center justify-center transition-colors">
              <Droplets className="h-5 w-5 text-blood" />
            </div>
            <span className="text-sm font-semibold text-foreground">Blood Donors</span>
          </button>
          <button
            onClick={() => window.location.href = 'tel:112'}
            className="group h-auto py-6 px-4 rounded-xl border border-emergency/30 bg-transparent hover:bg-emergency/5 hover:border-emergency/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col items-center gap-2 cursor-pointer"
          >
            <div className="h-11 w-11 rounded-full bg-emergency/10 group-hover:bg-emergency/20 flex items-center justify-center transition-colors">
              <Phone className="h-5 w-5 text-emergency" />
            </div>
            <span className="text-sm font-semibold text-emergency">Emergency</span>
          </button>
        </div>
      </div>
    </UserLayout>
  );
}
