import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { CategoryGrid } from '@/components/CategoryGrid';
import { LocationStatus } from '@/components/LocationStatus';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/Icons';
import { useGeolocation } from '@/hooks/useGeolocation';
import { ServiceCategory, SERVICE_CATEGORIES } from '@/types';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n/LanguageContext';

const GOOGLE_MAPS_QUERIES: Record<string, string> = {
  hospital: 'hospitals',
  ambulance: 'ambulance services',
  police: 'police stations',
  fire: 'fire stations',
  ngo: 'NGO emergency services',
};

const Search = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
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

  const openInGoogleMaps = (category: ServiceCategory) => {
    if (!hasLocation) {
      toast.error('Please enable location access first.');
      return;
    }
    const query = searchQuery || GOOGLE_MAPS_QUERIES[category] || category;
    const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${latitude},${longitude},14z`;
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
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">{t('search.quickActions')}</h2>
          <p className="text-xs text-muted-foreground mb-3">Click any button to open nearby services in Google Maps</p>
          <div className="flex flex-wrap gap-2">
            {EMERGENCY_BUTTONS.map((btn) => (
              <button
                key={btn.category}
                onClick={() => openInGoogleMaps(btn.category)}
                className={`${btn.color} text-white px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95`}
              >
                <span className="text-lg">{btn.emoji}</span>
                {t(btn.labelKey)}
                <span className="text-xs opacity-70">↗</span>
              </button>
            ))}
          </div>
        </section>

        {/* Category Grid */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">{t('search.allCategories')}</h2>
          <CategoryGrid
            selectedCategory={undefined}
            onSelect={(cat) => openInGoogleMaps(cat)}
            asLinks={false}
          />
        </section>

        {!hasLocation && (
          <div className="text-center py-12 text-muted-foreground">
            <Icons.MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('search.enableLocation')}</p>
            <button onClick={refresh} className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
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
