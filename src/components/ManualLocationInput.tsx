import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

interface ManualLocationInputProps {
  onLocationSet: (lat: number, lon: number, label: string) => void;
  onClear?: () => void;
  currentLabel?: string | null;
}

export function ManualLocationInput({
  onLocationSet,
  onClear,
  currentLabel,
}: ManualLocationInputProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      // Use OpenStreetMap Nominatim (free, no API key) for geocoding
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&limit=1`;
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'en' },
      });
      const data = await res.json();
      if (!data || data.length === 0) {
        toast.error('Location not found. Try a more specific name or pincode.');
        return;
      }
      const place = data[0];
      const lat = parseFloat(place.lat);
      const lon = parseFloat(place.lon);
      onLocationSet(lat, lon, place.display_name);
      toast.success(`Location set to: ${place.display_name.split(',').slice(0, 2).join(', ')}`);
      setOpen(false);
      setQuery('');
    } catch (err) {
      console.error('Geocoding error:', err);
      toast.error('Failed to find location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (currentLabel) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-sm">
        <MapPin className="h-4 w-4 text-primary shrink-0" />
        <span className="flex-1 truncate">
          Using: <span className="font-medium">{currentLabel.split(',').slice(0, 2).join(', ')}</span>
        </span>
        <button
          onClick={onClear}
          className="p-1 hover:bg-background rounded shrink-0"
          aria-label="Clear manual location"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-primary hover:underline flex items-center gap-1"
      >
        <MapPin className="h-3.5 w-3.5" />
        Wrong location? Enter your city or pincode manually
      </button>
    );
  }

  return (
    <div className="flex gap-2 max-w-md">
      <Input
        autoFocus
        placeholder="City name, area, or pincode (e.g. Bangalore, 560001)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        className="flex-1"
      />
      <Button onClick={handleSearch} disabled={loading || !query.trim()}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Set'}
      </Button>
      <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
