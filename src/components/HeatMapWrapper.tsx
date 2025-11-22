// HeatMapWrapper.tsx - Leaflet Heat Map Component

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat'; // Install: npm install leaflet.heat @types/leaflet.heat

interface HeatMapWrapperProps {
  contributions: any[];
  height?: string;
}

export default function HeatMapWrapper({ contributions, height = '600px' }: HeatMapWrapperProps) {
  const mapRef = useRef<L.Map | null>(null);
  const heatLayerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Initialize map centered on Kenya
    const map = L.map(containerRef.current, {
      center: [-0.0236, 37.9062], // Kenya coordinates
      zoom: 7,
      scrollWheelZoom: true,
      zoomControl: true
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    mapRef.current = map;

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !contributions.length) return;

    // Remove existing heat layer
    if (heatLayerRef.current) {
      mapRef.current.removeLayer(heatLayerRef.current);
    }

    // Prepare heat map data
    const heatData = contributions
      .map(contribution => {
        let lat, lng;

        // Handle both coordinate formats: {lat, lng} and [lat, lng]
        if (contribution.coordinates) {
          if (typeof contribution.coordinates === 'object') {
            // Format: {lat: number, lng: number}
            if (contribution.coordinates.lat && contribution.coordinates.lng) {
              lat = contribution.coordinates.lat;
              lng = contribution.coordinates.lng;
            }
            // Format: [lat, lng]
            else if (Array.isArray(contribution.coordinates) && contribution.coordinates.length === 2) {
              lat = contribution.coordinates[0];
              lng = contribution.coordinates[1];
            }
          }
        }

        // Validate coordinates
        if (
          typeof lat === 'number' && 
          typeof lng === 'number' &&
          lat >= -90 && lat <= 90 &&
          lng >= -180 && lng <= 180
        ) {
          // Third value is intensity (0-1), you can adjust based on contribution properties
          const intensity = contribution.quantity ? Math.min(contribution.quantity / 100, 1) : 0.5;
          return [lat, lng, intensity];
        }

        return null;
      })
      .filter(point => point !== null);

    if (heatData.length === 0) return;

    // Create heat layer
    
    const heatLayer = L.heatLayer(heatData, {
      radius: 25, // Size of heat spots
      blur: 15, // Amount of blur
      maxZoom: 17, // Max zoom to aggregate points
      max: 1.0, // Maximum point intensity
      gradient: { // Custom color gradient
        0.0: 'blue',
        0.2: 'cyan',
        0.4: 'lime',
        0.6: 'yellow',
        0.8: 'orange',
        1.0: 'red'
      }
    }).addTo(mapRef.current);

    heatLayerRef.current = heatLayer;

    // Fit map to show all points
    if (heatData.length > 0) {
      const bounds = L.latLngBounds(heatData.map(point => [point[0], point[1]]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [contributions]);

  return (
    <div 
      ref={containerRef} 
      style={{ height, width: '100%' }}
      className="rounded-b-lg"
    />
  );
}