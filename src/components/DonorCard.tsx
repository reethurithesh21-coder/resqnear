import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BloodDonor } from '@/types';
import { Icons } from '@/components/Icons';

interface DonorCardProps {
  donor: BloodDonor;
  onCall?: () => void;
}

export function DonorCard({ donor, onCall }: DonorCardProps) {
  const handleCall = () => {
    if (donor.show_contact && donor.phone) {
      window.location.href = `tel:${donor.phone}`;
    }
    onCall?.();
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blood text-white font-bold text-lg">
            {donor.blood_group}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground">{donor.full_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {donor.area}, {donor.city}
                </p>
              </div>
              <Badge 
                variant={donor.is_available ? 'default' : 'secondary'}
                className={donor.is_available ? 'bg-secondary' : ''}
              >
                {donor.is_available ? 'Available' : 'Unavailable'}
              </Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
              {donor.distance !== undefined && (
                <span className="flex items-center gap-1">
                  <Icons.Navigation className="h-3.5 w-3.5" />
                  {donor.distance < 1 
                    ? `${Math.round(donor.distance * 1000)}m` 
                    : `${donor.distance.toFixed(1)}km`
                  }
                </span>
              )}
              {donor.last_donation_date && (
                <span className="flex items-center gap-1">
                  <Icons.Clock className="h-3.5 w-3.5" />
                  Last: {new Date(donor.last_donation_date).toLocaleDateString()}
                </span>
              )}
            </div>

            {donor.show_contact && donor.phone && (
              <Button 
                size="sm" 
                className="mt-3 gap-2 bg-blood hover:bg-blood/90" 
                onClick={handleCall}
              >
                <Icons.Phone className="h-4 w-4" />
                Call Donor
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
