import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { CrimeRecord, CrimeCategory } from '../types';
import { getCategoryColor, getSeverityBadgeProps } from '../utils/colors';
import { formatDate, formatHour } from '../utils/formatters';
import { Layers, Eye, EyeOff, MapPin, Flame, Globe } from 'lucide-react';

// Free Tile Layer Definitions (Zero API Key Required)
export type TileProvider = 'dark' | 'osm' | 'light' | 'satellite';

interface TileConfig {
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string;
}

const FREE_TILE_PROVIDERS: Record<TileProvider, TileConfig> = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19,
    subdomains: 'abcd',
  },
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19,
    subdomains: 'abcd',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Open GIS Community',
    maxZoom: 18,
  },
};

export interface CrimeMapProps {
  crimes?: CrimeRecord[];
  markers?: CrimeRecord[];
  selectedCrime?: CrimeRecord | null;
  onSelectCrime?: (crime: CrimeRecord | null) => void;
  onSelectMarker?: (crime: CrimeRecord) => void;
  height?: string;
  showControls?: boolean;
}

export const CrimeMap: React.FC<CrimeMapProps> = ({
  crimes,
  markers,
  selectedCrime,
  onSelectCrime,
  onSelectMarker,
  height = '600px',
  showControls = true,
}) => {
  const activeCrimes = useMemo(() => crimes || markers || [], [crimes, markers]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const heatLayerRef = useRef<L.LayerGroup | null>(null);

  const [tileMode, setTileMode] = useState<TileProvider>('dark');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showMarkers, setShowMarkers] = useState<boolean>(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center of Andhra Pradesh
    const defaultCenter: [number, number] = [15.9129, 79.7400];
    const initialCenter: [number, number] =
      activeCrimes.length > 0 && activeCrimes[0].latitude && activeCrimes[0].longitude
        ? [activeCrimes[0].latitude, activeCrimes[0].longitude]
        : defaultCenter;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: activeCrimes.length > 0 ? 9 : 7,
      zoomControl: false,
      preferCanvas: true,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    heatLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // Fix container size on mount & resize
    const invalidateTimer1 = setTimeout(() => map.invalidateSize(), 150);
    const invalidateTimer2 = setTimeout(() => map.invalidateSize(), 600);

    let resizeObserver: ResizeObserver | null = null;
    if (window.ResizeObserver && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(invalidateTimer1);
      clearTimeout(invalidateTimer2);
      if (resizeObserver) resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Free Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const config = FREE_TILE_PROVIDERS[tileMode] || FREE_TILE_PROVIDERS.dark;
    const tileLayer = L.tileLayer(config.url, {
      maxZoom: config.maxZoom,
      attribution: config.attribution,
      subdomains: config.subdomains || 'abc',
    });

    tileLayer.addTo(mapInstanceRef.current);
    tileLayerRef.current = tileLayer;

    // Invalidate size to guarantee smooth tile loading
    mapInstanceRef.current.invalidateSize();
  }, [tileMode]);

  // Update Markers & Heatmap
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !heatLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    heatLayerRef.current.clearLayers();

    if (activeCrimes.length === 0) return;

    // Build valid coordinate bounds across all records
    const bounds = L.latLngBounds([]);
    const validCrimes = activeCrimes.filter(
      (c) =>
        typeof c.latitude === 'number' &&
        typeof c.longitude === 'number' &&
        !isNaN(c.latitude) &&
        !isNaN(c.longitude) &&
        c.latitude >= 12 &&
        c.latitude <= 20 &&
        c.longitude >= 76 &&
        c.longitude <= 85
    );

    validCrimes.forEach((c) => {
      bounds.extend([c.latitude, c.longitude]);
    });

    // 1. Render Gradient Heatmap Layer
    if (showHeatmap && validCrimes.length > 0) {
      const heatData = validCrimes.map((crime) => {
        const intensity =
          crime.severity === 'CRITICAL'
            ? 1.0
            : crime.severity === 'HIGH'
            ? 0.8
            : crime.severity === 'MEDIUM'
            ? 0.5
            : 0.3;
        return [crime.latitude, crime.longitude, intensity];
      });

      const heatLayer = (L as any).heatLayer(heatData, {
        radius: 26,
        blur: 18,
        maxZoom: 12,
        max: 1.0,
        gradient: {
          0.2: '#3b82f6', // blue (low)
          0.4: '#10b981', // emerald
          0.6: '#eab308', // amber
          0.8: '#f97316', // orange
          1.0: '#ef4444', // red (critical)
        },
      });

      heatLayerRef.current?.addLayer(heatLayer);
    }

    // 2. Render Interactive Marker Pins
    if (showMarkers && validCrimes.length > 0) {
      // Limit to top 200 pins to maintain 60 FPS silky smooth panning
      const markersToRender = validCrimes.slice(0, 200);

      markersToRender.forEach((crime) => {
        const color = getCategoryColor(crime.crimeCategory);
        const severityProps = getSeverityBadgeProps(crime.severity);
        const isSelected = selectedCrime?.caseId === crime.caseId;

        const markerHtml = `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="w-5 h-5 rounded-full flex items-center justify-center shadow-lg transition-transform ${
              isSelected ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-110'
            }" style="background-color: ${color};">
              <div class="w-1.5 h-1.5 rounded-full bg-white shadow-xs"></div>
            </div>
            ${
              isSelected
                ? `<span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>`
                : ''
            }
          </div>
        `;

        const customIcon = L.divIcon({
          html: markerHtml,
          className: 'custom-crime-marker',
          iconSize: [22, 22],
          iconAnchor: [11, 11],
          popupAnchor: [0, -12],
        });

        const marker = L.marker([crime.latitude, crime.longitude], { icon: customIcon });

        const popupContent = `
          <div class="p-3 min-w-[240px] text-slate-900 font-sans">
            <div class="flex items-center justify-between gap-2 border-b border-slate-200 pb-2 mb-2">
              <span class="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white shadow-xs" style="background-color: ${color};">
                ${crime.crimeCategory}
              </span>
              <span class="text-[11px] font-bold px-2 py-0.5 rounded border ${severityProps.border}" style="color: ${severityProps.badgeBg};">
                ${crime.severity}
              </span>
            </div>
            <h4 class="font-bold text-sm text-slate-900">${crime.crimeType}</h4>
            <p class="text-xs text-slate-700 mt-1">${crime.locationName || 'Unknown Precinct Location'}</p>
            <p class="text-xs text-slate-500 font-medium">${crime.district}, ${crime.city || 'AP'}</p>
            
            <div class="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
              <span>${formatDate(crime.date)}</span>
              <span class="font-bold">${formatHour(crime.hour)}</span>
            </div>
            <div class="mt-1 text-[10px] text-slate-400 font-mono">
              Case Ref: ${crime.caseId}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          closeButton: true,
          className: 'crime-leaflet-popup',
        });

        marker.on('click', () => {
          if (onSelectCrime) onSelectCrime(crime);
          if (onSelectMarker) onSelectMarker(crime);
        });

        markersLayerRef.current?.addLayer(marker);
      });
    }

    // Automatically fit bounds smoothly to current filtered crimes
    if (bounds.isValid() && validCrimes.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, {
        padding: [35, 35],
        maxZoom: 12,
        animate: true,
      });
    }
  }, [activeCrimes, showHeatmap, showMarkers]);

  // Smooth Fly-To when an incident is selected
  useEffect(() => {
    if (selectedCrime && mapInstanceRef.current && selectedCrime.latitude && selectedCrime.longitude) {
      mapInstanceRef.current.flyTo([selectedCrime.latitude, selectedCrime.longitude], 14, {
        animate: true,
        duration: 1.0,
      });
    }
  }, [selectedCrime]);

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-900"
      style={{ height }}
    >
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Control Panel */}
      {showControls && (
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl border border-slate-800 shadow-2xl text-xs text-slate-200 min-w-[170px]">
          <div className="flex items-center gap-1.5 font-bold text-[11px] text-slate-300 pb-1.5 border-b border-slate-800">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Map Overlays</span>
          </div>

          <button
            type="button"
            onClick={() => setShowMarkers(!showMarkers)}
            className={`flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-lg transition text-left cursor-pointer ${
              showMarkers ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              Incident Pins
            </span>
            {showMarkers ? <Eye className="w-3 h-3 text-indigo-400" /> : <EyeOff className="w-3 h-3 text-slate-500" />}
          </button>

          <button
            type="button"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-lg transition text-left cursor-pointer ${
              showHeatmap ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              Heatmap Rings
            </span>
            {showHeatmap ? <Eye className="w-3 h-3 text-rose-400" /> : <EyeOff className="w-3 h-3 text-slate-500" />}
          </button>

          {/* Free Tile Provider Switcher */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-400 mb-1.5">
              <Globe className="w-3 h-3 text-indigo-400" />
              <span>Base Map Style</span>
            </div>
            <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setTileMode('dark')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer text-center ${
                  tileMode === 'dark' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Dark
              </button>
              <button
                type="button"
                onClick={() => setTileMode('osm')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer text-center ${
                  tileMode === 'osm' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Street
              </button>
              <button
                type="button"
                onClick={() => setTileMode('light')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer text-center ${
                  tileMode === 'light' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => setTileMode('satellite')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer text-center ${
                  tileMode === 'satellite' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Satellite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Crime Category Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 shadow-2xl max-w-[260px] hidden sm:block max-h-[220px] overflow-y-auto custom-scrollbar">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5 sticky top-0 bg-slate-900/95 backdrop-blur-md pb-1 z-20">
          <span className="w-2 h-2 rounded-full bg-indigo-400" />
          AP Crime Legend ({activeCrimes.length})
        </h4>
        <div className="flex flex-col gap-1.5 text-[10px] text-slate-300">
          {[
            'Murder',
            'Rape',
            'Kidnapping (Women & Girls)',
            'Robbery',
            'Burglary',
            'Theft',
            'Riots',
            'Cheatings',
            'Molestation & Harassment',
            'Other IPC Crimes',
            'Other Crimes',
          ].map((cat) => (
            <div key={cat} className="flex items-center gap-2 w-full truncate">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                style={{ backgroundColor: getCategoryColor(cat as CrimeCategory) }}
              />
              <span className="truncate">{cat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
