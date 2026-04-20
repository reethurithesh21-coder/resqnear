import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserLayout } from '@/components/user/UserLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
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
    if (!authLoading && !user) {
      navigate('/auth?redirect=/dashboard');
      return;
    }

    if (user) {
      fetchUserData();
    }
  }, [user, authLoading, navigate]);

  const fetchUserData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();

      if (profile?.full_name) {
        setUserName(profile.full_name);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => navigate('/search')}
          >
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-medium">Find Services</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => navigate('/blood-donors')}
          >
            <div className="h-10 w-10 rounded-full bg-blood/10 flex items-center justify-center">
              <Droplets className="h-5 w-5 text-blood" />
            </div>
            <span className="text-sm font-medium">Blood Donors</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => navigate('/saved')}
          >
            <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <Bookmark className="h-5 w-5 text-secondary" />
            </div>
            <span className="text-sm font-medium">Saved Places</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2 border-emergency text-emergency hover:bg-emergency/10"
            onClick={() => window.location.href = 'tel:112'}
          >
            <div className="h-10 w-10 rounded-full bg-emergency/10 flex items-center justify-center">
              <Phone className="h-5 w-5 text-emergency" />
            </div>
            <span className="text-sm font-medium">Emergency</span>
          </Button>
        </div>
      </div>
    </UserLayout>
  );
}
