import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import marker images
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

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

interface ContributionMapProps {
  contributions: Contribution[];
  onLocationSelect?: (coordinates: [number, number]) => void;
}

const getContributionIcon = (type: string) => {
  switch (type) {
    case "tree_planting":
      return "🌳";
    case "home_solar":
    case "solar_panels":
      return "☀️";
    case "rainwater_harvesting":
    case "water_conservation":
      return "💧";
    case "composting":
      return "♻️";
    case "gardening":
      return "🌱";
    default:
      return "🌿";
  }
};

const ContributionMap = ({ contributions, onLocationSelect }: ContributionMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Fix default marker icons
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: markerIcon,
      iconRetinaUrl: markerIcon2x,
      shadowUrl: markerShadow,
    });

    const mappedContributions = contributions.filter(c => c.coordinates);
    // Center on Kenya (Nairobi area) by default
    const mapCenter: [number, number] = mappedContributions.length > 0 
      ? mappedContributions[0].coordinates! 
      : [-0.0236, 37.9062];

    // Initialize map with Kenya-focused zoom
    const zoom = mappedContributions.length > 0 ? 8 : 6.5;
    const map = L.map(containerRef.current).setView(mapCenter, zoom);
    mapRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Add click handler for location selection
    if (onLocationSelect) {
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        onLocationSelect([lat, lng]);
        
        // Add or update selection marker
        if (mapRef.current) {
          // Remove existing selection marker
          mapRef.current.eachLayer((layer) => {
            if (layer instanceof L.Marker && (layer as any)._isSelectionMarker) {
              mapRef.current?.removeLayer(layer);
            }
          });

          // Add new selection marker with green color
          const marker = L.marker([lat, lng], {
            icon: L.divIcon({
              className: 'custom-marker-icon',
              html: `<div style="background: #10b981; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            })
          }).addTo(mapRef.current);
          (marker as any)._isSelectionMarker = true;
        }
      });
    }

    // Add markers
    mappedContributions.forEach((contribution) => {
      const marker = L.marker(contribution.coordinates!).addTo(map);
      
      const popupContent = `
        <div class="p-2">
          <div class="font-semibold flex items-center gap-2">
            <span>${getContributionIcon(contribution.contribution_type)}</span>
            ${contribution.title}
          </div>
          <div class="text-sm text-muted-foreground mt-1">
            ${contribution.location}
          </div>
          ${contribution.userName ? `<div class="text-sm mt-1">By ${contribution.userName}</div>` : ''}
          ${contribution.quantity ? `<div class="text-sm font-medium mt-1">${contribution.quantity} ${contribution.unit}</div>` : ''}
        </div>
      `;
      
      marker.bindPopup(popupContent);
    });

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [contributions]);

  return <div ref={containerRef} className="w-full h-[500px] rounded-lg overflow-hidden" />;
};

export default ContributionMap;
