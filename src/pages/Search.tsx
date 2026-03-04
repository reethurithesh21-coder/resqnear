import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { CategoryGrid } from '@/components/CategoryGrid';
import { ServiceCard } from '@/components/ServiceCard';
import { LocationStatus } from '@/components/LocationStatus';
import { GoogleMap } from '@/components/GoogleMap';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icons } from '@/components/Icons';
import { useGeolocation } from '@/hooks/useGeolocation';
import { supabase } from '@/integrations/supabase/client';
import { EmergencyService, ServiceCategory, SERVICE_CATEGORIES } from '@/types';
import { toast } from 'sonner';

const RADIUS_OPTIONS = [
  { value: '1000', label: '1 km' },
  { value: '5000', label: '5 km' },
  { value: '10000', label: '10 km' },
  { value: '25000', label: '25 km' },
];

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | undefined>(
    searchParams.get('category') as ServiceCategory || undefined
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState<EmergencyService[]>([]);
  const [loading, setLoading] = useState(false);
  const [radius, setRadius] = useState('5000');
  
  const { latitude, longitude, loading: locationLoading, error: locationError, refresh } = useGeolocation();
  const hasLocation = latitude !== null && longitude !== null;

  useEffect(() => {
    const category = searchParams.get('category') as ServiceCategory;
    if (category && SERVICE_CATEGORIES.some(c => c.id === category)) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedCategory && hasLocation) {
      setLoading(true);
      const fetchServices = async () => {
        try {
          const { data, error } = await supabase.functions.invoke('search-places', {
            body: {
              latitude,
              longitude,
              category: selectedCategory,
              radius: parseInt(radius),
            },
          });

          if (error) throw error;
          setServices(data?.services || []);
        } catch (err: any) {
          console.error('Failed to fetch services:', err);
          toast.error('Failed to fetch nearby services. Please try again.');
          setServices([]);
        } finally {
          setLoading(false);
        }
      };
      fetchServices();
    }
  }, [selectedCategory, hasLocation, latitude, longitude, radius]);

  const handleCategorySelect = (category: ServiceCategory) => {
    setSelectedCategory(category);
    setSearchParams({ category });
  };

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6 space-y-6">
        {/* Location Status */}
        <div className="flex justify-center">
          <LocationStatus 
            loading={locationLoading} 
            error={locationError} 
            hasLocation={hasLocation}
            onRetry={refresh}
          />
        </div>

        {/* Category Selection */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Select Service Type</h2>
          <CategoryGrid 
            selectedCategory={selectedCategory} 
            onSelect={handleCategorySelect}
            asLinks={false}
          />
        </section>

        {/* Search & Results */}
        {selectedCategory && (
          <section className="space-y-4">
            {/* Map View */}
            <GoogleMap 
              services={filteredServices}
              userLat={latitude}
              userLng={longitude}
              className="h-64 md:h-80"
            />

            <div className="flex gap-3">
              <div className="relative flex-1">
                <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={radius} onValueChange={setRadius}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RADIUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={refresh}>
                <Icons.MapPin className="h-4 w-4" />
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Icons.Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !hasLocation ? (
              <div className="text-center py-12 text-muted-foreground">
                <Icons.MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Enable location to find services near you</p>
                <Button variant="outline" className="mt-4" onClick={refresh}>
                  <Icons.MapPin className="h-4 w-4 mr-2" />
                  Enable Location
                </Button>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Icons.Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No services found matching your search</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredServices.map((service) => (
                  <ServiceCard key={service.place_id} service={service} />
                ))}
              </div>
            )}
          </section>
        )}

        {!selectedCategory && (
          <div className="text-center py-12 text-muted-foreground">
            <Icons.Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select a service category above to start searching</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Search;
