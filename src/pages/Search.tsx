import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { CategoryGrid } from '@/components/CategoryGrid';
import { ServiceCard } from '@/components/ServiceCard';
import { LocationStatus } from '@/components/LocationStatus';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/Icons';
import { useGeolocation } from '@/hooks/useGeolocation';
import { EmergencyService, ServiceCategory, SERVICE_CATEGORIES } from '@/types';

// Mock data for demonstration - in production, this would come from Google Places API
const generateMockServices = (category: ServiceCategory, lat: number, lng: number): EmergencyService[] => {
  const categoryInfo = SERVICE_CATEGORIES.find(c => c.id === category);
  const names: Record<ServiceCategory, string[]> = {
    hospital: ['City General Hospital', 'Metro Medical Center', 'Community Health Hospital', 'Regional Medical Center', 'Emergency Care Hospital'],
    ambulance: ['24/7 Ambulance Service', 'Metro Emergency Response', 'City Ambulance', 'Quick Response Ambulance', 'Medical Transport Services'],
    police: ['Central Police Station', 'Metro Police Department', 'City Police Headquarters', 'District Police Office', 'Community Police Station'],
    fire: ['Central Fire Station', 'Metro Fire Department', 'City Fire & Rescue', 'District Fire Station', 'Emergency Fire Services'],
    ngo: ['Red Cross Chapter', 'Community Aid Foundation', 'Helping Hands NGO', 'Relief Foundation', 'Care & Support Center'],
  };

  return names[category].map((name, index) => ({
    place_id: `${category}_${index}`,
    name,
    address: `${100 + index * 50} Main Street, City Center`,
    phone: `+1-555-${String(100 + index).padStart(3, '0')}-${String(1000 + index * 111).slice(0, 4)}`,
    latitude: lat + (Math.random() - 0.5) * 0.05,
    longitude: lng + (Math.random() - 0.5) * 0.05,
    distance: Math.random() * 5,
    rating: 3.5 + Math.random() * 1.5,
    category,
    isOpen: Math.random() > 0.2,
  })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
};

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | undefined>(
    searchParams.get('category') as ServiceCategory || undefined
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState<EmergencyService[]>([]);
  const [loading, setLoading] = useState(false);
  
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
      // Simulate API call - in production, this would be Google Places API
      setTimeout(() => {
        setServices(generateMockServices(selectedCategory, latitude!, longitude!));
        setLoading(false);
      }, 500);
    }
  }, [selectedCategory, hasLocation, latitude, longitude]);

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
