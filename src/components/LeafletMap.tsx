import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { EmergencyService, ServiceCategory } from '@/types';
import { Icons } from '@/components/Icons';

interface LeafletMapProps {
  services: EmergencyService[];
  userLat?: number | null;
  userLng?: number | null;
  className?: string;
  onServiceSelect?: (service: EmergencyService) => void;
  onRecenter?: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  hospital: '#ef4444',
  ambulance: '#dc2626',
  police: '#3b82f6',
  fire: '#f97316',
  ngo: '#22c55e',
};

const CATEGORY_EMOJI: Record<string, string> = {
  hospital: '🏥',
  ambulance: '🚑',
  police: '🚓',
  fire: '🚒',
  ngo: '💚',
};

function createServiceIcon(category: string) {
  const color = CATEGORY_COLORS[category] || '#6b7280';
  const emoji = CATEGORY_EMOJI[category] || '📍';

  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <span style="transform: rotate(45deg); font-size: 16px;">${emoji}</span>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
}

function createUserIcon() {
  return L.divIcon({
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background: #3b82f6;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.25), 0 2px 8px rgba(0,0,0,0.3);
        animation: pulse-ring 2s ease-out infinite;
      "></div>
    `,
    className: 'user-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

export function LeafletMap({
  services,
  userLat,
  userLng,
  className = '',
  onServiceSelect,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const hasLocation = userLat != null && userLng != null;

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const center: L.LatLngExpression = hasLocation
      ? [userLat!, userLng!]
      : [23.8103, 90.4125]; // Default to Dhaka

    const map = L.map(mapContainerRef.current, {
      center,
      zoom: hasLocation ? 14 : 12,
      zoomControl: false,
    });

    // OSM tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Zoom control top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update user marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (hasLocation) {
      userMarkerRef.current = L.marker([userLat!, userLng!], {
        icon: createUserIcon(),
        zIndexOffset: 1000,
      })
        .addTo(mapRef.current)
        .bindPopup('<strong>📍 Your Current Location</strong>');

      mapRef.current.setView([userLat!, userLng!], mapRef.current.getZoom());
    }
  }, [hasLocation, userLat, userLng]);

  // Update service markers
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const bounds = L.latLngBounds([]);

    if (hasLocation) {
      bounds.extend([userLat!, userLng!]);
    }

    services.forEach((service) => {
      if (!service.latitude || !service.longitude) return;

      const marker = L.marker([service.latitude, service.longitude], {
        icon: createServiceIcon(service.category),
      });

      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${service.latitude},${service.longitude}`;

      marker.bindPopup(`
        <div style="min-width: 200px; font-family: system-ui, sans-serif;">
          <h3 style="font-weight: 700; font-size: 14px; margin: 0 0 6px 0; color: #1a1a2e;">
            ${CATEGORY_EMOJI[service.category] || '📍'} ${service.name}
          </h3>
          <p style="color: #666; font-size: 12px; margin: 0 0 4px 0;">📍 ${service.address}</p>
          ${service.phone ? `<p style="font-size: 12px; margin: 0 0 4px 0;"><a href="tel:${service.phone}" style="color: #3b82f6; text-decoration: none;">📞 ${service.phone}</a></p>` : ''}
          ${service.distance !== undefined ? `<p style="font-size: 11px; color: #888; margin: 0 0 8px 0;">📏 ${service.distance.toFixed(1)} km away</p>` : ''}
          <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="
            display: inline-block;
            background: #3b82f6;
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            text-decoration: none;
            font-weight: 600;
          ">🧭 Get Directions</a>
        </div>
      `);

      marker.on('click', () => {
        onServiceSelect?.(service);
      });

      marker.addTo(markersLayerRef.current!);
      bounds.extend([service.latitude, service.longitude]);
    });

    if (bounds.isValid() && services.length > 0) {
      mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [services, hasLocation, userLat, userLng, onServiceSelect]);

  const handleRecenter = useCallback(() => {
    if (mapRef.current && hasLocation) {
      mapRef.current.setView([userLat!, userLng!], 14, { animate: true });
    }
  }, [hasLocation, userLat, userLng]);

  return (
    <div className={`relative rounded-xl overflow-hidden border border-border ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Recenter button */}
      {hasLocation && (
        <button
          onClick={handleRecenter}
          className="absolute bottom-16 right-3 z-[1000] bg-card hover:bg-accent text-foreground w-10 h-10 rounded-full shadow-lg border border-border flex items-center justify-center transition-colors"
          title="Recenter to your location"
        >
          <Icons.Navigation className="h-5 w-5 text-primary" />
        </button>
      )}

      {/* Location info overlay */}
      <div className="absolute bottom-3 left-3 right-3 z-[1000]">
        <div className="bg-card/95 backdrop-blur rounded-lg p-3 shadow-lg border border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <Icons.MapPin className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              {hasLocation ? (
                <>
                  <p className="text-sm font-medium text-foreground">📍 Your Location</p>
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

      {/* No location permission message */}
      {!hasLocation && (
        <div className="absolute inset-0 z-[999] bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center p-6">
            <Icons.AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground mb-1">Location Access Required</p>
            <p className="text-xs text-muted-foreground">Please allow location access to use emergency services.</p>
          </div>
        </div>
      )}
    </div>
  );
}
