import { Icons } from '@/components/Icons';
import { EmergencyService } from '@/types';

interface MapPlaceholderProps {
  services: EmergencyService[];
  userLat?: number | null;
  userLng?: number | null;
  className?: string;
}

export function MapPlaceholder({ services, userLat, userLng, className = '' }: MapPlaceholderProps) {
  const hasLocation = userLat !== null && userLng !== null;

  return (
    <div className={`relative bg-muted rounded-xl overflow-hidden border ${className}`}>
      {/* Grid pattern to simulate map tiles */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
          {Array.from({ length: 48 }).map((_, i) => (
            <div key={i} className="border border-muted-foreground/20" />
          ))}
        </div>
      </div>

      {/* Simulated roads */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted-foreground/30 transform -translate-y-1/2" />
        <div className="absolute top-0 bottom-0 left-1/3 w-1 bg-muted-foreground/30" />
        <div className="absolute top-0 bottom-0 right-1/4 w-0.5 bg-muted-foreground/20" />
        <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-muted-foreground/20" />
      </div>

      {/* Service markers */}
      <div className="absolute inset-0">
        {services.slice(0, 5).map((service, index) => {
          // Distribute markers around the map
          const positions = [
            { top: '30%', left: '25%' },
            { top: '45%', left: '60%' },
            { top: '65%', left: '35%' },
            { top: '25%', left: '70%' },
            { top: '70%', left: '75%' },
          ];
          const pos = positions[index];
          
          return (
            <div
              key={service.place_id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
              style={{ top: pos.top, left: pos.left }}
            >
              <div className="relative">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-primary-foreground animate-pulse">
                  <Icons.MapPin className="h-4 w-4 text-primary-foreground" />
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-card text-card-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border">
                  {service.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* User location marker */}
      {hasLocation && (
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          <div className="relative">
            <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center shadow-lg border-2 border-secondary-foreground">
              <div className="w-2 h-2 bg-secondary-foreground rounded-full" />
            </div>
            {/* Pulse effect */}
            <div className="absolute inset-0 w-6 h-6 bg-secondary rounded-full animate-ping opacity-30" />
          </div>
        </div>
      )}

      {/* Map controls mockup */}
      <div className="absolute top-3 right-3 flex flex-col gap-2">
        <button className="w-8 h-8 bg-card rounded shadow flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors">
          <Icons.Plus className="h-4 w-4" />
        </button>
        <button className="w-8 h-8 bg-card rounded shadow flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors">
          <Icons.Minus className="h-4 w-4" />
        </button>
      </div>

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

      {/* "Map placeholder" watermark */}
      <div className="absolute top-3 left-3">
        <span className="text-xs text-muted-foreground/50 bg-background/50 px-2 py-1 rounded">
          Map Preview
        </span>
      </div>
    </div>
  );
}
