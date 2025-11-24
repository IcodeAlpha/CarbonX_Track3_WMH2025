import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


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
  tokens_earned?: number;
  created_at?: string;
}

interface ContributionMapProps {
  contributions: Contribution[];
  onLocationSelect?: (coordinates: [number, number], address: string) => void;
  height?: string;
  showLocationPicker?: boolean;
  initialCenter?: [number, number];
  initialZoom?: number;
}


const getContributionColor = (type: string): string => {
  switch (type) {
    case 'tree_planting':
      return '#10b981'; 
    case 'water_conservation':
      return '#3b82f6'; 
    case 'solar_panels':
      return '#eab308'; 
    case 'gardening':
      return '#ec4899'; 
    case 'composting':
      return '#8b5cf6'; 
    default:
      return '#6366f1'; 
  }
};


const getContributionIcon = (type: string): string => {
  switch (type) {
    case "tree_planting":
      return "🌳";
    case "solar_panels":
      return "☀️";
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


const createCustomMarker = (type: string): L.DivIcon => {
  const color = getContributionColor(type);
  const emoji = getContributionIcon(type);
  
  return L.divIcon({
    html: `
      <div style="
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        cursor: pointer;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        background-color: ${color};
        color: white;
        transition: transform 0.2s ease;
      " 
      onmouseover="this.style.transform='scale(1.15)'"
      onmouseout="this.style.transform='scale(1)'"
      >${emoji}</div>
    `,
    className: 'custom-contribution-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};


const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await response.json();
    return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};


const formatTimeAgo = (dateString?: string): string => {
  if (!dateString) return '';
  const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const ContributionMap = ({ 
  contributions, 
  onLocationSelect,
  height = '500px',
  showLocationPicker = false,
  initialCenter = [-0.0236, 37.9062], 
  initialZoom = 7
}: ContributionMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectionMarkerRef = useRef<L.Marker | null>(null);
  const [isSelectingLocation, setIsSelectingLocation] = useState(showLocationPicker);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: markerIcon,
      iconRetinaUrl: markerIcon2x,
      shadowUrl: markerShadow,
    });

    
    const mappedContributions = contributions.filter(c => c.coordinates);
    let mapCenter: [number, number] = initialCenter;
    let zoom = initialZoom;

    if (mappedContributions.length > 0) {
      
      mapCenter = mappedContributions[0].coordinates!;
      zoom = 10;
    }

    
    const map = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView(mapCenter, zoom);
    
    mapRef.current = map;

    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    
    if (onLocationSelect && showLocationPicker) {
      map.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        
        
        if (selectionMarkerRef.current) {
          map.removeLayer(selectionMarkerRef.current);
        }

      
        const selectionIcon = L.divIcon({
          html: `
            <div style="
              width: 30px;
              height: 30px;
              border-radius: 50%;
              background: #10b981;
              border: 4px solid white;
              box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.3),
                          0 4px 12px rgba(0,0,0,0.3);
              animation: pulse 2s ease-in-out infinite;
            "></div>
            <style>
              @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
              }
            </style>
          `,
          className: 'selection-marker',
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const marker = L.marker([lat, lng], { icon: selectionIcon }).addTo(map);
        selectionMarkerRef.current = marker;

        
        const address = await reverseGeocode(lat, lng);
        onLocationSelect([lat, lng], address);
        
        
        marker.bindPopup(`
          <div class="p-2">
            <div class="font-semibold text-sm mb-1">📍 Selected Location</div>
            <div class="text-xs text-gray-600">${address}</div>
          </div>
        `).openPopup();
      });

      
      map.getContainer().style.cursor = 'crosshair';
    }

    
    mappedContributions.forEach((contribution) => {
      const marker = L.marker(
        contribution.coordinates!,
        { icon: createCustomMarker(contribution.contribution_type) }
      ).addTo(map);
      
      
      const popupContent = `
        <div class="min-w-[250px] p-3">
          <div class="flex items-start gap-2 mb-2">
            <span style="font-size: 24px;">${getContributionIcon(contribution.contribution_type)}</span>
            <div class="flex-1">
              <h3 class="font-semibold text-base">${contribution.title}</h3>
              <p class="text-xs text-gray-600 mt-0.5">${contribution.location}</p>
            </div>
          </div>
          
          ${contribution.userName ? `
            <div class="flex items-center gap-2 mb-2">
              <div class="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                ${contribution.userName.charAt(0).toUpperCase()}
              </div>
              <span class="text-sm font-medium">${contribution.userName}</span>
            </div>
          ` : ''}
          
          <div class="flex items-center gap-3 text-xs text-gray-700 mb-2">
            ${contribution.quantity ? `
              <span class="font-semibold bg-gray-100 px-2 py-1 rounded">
                ${contribution.quantity} ${contribution.unit}
              </span>
            ` : ''}
            ${contribution.tokens_earned ? `
              <span class="font-semibold bg-green-100 text-green-800 px-2 py-1 rounded">
                +${contribution.tokens_earned} tokens
              </span>
            ` : ''}
          </div>
          
          ${contribution.created_at ? `
            <div class="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
              ${formatTimeAgo(contribution.created_at)}
            </div>
          ` : ''}
        </div>
      `;
      
      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup'
      });

      
      marker.on('mouseover', function() {
        this.openPopup();
      });
    });

   
    if (mappedContributions.length > 1) {
      const bounds = L.latLngBounds(
        mappedContributions.map(c => c.coordinates as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [contributions, onLocationSelect, showLocationPicker]);

  return (
    <div 
      ref={containerRef} 
      style={{ height }} 
      className="w-full rounded-lg overflow-hidden shadow-lg"
    />
  );
};

export default ContributionMap;