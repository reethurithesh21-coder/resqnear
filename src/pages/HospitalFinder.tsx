import { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGeolocation } from '@/hooks/useGeolocation';
import { EmergencyService } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Phone,
  MapPin,
  Navigation,
  Star,
  Loader2,
  Clock,
  Crosshair,
  Hospital,
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const HospitalFinder = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const hospitalMarkersRef = useRef<L.Marker[]>([]);
  const selectedMarkerRef = useRef<L.Marker | null>(null);

  const [hospitals, setHospitals] = useState<EmergencyService[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const lastFetchRef = useRef<string>('');

  const { latitude, longitude, loading: geoLoading, error: geoError, refresh } = useGeolocation(true);
  const hasLocation = latitude !== null && longitude !== null;

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [23.8103, 90.4125],
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update user marker when location changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !hasLocation) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([latitude!, longitude!]);
    } else {
      const userIcon = L.divIcon({
        html: `<div style="width:18px;height:18px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 0 8px rgba(59,130,246,0.6);"></div>`,
        className: '',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      userMarkerRef.current = L.marker([latitude!, longitude!], { icon: userIcon, zIndex: 1000 })
        .addTo(map)
        .bindPopup('<b>📍 You are here</b>');
    }

    map.setView([latitude!, longitude!], map.getZoom() < 13 ? 14 : map.getZoom());
  }, [latitude, longitude, hasLocation]);

  // Fetch hospitals
  const fetchHospitals = useCallback(async () => {
    if (!hasLocation) return;

    const locationKey = `${latitude!.toFixed(3)},${longitude!.toFixed(3)}`;
    if (locationKey === lastFetchRef.current) return;
    lastFetchRef.current = locationKey;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-places', {
        body: { latitude, longitude, category: 'hospital', radius: 10000 },
      });
      if (error) throw error;
      const results: EmergencyService[] = data?.services || [];
      setHospitals(results);
      if (results.length === 0) toast.info('No hospitals found nearby.');
    } catch (err: any) {
      console.error('Hospital fetch error:', err);
      toast.error('Failed to fetch nearby hospitals.');
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, hasLocation]);

  // Auto-fetch when location available/changes
  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  // Update hospital markers on map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    hospitalMarkersRef.current.forEach((m) => m.remove());
    hospitalMarkersRef.current = [];

    hospitals.forEach((h) => {
      if (!h.latitude || !h.longitude) return;

      const icon = L.divIcon({
        html: `<div style="font-size:24px;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3));">🏥</div>`,
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });

      const marker = L.marker([h.latitude, h.longitude], { icon })
        .addTo(map)
        .bindPopup(
          `<div style="min-width:160px">
            <b>${h.name}</b><br/>
            <span style="color:#666;font-size:12px">${h.address}</span><br/>
            ${h.phone ? `<a href="tel:${h.phone}" style="color:#3b82f6;font-size:12px">${h.phone}</a><br/>` : ''}
            ${h.distance !== undefined ? `<span style="font-size:11px;color:#888">${h.distance < 1 ? (h.distance * 1000).toFixed(0) + 'm' : h.distance.toFixed(1) + ' km'} away</span>` : ''}
          </div>`
        );

      marker.on('click', () => {
        setSelectedId(h.place_id || h.name);
        map.setView([h.latitude!, h.longitude!], 16);
      });

      hospitalMarkersRef.current.push(marker);
    });

    // Fit bounds
    if (hospitals.length > 0) {
      const bounds = L.latLngBounds(
        hospitals.filter((h) => h.latitude && h.longitude).map((h) => [h.latitude!, h.longitude!] as [number, number])
      );
      if (hasLocation) bounds.extend([latitude!, longitude!]);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [hospitals, hasLocation, latitude, longitude]);

  const handleHospitalClick = (hospital: EmergencyService) => {
    setSelectedId(hospital.place_id || hospital.name);
    const map = mapInstanceRef.current;
    if (map && hospital.latitude && hospital.longitude) {
      map.setView([hospital.latitude, hospital.longitude], 16);
      // Open the popup for this hospital
      const idx = hospitals.findIndex((h) => (h.place_id || h.name) === (hospital.place_id || hospital.name));
      if (idx >= 0 && hospitalMarkersRef.current[idx]) {
        hospitalMarkersRef.current[idx].openPopup();
      }
    }
  };

  const recenter = () => {
    if (hasLocation && mapInstanceRef.current) {
      mapInstanceRef.current.setView([latitude!, longitude!], 14);
    }
  };

  const openDirections = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${lat},${lng}&travelmode=driving`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Date/Time Bar */}
      <div className="bg-card border-b px-4 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <span className="font-mono text-foreground font-medium">
          {currentTime.toLocaleTimeString()}
        </span>
      </div>

      {/* Location error */}
      {geoError && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-destructive">{geoError}</p>
          <Button size="sm" variant="outline" onClick={refresh}>Retry</Button>
        </div>
      )}

      {/* Map */}
      <div className="relative flex-1 min-h-[50vh]">
        {geoLoading && !hasLocation && (
          <div className="absolute inset-0 z-[1000] bg-background/80 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground font-medium">Detecting your location...</p>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full absolute inset-0" />

        {/* Recenter button */}
        {hasLocation && (
          <button
            onClick={recenter}
            className="absolute bottom-4 right-4 z-[1000] bg-card shadow-lg rounded-full p-3 border hover:bg-accent transition-colors"
            title="Recenter"
          >
            <Crosshair className="h-5 w-5 text-primary" />
          </button>
        )}

        {/* Loading overlay for hospitals */}
        {loading && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-card shadow-lg rounded-full px-4 py-2 border flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm font-medium">Finding hospitals...</span>
          </div>
        )}
      </div>

      {/* Hospital List */}
      <div className="border-t bg-card max-h-[45vh] overflow-y-auto">
        <div className="px-4 py-3 border-b sticky top-0 bg-card z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hospital className="h-5 w-5 text-destructive" />
            <h2 className="font-semibold text-foreground">Nearby Hospitals</h2>
            {hospitals.length > 0 && (
              <Badge variant="secondary" className="text-xs">{hospitals.length}</Badge>
            )}
          </div>
          {hasLocation && (
            <Button size="sm" variant="ghost" onClick={fetchHospitals} disabled={loading}>
              <Navigation className="h-3.5 w-3.5 mr-1" />
              Refresh
            </Button>
          )}
        </div>

        {!hasLocation && !geoLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            <MapPin className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Enable location to find hospitals</p>
            <Button size="sm" className="mt-3" onClick={refresh}>
              <Crosshair className="h-4 w-4 mr-1" /> Enable GPS
            </Button>
          </div>
        ) : hospitals.length === 0 && !loading ? (
          <div className="p-8 text-center text-muted-foreground">
            <Hospital className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No hospitals found nearby</p>
            <p className="text-sm mt-1">Try refreshing or moving to a different area</p>
          </div>
        ) : (
          <div className="divide-y">
            {hospitals.map((h, i) => {
              const id = h.place_id || h.name;
              const isSelected = selectedId === id;
              return (
                <div
                  key={id + i}
                  onClick={() => handleHospitalClick(h)}
                  className={`px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors hover:bg-accent/50 ${
                    isSelected ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                  }`}
                >
                  <div className="text-2xl mt-0.5">🏥</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-foreground text-sm truncate">{h.name}</h3>
                      {h.isOpen !== null && (
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            h.isOpen ? 'border-green-300 text-green-600' : 'text-muted-foreground'
                          }`}
                        >
                          {h.isOpen ? 'Open' : 'Closed'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{h.address}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {h.distance !== undefined && (
                        <span className="flex items-center gap-1">
                          <Navigation className="h-3 w-3" />
                          {h.distance < 1
                            ? `${(h.distance * 1000).toFixed(0)}m`
                            : `${h.distance.toFixed(1)} km`}
                        </span>
                      )}
                      {h.rating && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {h.rating}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    {h.phone && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white h-8 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `tel:${h.phone}`;
                        }}
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        Call
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (h.latitude && h.longitude) openDirections(h.latitude, h.longitude);
                      }}
                    >
                      <Navigation className="h-3 w-3 mr-1" />
                      Route
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalFinder;
