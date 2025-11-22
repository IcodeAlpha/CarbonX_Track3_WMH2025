import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

interface Contribution {
  id: string;
  title: string;
  location: string;
  contribution_type: string;
  userName?: string;
  quantity?: number;
  unit?: string;
  coordinates?: [number, number];
  tokens_earned?: number;
  created_at?: string;
}

interface ContributionMapWrapperProps {
  contributions: Contribution[];
  onLocationSelect?: (coordinates: [number, number], address: string) => void;
  height?: string;
  showLocationPicker?: boolean;
  initialCenter?: [number, number];
  initialZoom?: number;
}

// Lazy load to ensure Leaflet only loads on client
const ContributionMap = lazy(() => import('./ContributionMap'));

export const ContributionMapWrapper = ({ 
  contributions, 
  onLocationSelect,
  height = '500px',
  showLocationPicker = false,
  initialCenter = [-0.0236, 37.9062], // Nairobi, Kenya
  initialZoom = 7
}: ContributionMapWrapperProps) => {
  return (
    <Suspense 
      fallback={
        <div 
          className="w-full rounded-lg bg-muted flex items-center justify-center"
          style={{ height }}
        >
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      }
    >
      <ContributionMap 
        contributions={contributions}
        onLocationSelect={onLocationSelect}
        height={height}
        showLocationPicker={showLocationPicker}
        initialCenter={initialCenter}
        initialZoom={initialZoom}
      />
    </Suspense>
  );
};