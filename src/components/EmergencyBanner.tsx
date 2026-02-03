import { Button } from '@/components/ui/button';
import { Icons } from '@/components/Icons';
import { EMERGENCY_HOTLINES } from '@/types';

export function EmergencyBanner() {
  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="bg-emergency/10 border border-emergency/20 rounded-xl p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emergency animate-pulse-ring">
            <Icons.Phone className="h-5 w-5 text-emergency-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Emergency?</h3>
            <p className="text-sm text-muted-foreground">Call emergency services immediately</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {EMERGENCY_HOTLINES.slice(0, 2).map((hotline) => (
            <Button
              key={hotline.number}
              variant="destructive"
              size="sm"
              onClick={() => handleCall(hotline.number)}
              className="gap-2"
            >
              <Icons.Phone className="h-4 w-4" />
              {hotline.number}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
