

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat'; 

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

    
    const map = L.map(containerRef.current, {
      center: [-0.0236, 37.9062], 
      zoom: 7,
      scrollWheelZoom: true,
      zoomControl: true
    });

    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    mapRef.current = map;

    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !contributions.length) return;

    if (heatLayerRef.current) {
      mapRef.current.removeLayer(heatLayerRef.current);
    }

    
    const heatData = contributions
      .map(contribution => {
        let lat, lng;

       
        if (contribution.coordinates) {
          if (typeof contribution.coordinates === 'object') {
            
            if (contribution.coordinates.lat && contribution.coordinates.lng) {
              lat = contribution.coordinates.lat;
              lng = contribution.coordinates.lng;
            }
            
            else if (Array.isArray(contribution.coordinates) && contribution.coordinates.length === 2) {
              lat = contribution.coordinates[0];
              lng = contribution.coordinates[1];
            }
          }
        }

        
        if (
          typeof lat === 'number' && 
          typeof lng === 'number' &&
          lat >= -90 && lat <= 90 &&
          lng >= -180 && lng <= 180
        ) {
          
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