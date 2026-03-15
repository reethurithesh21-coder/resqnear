import { Header } from '@/components/Header';
import { EmergencyBanner } from '@/components/EmergencyBanner';
import { CategoryGrid } from '@/components/CategoryGrid';
import { LocationStatus } from '@/components/LocationStatus';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/Icons';
import { useLanguage } from '@/i18n/LanguageContext';

const Index = () => {
  const { latitude, longitude, loading, error, refresh } = useGeolocation();
  const hasLocation = latitude !== null && longitude !== null;
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6 space-y-8">
        {/* Hero Section */}
        <section className="text-center py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t('home.title')} <span className="text-primary">{t('home.titleHighlight')}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            {t('home.subtitle')}
          </p>
          <LocationStatus 
            loading={loading} 
            error={error} 
            hasLocation={hasLocation}
            onRetry={refresh}
          />
        </section>

        {/* One Tap Emergency Connect */}
        <section className="flex justify-center">
          <button
            onClick={() => window.location.href = 'tel:112'}
            className="group relative flex flex-col items-center justify-center w-40 h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-emergency to-emergency/80 shadow-2xl hover:shadow-emergency/40 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 rounded-full bg-emergency/20 animate-ping" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-emergency to-emergency/90 flex flex-col items-center justify-center">
              <Icons.Phone className="h-12 w-12 md:h-14 md:w-14 text-white mb-2" />
              <span className="text-white font-bold text-lg md:text-xl">{t('home.oneTap')}</span>
              <span className="text-white/80 text-xs md:text-sm">{t('home.localHelp')}</span>
            </div>
          </button>
        </section>

        {/* Emergency Banner */}
        <EmergencyBanner />

        {/* Service Categories */}
        <section>
          <h2 className="text-xl font-semibold mb-4">{t('home.whatNeed')}</h2>
          <CategoryGrid />
        </section>

        {/* Blood Donors CTA */}
        <section className="bg-gradient-to-r from-blood/10 to-blood/5 rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blood">
                <Icons.Droplets className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">{t('home.needBlood')}</h3>
                <p className="text-muted-foreground">
                  {t('home.needBloodDesc')}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link to="/blood-donors">{t('home.findDonors')}</Link>
              </Button>
              <Button asChild className="bg-blood hover:bg-blood/90">
                <Link to="/blood-donors?register=true">{t('home.registerDonor')}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Quick Tips */}
        <section className="grid md:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl p-5 border">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-3">
              <Icons.MapPin className="h-5 w-5 text-primary" />
            </div>
            <h4 className="font-semibold mb-1">{t('home.locationBased')}</h4>
            <p className="text-sm text-muted-foreground">
              {t('home.locationBasedDesc')}
            </p>
          </div>
          <div className="bg-card rounded-xl p-5 border">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 mb-3">
              <Icons.Phone className="h-5 w-5 text-secondary" />
            </div>
            <h4 className="font-semibold mb-1">{t('home.oneTapCalling')}</h4>
            <p className="text-sm text-muted-foreground">
              {t('home.oneTapCallingDesc')}
            </p>
          </div>
          <div className="bg-card rounded-xl p-5 border">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 mb-3">
              <Icons.Navigation className="h-5 w-5 text-accent" />
            </div>
            <h4 className="font-semibold mb-1">{t('home.getDirections')}</h4>
            <p className="text-sm text-muted-foreground">
              {t('home.getDirectionsDesc')}
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          <p>{t('home.footer')}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
