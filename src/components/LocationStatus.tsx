import { Icons } from '@/components/Icons';

export function LocationStatus({ 
  loading, 
  error, 
  hasLocation,
  onRetry 
}: { 
  loading: boolean; 
  error: string | null; 
  hasLocation: boolean;
  onRetry: () => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icons.Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Detecting your location...</span>
      </div>
    );
  }

  if (error) {
    return (
      <button 
        onClick={onRetry}
        className="flex items-center gap-2 text-destructive hover:underline"
      >
        <Icons.AlertTriangle className="h-4 w-4" />
        <span className="text-sm">{error} Tap to retry.</span>
      </button>
    );
  }

  if (hasLocation) {
    return (
      <div className="flex items-center gap-2 text-secondary">
        <Icons.MapPin className="h-4 w-4" />
        <span className="text-sm font-medium">Location detected</span>
      </div>
    );
  }

  return null;
}
