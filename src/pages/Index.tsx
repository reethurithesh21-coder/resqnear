import { Header } from '@/components/Header';
import { EmergencyBanner } from '@/components/EmergencyBanner';
import { CategoryGrid } from '@/components/CategoryGrid';
import { LocationStatus } from '@/components/LocationStatus';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/Icons';

const Index = () => {
  const { latitude, longitude, loading, error, refresh } = useGeolocation();
  const hasLocation = latitude !== null && longitude !== null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6 space-y-8">
        {/* Hero Section */}
        <section className="text-center py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Find Help <span className="text-primary">Near You</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Quickly locate hospitals, ambulance services, police stations, fire stations, 
            NGOs, and blood donors in your area during emergencies.
          </p>
          <LocationStatus 
            loading={loading} 
            error={error} 
            hasLocation={hasLocation}
            onRetry={refresh}
          />
        </section>

        {/* Emergency Banner */}
        <EmergencyBanner />

        {/* Service Categories */}
        <section>
          <h2 className="text-xl font-semibold mb-4">What do you need?</h2>
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
                <h3 className="text-xl font-semibold text-foreground">Need Blood?</h3>
                <p className="text-muted-foreground">
                  Find registered blood donors near you or register as a donor to save lives.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link to="/blood-donors">Find Donors</Link>
              </Button>
              <Button asChild className="bg-blood hover:bg-blood/90">
                <Link to="/blood-donors?register=true">Register as Donor</Link>
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
            <h4 className="font-semibold mb-1">Location-Based</h4>
            <p className="text-sm text-muted-foreground">
              Services are sorted by distance from your current location for quick access.
            </p>
          </div>
          <div className="bg-card rounded-xl p-5 border">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 mb-3">
              <Icons.Phone className="h-5 w-5 text-secondary" />
            </div>
            <h4 className="font-semibold mb-1">One-Tap Calling</h4>
            <p className="text-sm text-muted-foreground">
              Call emergency services instantly with a single tap - no searching for numbers.
            </p>
          </div>
          <div className="bg-card rounded-xl p-5 border">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 mb-3">
              <Icons.Navigation className="h-5 w-5 text-accent" />
            </div>
            <h4 className="font-semibold mb-1">Get Directions</h4>
            <p className="text-sm text-muted-foreground">
              Get turn-by-turn directions to any service with integrated maps navigation.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          <p>ResQNear - Connecting you to emergency services when you need them most.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
