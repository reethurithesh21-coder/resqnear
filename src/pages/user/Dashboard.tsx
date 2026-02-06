import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserLayout } from '@/components/user/UserLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useGeolocation } from '@/hooks/useGeolocation';
import { supabase } from '@/integrations/supabase/client';
import { Icons } from '@/components/Icons';
import { BloodDonor, SavedLocation } from '@/types';
import { 
  Search, 
  Droplets, 
  Bookmark, 
  MapPin, 
  Phone,
  Activity,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { latitude, longitude, loading: geoLoading, error: geoError } = useGeolocation();
  
  const [donorProfile, setDonorProfile] = useState<BloodDonor | null>(null);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
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

      // Fetch donor profile
      const { data: donor } = await supabase
        .from('blood_donors')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (donor) {
        setDonorProfile(donor as BloodDonor);
      }

      // Fetch saved locations
      const { data: locations } = await supabase
        .from('saved_locations')
        .select('*')
        .eq('user_id', user.id)
        .limit(5);

      if (locations) {
        setSavedLocations(locations as SavedLocation[]);
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

        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Location Status */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  latitude && longitude ? 'bg-secondary/10' : 'bg-muted'
                }`}>
                  <MapPin className={`h-5 w-5 ${
                    latitude && longitude ? 'text-secondary' : 'text-muted-foreground'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  {geoLoading ? (
                    <p className="text-sm">Detecting...</p>
                  ) : latitude && longitude ? (
                    <>
                      <p className="font-medium text-secondary flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        Active
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Services sorted by distance
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-muted-foreground flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        Not detected
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {geoError || 'Enable location for better results'}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Donor Status */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  donorProfile ? 'bg-blood/10' : 'bg-muted'
                }`}>
                  <Droplets className={`h-5 w-5 ${
                    donorProfile ? 'text-blood' : 'text-muted-foreground'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Donor Status</p>
                  {donorProfile ? (
                    <>
                      <p className="font-medium flex items-center gap-2">
                        <span className="bg-blood text-white text-xs px-2 py-0.5 rounded">
                          {donorProfile.blood_group}
                        </span>
                        {donorProfile.is_available ? (
                          <span className="text-secondary text-sm">Available</span>
                        ) : (
                          <span className="text-muted-foreground text-sm">Unavailable</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {donorProfile.city}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium text-muted-foreground">Not registered</p>
                      <Button
                        variant="link"
                        className="h-auto p-0 text-xs text-blood"
                        onClick={() => navigate('/blood-donors?register=true')}
                      >
                        Register as donor →
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Status */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Platform</p>
                  <p className="font-medium text-secondary flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    All Systems Online
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Services available 24/7
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Saved Locations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Saved Locations</CardTitle>
              <CardDescription>Quick access to your saved places</CardDescription>
            </div>
            {savedLocations.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => navigate('/saved')}>
                View all
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {savedLocations.length === 0 ? (
              <div className="text-center py-8">
                <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">No saved locations yet</p>
                <Button variant="outline" onClick={() => navigate('/search')}>
                  Find & Save Services
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {savedLocations.map((location) => (
                  <div 
                    key={location.id} 
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <MapPin className="h-5 w-5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{location.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {location.address}
                      </p>
                    </div>
                    {location.phone && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => window.location.href = `tel:${location.phone}`}
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
}
