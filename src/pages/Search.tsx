import { useState } from 'react';
import { Header } from '@/components/Header';
import { CategoryGrid } from '@/components/CategoryGrid';
import { LocationStatus } from '@/components/LocationStatus';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/Icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGeolocation } from '@/hooks/useGeolocation';
import { ServiceCategory, EmergencyService } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  Phone,
  MapPin,
  Navigation,
  Star,
  Loader2,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  hospital: 'bg-hospital text-white',
  ambulance: 'bg-ambulance text-white',
  police: 'bg-police text-white',
  fire: 'bg-fire text-white',
  ngo: 'bg-ngo text-white',
};

const CATEGORY_EMOJI: Record<string, string> = {
  hospital: '🏥',
  ambulance: '🚑',
  police: '🚓',
  fire: '🚒',
  ngo: '💚',
};

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<EmergencyService[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const { t } = useLanguage();

  const { latitude, longitude, loading: locationLoading, error: locationError, refresh } = useGeolocation(true);
  const hasLocation = latitude !== null && longitude !== null;

  const EMERGENCY_BUTTONS: { category: ServiceCategory; emoji: string; labelKey: string; color: string }[] = [
    { category: 'ambulance', emoji: '🚑', labelKey: 'search.findAmbulance', color: 'bg-ambulance hover:bg-ambulance/90' },
    { category: 'hospital', emoji: '🏥', labelKey: 'search.findHospital', color: 'bg-hospital hover:bg-hospital/90' },
    { category: 'police', emoji: '🚓', labelKey: 'search.findPolice', color: 'bg-police hover:bg-police/90' },
    { category: 'fire', emoji: '🚒', labelKey: 'search.fireStation', color: 'bg-fire hover:bg-fire/90' },
    { category: 'ngo', emoji: '💚', labelKey: 'search.findNGO', color: 'bg-ngo hover:bg-ngo/90' },
  ];

  const fetchNearbyServices = async (category: ServiceCategory) => {
    if (!hasLocation) {
      toast.error('Please enable location access first.');
      return;
    }

    setSelectedCategory(category);
    setLoadingResults(true);
    setResults([]);

    try {
      const { data, error } = await supabase.functions.invoke('search-places', {
        body: { latitude, longitude, category, radius: 5000 },
      });

      if (error) throw error;

      setResults(data?.services || []);
      if ((data?.services || []).length === 0) {
        toast.info('No nearby services found for this category.');
      }
    } catch (err: any) {
      console.error('Error fetching nearby services:', err);
      toast.error('Failed to fetch nearby services. Please try again.');
    } finally {
      setLoadingResults(false);
    }
  };

  const openInGoogleMaps = (lat: number, lng: number, name: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodeURIComponent(name)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openDirections = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${lat},${lng}&travelmode=driving`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    if (!hasLocation) {
      toast.error('Please enable location access first.');
      return;
    }
    const url = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}/@${latitude},${longitude},14z`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

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

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto flex gap-2">
          <div className="relative flex-1">
            <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder={t('search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-12 h-12 text-base rounded-full border-2 border-border focus-visible:ring-primary shadow-sm"
            />
          </div>
          <button
            onClick={handleSearch}
            className="h-12 px-5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2"
          >
            <Icons.Search className="h-4 w-4" />
            {t('search.placeholder').split(' ')[0]}
          </button>
        </div>

        {/* Emergency Quick Action Buttons */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
            {t('search.quickActions')}
          </h2>
          <p className="text-xs text-muted-foreground mb-3">
            Tap a category to find nearby emergency services
          </p>
          <div className="flex flex-wrap gap-2">
            {EMERGENCY_BUTTONS.map((btn) => (
              <button
                key={btn.category}
                onClick={() => fetchNearbyServices(btn.category)}
                className={`${btn.color} ${
                  selectedCategory === btn.category ? 'ring-2 ring-offset-2 ring-primary' : ''
                } text-white px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95`}
              >
                <span className="text-lg">{btn.emoji}</span>
                {t(btn.labelKey)}
              </button>
            ))}
          </div>
        </section>

        {/* Results Section */}
        {(loadingResults || results.length > 0 || selectedCategory) && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedCategory && (
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setResults([]);
                    }}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                )}
                <h2 className="text-lg font-semibold">
                  {selectedCategory && (
                    <span className="mr-2">{CATEGORY_EMOJI[selectedCategory]}</span>
                  )}
                  Nearby {selectedCategory ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) + 's' : 'Services'}
                </h2>
                {results.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {results.length} found
                  </Badge>
                )}
              </div>
              {selectedCategory && hasLocation && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const query = selectedCategory === 'ngo' ? 'NGO emergency services' : selectedCategory + 's';
                    const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${latitude},${longitude},14z`;
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  View in Maps
                </Button>
              )}
            </div>

            {loadingResults ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Finding nearby {selectedCategory}s...
                </p>
              </div>
            ) : results.length === 0 && selectedCategory ? (
              <div className="text-center py-12 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p className="font-medium">No results found nearby</p>
                <p className="text-sm mt-1">Try expanding your search on Google Maps</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {results.map((service) => (
                  <Card
                    key={service.place_id}
                    className="p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground truncate">
                            {service.name}
                          </h3>
                          {service.isOpen !== null && (
                            <Badge
                              variant={service.isOpen ? 'default' : 'secondary'}
                              className={`text-[10px] shrink-0 ${
                                service.isOpen
                                  ? 'bg-green-500/10 text-green-600 border-green-200'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {service.isOpen ? 'Open' : 'Closed'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-2">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{service.address}</span>
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {service.distance !== undefined && (
                            <span className="flex items-center gap-1">
                              <Navigation className="h-3 w-3" />
                              {service.distance < 1
                                ? `${(service.distance * 1000).toFixed(0)}m`
                                : `${service.distance.toFixed(1)}km`}
                            </span>
                          )}
                          {service.rating && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {service.rating}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        {service.phone && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() =>
                              (window.location.href = `tel:${service.phone}`)
                            }
                          >
                            <Phone className="h-3.5 w-3.5 mr-1" />
                            Call
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            openDirections(service.latitude, service.longitude)
                          }
                        >
                          <Navigation className="h-3.5 w-3.5 mr-1" />
                          Route
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Category Grid (show when no results) */}
        {!selectedCategory && (
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
              {t('search.allCategories')}
            </h2>
            <CategoryGrid
              selectedCategory={undefined}
              onSelect={(cat) => fetchNearbyServices(cat)}
              asLinks={false}
            />
          </section>
        )}

        {!hasLocation && (
          <div className="text-center py-12 text-muted-foreground">
            <Icons.MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('search.enableLocation')}</p>
            <button
              onClick={refresh}
              className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Icons.MapPin className="h-4 w-4 mr-2 inline" />
              {t('search.enableLocationBtn')}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Search;
