import { useEffect, useState, useMemo } from 'react';
import { UserLayout } from '@/components/user/UserLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Icons } from '@/components/Icons';
import { Hospital, Phone, Search, Navigation, MapPin } from 'lucide-react';

interface EmergencyService {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
}

// Extract a city token from a free-text address. We take the last comma-separated
// segment that isn't purely digits (postal code) as a best-effort city name.
function extractCity(address: string): string {
  if (!address) return '';
  const parts = address.split(',').map(p => p.trim()).filter(Boolean);
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i].replace(/\d{4,}/g, '').trim();
    if (p) return p;
  }
  return parts[parts.length - 1] || '';
}

export default function EmergencyServicesPage() {
  const [services, setServices] = useState<EmergencyService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_services')
        .select('*')
        .eq('is_active', true)
        .eq('category', 'hospital')
        .order('name');

      if (error) throw error;
      setServices((data || []) as EmergencyService[]);
    } catch (error) {
      console.error('Error fetching emergency services:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return services;
    return services.filter(s => {
      const city = extractCity(s.address).toLowerCase();
      return (
        city.includes(q) ||
        s.address?.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q)
      );
    });
  }, [services, search]);

  // Group by city for nicer presentation
  const grouped = useMemo(() => {
    const map = new Map<string, EmergencyService[]>();
    filteredServices.forEach(s => {
      const city = extractCity(s.address) || 'Other';
      if (!map.has(city)) map.set(city, []);
      map.get(city)!.push(s);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredServices]);

  const handleNavigate = (s: EmergencyService) => {
    const dest = s.latitude && s.longitude
      ? `${encodeURIComponent(s.name)}/@${s.latitude},${s.longitude}`
      : encodeURIComponent(`${s.name} ${s.address}`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, '_blank');
  };

  if (loading) {
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
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Emergency Services</h1>
          <p className="text-muted-foreground">
            Hospitals registered by administrators — search by city or name
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Available Hospitals ({filteredServices.length})</CardTitle>
                <CardDescription>
                  Find verified hospitals and contact them directly
                </CardDescription>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by city or hospital name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <Hospital className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                {search ? (
                  <>
                    <p className="text-lg font-medium mb-2">No hospitals found</p>
                    <p className="text-muted-foreground">
                      Try a different city or hospital name
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-medium mb-2">No hospitals available yet</p>
                    <p className="text-muted-foreground">
                      Administrators haven't added any hospitals. Please check back later.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {grouped.map(([city, items]) => (
                  <div key={city} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-foreground">{city}</h3>
                      <Badge variant="secondary" className="ml-1">{items.length}</Badge>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {items.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-muted/40 transition-colors"
                        >
                          <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Hospital className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{s.name}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {s.address}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {s.phone && (
                                <Button
                                  size="sm"
                                  onClick={() => (window.location.href = `tel:${s.phone}`)}
                                >
                                  <Phone className="h-4 w-4 mr-1" />
                                  Call
                                </Button>
                              )}
                              {(s.latitude && s.longitude) || s.address ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleNavigate(s)}
                                >
                                  <Navigation className="h-4 w-4 mr-1" />
                                  Directions
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      ))}
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
