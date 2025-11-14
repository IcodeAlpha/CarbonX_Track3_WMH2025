import { lazy, Suspense } from 'react';

interface Contribution {
  id: string;
  title: string;
  location: string;
  contribution_type: string;
  userName?: string;
  quantity?: number;
  unit?: string;
  coordinates?: [number, number];
}

interface ContributionMapWrapperProps {
  contributions: Contribution[];
  onLocationSelect?: (coordinates: [number, number]) => void;
}

// Lazy load to ensure Leaflet only loads on client
const ContributionMap = lazy(() => import('./ContributionMap'));

export const ContributionMapWrapper = ({ contributions, onLocationSelect }: ContributionMapWrapperProps) => {
  return (
    <Suspense fallback={<div className="w-full h-[500px] rounded-lg bg-muted animate-pulse" />}>
      <ContributionMap contributions={contributions} onLocationSelect={onLocationSelect} />
    </Suspense>
  );
};
