/// <reference types="@types/google.maps" />
import { useEffect, useRef, useState, useCallback } from 'react';
import { Icons } from '@/components/Icons';
import { useGoogleMapsKey } from '@/hooks/useGoogleMapsKey';
import { EmergencyService, SERVICE_CATEGORIES } from '@/types';

declare global {
  interface Window {
    google: typeof google;
  }
}

interface GoogleMapProps {
  services: EmergencyService[];
  userLat?: number | null;
  userLng?: number | null;
  className?: string;
  onServiceSelect?: (service: EmergencyService) => void;
}

// Category colors for markers
const CATEGORY_COLORS: Record<string, string> = {
  hospital: '#ef4444',
  ambulance: '#dc2626',
  police: '#3b82f6',
  fire: '#f97316',
  ngo: '#22c55e',
};

export function GoogleMap({ 
  services, 
  userLat, 
  userLng, 
  className = '',
  onServiceSelect 
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  
  const { apiKey, loading: keyLoading, error: keyError } = useGoogleMapsKey();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const hasLocation = userLat !== null && userLng !== null;

  // Load Google Maps script
  useEffect(() => {
    if (!apiKey || scriptLoaded) return;
    
    // Check if already loaded
    if (window.google?.maps) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => console.error('Failed to load Google Maps script');
    document.head.appendChild(script);

    return () => {
      // Don't remove script on cleanup as it might be used elsewhere
    };
  }, [apiKey, scriptLoaded]);

  // Initialize map
  useEffect(() => {
    if (!scriptLoaded || !mapRef.current || mapInstanceRef.current) return;

    const center = hasLocation 
      ? { lat: userLat!, lng: userLng! }
      : { lat: 23.8103, lng: 90.4125 }; // Default to Dhaka

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: hasLocation ? 14 : 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    infoWindowRef.current = new window.google.maps.InfoWindow();
    setMapLoaded(true);
  }, [scriptLoaded, hasLocation, userLat, userLng]);

  // Update user location marker
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;

    // Remove existing user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
      userMarkerRef.current = null;
    }

    if (hasLocation) {
      userMarkerRef.current = new window.google.maps.Marker({
        position: { lat: userLat!, lng: userLng! },
        map: mapInstanceRef.current,
        title: 'Your Location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
        zIndex: 1000,
      });

      mapInstanceRef.current.setCenter({ lat: userLat!, lng: userLng! });
    }
  }, [mapLoaded, hasLocation, userLat, userLng]);

  // Update service markers
  const updateMarkers = useCallback(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    services.forEach(service => {
      if (!service.latitude || !service.longitude) return;

      const color = CATEGORY_COLORS[service.category] || '#6b7280';

      const marker = new window.google.maps.Marker({
        position: { lat: service.latitude, lng: service.longitude },
        map: mapInstanceRef.current!,
        title: service.name,
        icon: {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 1,
          scale: 1.5,
          anchor: new window.google.maps.Point(12, 24),
        },
      });

      marker.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(`
            <div style="padding: 8px; max-width: 200px;">
              <h3 style="font-weight: 600; margin-bottom: 4px;">${service.name}</h3>
              <p style="color: #666; font-size: 12px; margin-bottom: 4px;">${service.address}</p>
              ${service.phone ? `<p style="font-size: 12px;"><a href="tel:${service.phone}" style="color: #3b82f6;">${service.phone}</a></p>` : ''}
              ${service.distance !== undefined ? `<p style="font-size: 11px; color: #888;">${service.distance.toFixed(1)} km away</p>` : ''}
            </div>
          `);
          infoWindowRef.current.open(mapInstanceRef.current!, marker);
        }
        onServiceSelect?.(service);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (services.length > 0 && markersRef.current.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      
      if (hasLocation) {
        bounds.extend({ lat: userLat!, lng: userLng! });
      }
      
      services.forEach(service => {
        if (service.latitude && service.longitude) {
          bounds.extend({ lat: service.latitude, lng: service.longitude });
        }
      });

      mapInstanceRef.current!.fitBounds(bounds, 50);
    }
  }, [services, mapLoaded, hasLocation, userLat, userLng, onServiceSelect]);

  useEffect(() => {
    updateMarkers();
  }, [updateMarkers]);

  // Loading state
  if (keyLoading) {
    return (
      <div className={`relative bg-muted rounded-xl overflow-hidden border flex items-center justify-center ${className}`}>
        <div className="flex flex-col items-center gap-2">
          <Icons.Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (keyError) {
    return (
      <div className={`relative bg-muted rounded-xl overflow-hidden border flex items-center justify-center ${className}`}>
        <div className="flex flex-col items-center gap-2 text-center p-4">
          <Icons.AlertTriangle className="h-8 w-8 text-destructive" />
          <p className="text-sm text-muted-foreground">Failed to load map</p>
          <p className="text-xs text-muted-foreground">{keyError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden border ${className}`}>
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Location info overlay */}
      <div className="absolute bottom-3 left-3 right-3">
        <div className="bg-card/95 backdrop-blur rounded-lg p-3 shadow-lg border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
              <Icons.MapPin className="h-4 w-4 text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              {hasLocation ? (
                <>
                  <p className="text-sm font-medium text-foreground">Your Location</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {userLat?.toFixed(4)}, {userLng?.toFixed(4)}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-foreground">Location Required</p>
                  <p className="text-xs text-muted-foreground">Enable location to see nearby services</p>
                </>
              )}
            </div>
            {services.length > 0 && (
              <div className="text-right">
                <p className="text-sm font-bold text-primary">{services.length}</p>
                <p className="text-xs text-muted-foreground">nearby</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
