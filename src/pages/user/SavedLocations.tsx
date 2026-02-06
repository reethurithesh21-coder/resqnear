import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserLayout } from '@/components/user/UserLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/Icons';
import { SavedLocation } from '@/types';
import { MapPin, Phone, Trash2, Search, Navigation } from 'lucide-react';

export default function SavedLocationsPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?redirect=/saved');
      return;
    }

    if (user) {
      fetchLocations();
    }
  }, [user, authLoading, navigate]);

  const fetchLocations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_locations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLocations(data as SavedLocation[]);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_locations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLocations(prev => prev.filter(loc => loc.id !== id));
      toast({
        title: 'Location removed',
        description: 'The saved location has been removed.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to remove location.',
        variant: 'destructive',
      });
    }
  };

  const handleNavigate = (location: SavedLocation) => {
    if (location.latitude && location.longitude) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`,
        '_blank'
      );
    }
  };

  const filteredLocations = locations.filter(
    loc =>
      loc.name.toLowerCase().includes(search.toLowerCase()) ||
      loc.address?.toLowerCase().includes(search.toLowerCase()) ||
      loc.category.toLowerCase().includes(search.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      hospital: 'bg-primary/10 text-primary',
      ambulance: 'bg-emergency/10 text-emergency',
      police: 'bg-blue-100 text-blue-700',
      fire: 'bg-orange-100 text-orange-700',
      ngo: 'bg-secondary/10 text-secondary',
    };
    return colors[category] || 'bg-muted text-muted-foreground';
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

  return (
    <UserLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Saved Locations</h1>
          <p className="text-muted-foreground">
            Quick access to your saved emergency services
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>All Saved Places ({locations.length})</CardTitle>
                <CardDescription>
                  Locations you've saved for quick access
                </CardDescription>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search locations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredLocations.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                {search ? (
                  <>
                    <p className="text-lg font-medium mb-2">No matching locations</p>
                    <p className="text-muted-foreground mb-4">
                      Try a different search term
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-medium mb-2">No saved locations yet</p>
                    <p className="text-muted-foreground mb-4">
                      Search for emergency services and save them for quick access
                    </p>
                    <Button onClick={() => navigate('/search')}>
                      Find Services
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLocations.map((location) => (
                  <div 
                    key={location.id} 
                    className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-1">
                        <h3 className="font-semibold truncate">{location.name}</h3>
                        <Badge className={getCategoryColor(location.category)} variant="secondary">
                          {location.category}
                        </Badge>
                      </div>
                      {location.address && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {location.address}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {location.phone && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = `tel:${location.phone}`}
                          >
                            <Phone className="h-4 w-4 mr-1" />
                            Call
                          </Button>
                        )}
                        {location.latitude && location.longitude && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleNavigate(location)}
                          >
                            <Navigation className="h-4 w-4 mr-1" />
                            Directions
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(location.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
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
