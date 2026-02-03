import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmergencyService } from '@/types';
import { getCategoryIcon, getCategoryColor, Icons } from '@/components/Icons';

interface ServiceCardProps {
  service: EmergencyService;
  onCall?: () => void;
  onDirections?: () => void;
  onViewDetails?: () => void;
}

export function ServiceCard({ service, onCall, onDirections, onViewDetails }: ServiceCardProps) {
  const Icon = getCategoryIcon(service.category);
  const colorClass = getCategoryColor(service.category);

  const handleCall = () => {
    if (service.phone) {
      window.location.href = `tel:${service.phone}`;
    }
    onCall?.();
  };

  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${service.latitude},${service.longitude}`;
    window.open(url, '_blank');
    onDirections?.();
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colorClass}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground truncate">{service.name}</h3>
                <p className="text-sm text-muted-foreground truncate">{service.address}</p>
              </div>
              {service.isOpen !== undefined && (
                <Badge variant={service.isOpen ? 'default' : 'secondary'} className="shrink-0">
                  {service.isOpen ? 'Open' : 'Closed'}
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
              {service.distance !== undefined && (
                <span className="flex items-center gap-1">
                  <Icons.Navigation className="h-3.5 w-3.5" />
                  {service.distance < 1 
                    ? `${Math.round(service.distance * 1000)}m` 
                    : `${service.distance.toFixed(1)}km`
                  }
                </span>
              )}
              {service.rating && (
                <span className="flex items-center gap-1">
                  <Icons.Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  {service.rating.toFixed(1)}
                </span>
              )}
            </div>

            <div className="flex gap-2 mt-3">
              {service.phone && (
                <Button 
                  size="sm" 
                  className="flex-1 gap-2" 
                  onClick={handleCall}
                >
                  <Icons.Phone className="h-4 w-4" />
                  Call
                </Button>
              )}
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1 gap-2"
                onClick={handleDirections}
              >
                <Icons.Navigation className="h-4 w-4" />
                Directions
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
