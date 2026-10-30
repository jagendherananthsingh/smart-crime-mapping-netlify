import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { CrimeRecord, CrimeCategory } from '../types';
import { getCategoryColor, getSeverityBadgeProps } from '../utils/colors';
import { formatDate, formatHour } from '../utils/formatters';
import { Layers, Eye, EyeOff, MapPin, Flame, Globe, Radio, RotateCcw } from 'lucide-react';

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

export interface DistrictHotspot {
  district: string;
  latitude: number;
  longitude: number;
  count: number;
  percentage?: number;
  topCategory?: string;
  criticalCount?: number;
  criticalPercentage?: number;
}

export interface CrimeMapProps {
  crimes?: CrimeRecord[];
  markers?: CrimeRecord[];
  hotspots?: DistrictHotspot[];
  heatPoints?: number[][];
  selectedCrime?: CrimeRecord | null;
  onSelectCrime?: (crime: CrimeRecord | null) => void;
  onSelectMarker?: (crime: CrimeRecord) => void;
  onSelectDistrict?: (district: string) => void;
  height?: string;
  showControls?: boolean;
}

const AP_STATE_CENTER: [number, number] = [15.9129, 79.7400];

export const CrimeMap: React.FC<CrimeMapProps> = ({
  crimes,
  markers,
  hotspots = [],
  heatPoints,
  selectedCrime,
  onSelectCrime,
  onSelectMarker,
  onSelectDistrict,
  height = '620px',
  showControls = true,
}) => {
  const activeCrimes = useMemo(() => crimes || markers || [], [crimes, markers]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const hotspotsLayerRef = useRef<L.LayerGroup | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const heatLayerRef = useRef<L.LayerGroup | null>(null);

  const [tileMode, setTileMode] = useState<TileProvider>('dark');
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showMarkers, setShowMarkers] = useState<boolean>(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: AP_STATE_CENTER,
      zoom: 7,
      minZoom: 6,
      maxZoom: 18,
      zoomControl: false,
      preferCanvas: true,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Create layer groups in stacking order
    hotspotsLayerRef.current = L.layerGroup().addTo(map);
    heatLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // Fix container size & layout
    const timer1 = setTimeout(() => map.invalidateSize(), 100);
    const timer2 = setTimeout(() => map.invalidateSize(), 400);

    let resizeObserver: ResizeObserver | null = null;
    if (window.ResizeObserver && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      if (resizeObserver) resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Tile Layer
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
    mapInstanceRef.current.invalidateSize();
  }, [tileMode]);

  // Update District Hotspot Cluster Hubs
  useEffect(() => {
    if (!mapInstanceRef.current || !hotspotsLayerRef.current) return;
    hotspotsLayerRef.current.clearLayers();

    if (!showHotspots || hotspots.length === 0) return;

    const maxCount = Math.max(...hotspots.map((h) => h.count), 1);

    hotspots.forEach((h) => {
      if (!h.latitude || !h.longitude) return;

      const ratio = h.count / maxCount;
      const radiusMeters = Math.min(38000, Math.max(12000, Math.round(ratio * 34000)));

      // Color coding based on incident intensity
      const haloColor =
        ratio > 0.75
          ? '#ef4444' // Critical (Red)
          : ratio > 0.45
          ? '#f97316' // Elevated (Orange)
          : ratio > 0.25
          ? '#eab308' // Moderate (Amber)
          : '#6366f1'; // Normal (Indigo)

      // 1. Density Ring Halo
      const haloCircle = L.circle([h.latitude, h.longitude], {
        radius: radiusMeters,
        color: haloColor,
        weight: 1.5,
        fillColor: haloColor,
        fillOpacity: 0.18,
        dashArray: '4 4',
      });

      // 2. Center Hotspot Hub Badge
      const isCritical = ratio > 0.6;
      const countLabel = h.count >= 1000 ? `${(h.count / 1000).toFixed(1)}k` : `${h.count}`;

      const hubHtml = `
        <div class="group relative flex items-center justify-center cursor-pointer select-none">
          <div class="relative flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/95 border shadow-2xl backdrop-blur-md transition-all duration-200 hover:scale-110" style="border-color: ${haloColor};">
            <span class="w-2 h-2 rounded-full shadow-xs ${isCritical ? 'animate-ping' : ''}" style="background-color: ${haloColor};"></span>
            <span class="text-[11px] font-bold text-white tracking-tight">${h.district}</span>
            <span class="text-[10px] font-mono font-black px-1.5 py-0.2 rounded-md bg-white/10 text-slate-200" style="color: ${haloColor};">${countLabel}</span>
          </div>
        </div>
      `;

      const hubIcon = L.divIcon({
        html: hubHtml,
        className: 'custom-district-hub-marker',
        iconSize: [120, 32],
        iconAnchor: [60, 16],
      });

      const hubMarker = L.marker([h.latitude, h.longitude], { icon: hubIcon });

      const popupHtml = `
        <div class="p-3.5 min-w-[240px] text-slate-900 font-sans">
          <div class="flex items-center justify-between border-b pb-2 mb-2">
            <h4 class="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${haloColor};"></span>
              ${h.district} District Hotspot
            </h4>
            <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded text-white" style="background-color: ${haloColor};">
              ${ratio > 0.6 ? 'HIGH RISK' : 'MONITORED'}
            </span>
          </div>

          <div class="space-y-1.5 text-xs text-slate-700">
            <div class="flex justify-between">
              <span class="text-slate-500">Total Recorded Incidents:</span>
              <span class="font-bold text-slate-900">${h.count.toLocaleString()}</span>
            </div>
            ${
              h.topCategory
                ? `<div class="flex justify-between">
                     <span class="text-slate-500">Leading Crime Type:</span>
                     <span class="font-semibold text-indigo-700">${h.topCategory}</span>
                   </div>`
                : ''
            }
            ${
              h.criticalCount !== undefined
                ? `<div class="flex justify-between">
                     <span class="text-slate-500">High / Critical Events:</span>
                     <span class="font-semibold text-rose-600">${h.criticalCount}</span>
                   </div>`
                : ''
            }
          </div>

          <button
            type="button"
            id="btn-inspect-${h.district.replace(/\s+/g, '-')}"
            class="mt-3 w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition cursor-pointer text-center block"
          >
            Zoom into ${h.district}
          </button>
        </div>
      `;

      hubMarker.bindPopup(popupHtml, { className: 'crime-leaflet-popup' });

      hubMarker.on('popupopen', () => {
        const btn = document.getElementById(`btn-inspect-${h.district.replace(/\s+/g, '-')}`);
        if (btn) {
          btn.onclick = () => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.flyTo([h.latitude, h.longitude], 12, { duration: 1.2 });
            }
            if (onSelectDistrict) onSelectDistrict(h.district);
          };
        }
      });

      hubMarker.on('click', () => {
        if (onSelectDistrict) onSelectDistrict(h.district);
      });

      hotspotsLayerRef.current?.addLayer(haloCircle);
      hotspotsLayerRef.current?.addLayer(hubMarker);
    });
  }, [hotspots, showHotspots]);

  // Update Markers & Heatmap Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !heatLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    heatLayerRef.current.clearLayers();

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

    // 1. Continuous Gradient Heatmap Layer
    if (showHeatmap) {
      const pointsToHeat: [number, number, number][] = [];

      if (heatPoints && heatPoints.length > 0) {
        heatPoints.forEach((p) => {
          if (p.length >= 2) pointsToHeat.push([p[0], p[1], p[2] || 0.6]);
        });
      } else if (validCrimes.length > 0) {
        validCrimes.forEach((crime) => {
          const intensity =
            crime.severity === 'CRITICAL'
              ? 1.0
              : crime.severity === 'HIGH'
              ? 0.8
              : crime.severity === 'MEDIUM'
              ? 0.5
              : 0.35;
          pointsToHeat.push([crime.latitude, crime.longitude, intensity]);
        });
      } else if (hotspots.length > 0) {
        const maxH = Math.max(...hotspots.map((h) => h.count), 1);
        hotspots.forEach((h) => {
          pointsToHeat.push([h.latitude, h.longitude, Math.max(0.4, h.count / maxH)]);
        });
      }

      if (pointsToHeat.length > 0) {
        const heatLayer = (L as any).heatLayer(pointsToHeat, {
          radius: 34,
          blur: 24,
          maxZoom: 13,
          max: 1.0,
          minOpacity: 0.35,
          gradient: {
            0.15: '#3b82f6', // blue (low)
            0.35: '#10b981', // emerald
            0.55: '#eab308', // amber
            0.75: '#f97316', // orange
            1.0: '#ef4444', // red (critical)
          },
        });
        heatLayerRef.current?.addLayer(heatLayer);
      }
    }

    // 2. Precision Incident Pins
    if (showMarkers && validCrimes.length > 0) {
      // Render up to 250 individual pins
      const pins = validCrimes.slice(0, 250);

      pins.forEach((crime) => {
        const color = getCategoryColor(crime.crimeCategory);
        const severityProps = getSeverityBadgeProps(crime.severity);
        const isSelected = selectedCrime?.caseId === crime.caseId;

        const pinHtml = `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="w-5 h-5 rounded-full flex items-center justify-center shadow-lg transition-transform ${
              isSelected ? 'scale-130 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-120'
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

        const pinIcon = L.divIcon({
          html: pinHtml,
          className: 'custom-crime-pin',
          iconSize: [22, 22],
          iconAnchor: [11, 11],
          popupAnchor: [0, -12],
        });

        const marker = L.marker([crime.latitude, crime.longitude], { icon: pinIcon });

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
            <p class="text-xs text-slate-700 mt-1">${crime.locationName || 'Precinct Location'}</p>
            <p class="text-xs text-slate-500 font-medium">${crime.district}, ${crime.city || 'Andhra Pradesh'}</p>
            
            <div class="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
              <span>${formatDate(crime.date)}</span>
              <span class="font-bold">${formatHour(crime.hour)}</span>
            </div>
            <div class="mt-1 text-[10px] text-slate-400 font-mono">
              Ref: ${crime.caseId}
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

    // Auto-fit bounds if we have valid coordinates
    if (validCrimes.length > 0) {
      const bounds = L.latLngBounds(validCrimes.map((c) => [c.latitude, c.longitude]));
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, {
          padding: [45, 45],
          maxZoom: validCrimes.length > 20 ? 11 : 14,
          animate: true,
        });
      }
    }
  }, [activeCrimes, heatPoints, showHeatmap, showMarkers]);

  // Selected crime focus
  useEffect(() => {
    if (selectedCrime && mapInstanceRef.current && selectedCrime.latitude && selectedCrime.longitude) {
      mapInstanceRef.current.flyTo([selectedCrime.latitude, selectedCrime.longitude], 14, {
        animate: true,
        duration: 1.0,
      });
    }
  }, [selectedCrime]);

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(AP_STATE_CENTER, 7, { animate: true, duration: 1.0 });
    }
    if (onSelectDistrict) onSelectDistrict('ALL');
  };

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950"
      style={{ height }}
    >
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Interactive Controls Bar */}
      {showControls && (
        <div className="absolute top-4 right-4 z-[500] flex flex-col gap-2.5 bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl border border-slate-800 shadow-2xl text-xs text-slate-200 min-w-[190px]">
          <div className="flex items-center justify-between font-bold text-[11px] text-slate-300 pb-2 border-b border-slate-800">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Spatial Overlays
            </span>
            <button
              type="button"
              onClick={handleResetView}
              title="Reset to Statewide View"
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Toggle 1: Hotspot Hubs */}
          <button
            type="button"
            onClick={() => setShowHotspots(!showHotspots)}
            className={`flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-lg transition text-left cursor-pointer ${
              showHotspots ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-indigo-400" />
              District Hotspot Hubs
            </span>
            {showHotspots ? <Eye className="w-3 h-3 text-indigo-400" /> : <EyeOff className="w-3 h-3 text-slate-500" />}
          </button>

          {/* Toggle 2: Gradient Heatmap */}
          <button
            type="button"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-lg transition text-left cursor-pointer ${
              showHeatmap ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              Density Rings
            </span>
            {showHeatmap ? <Eye className="w-3 h-3 text-rose-400" /> : <EyeOff className="w-3 h-3 text-slate-500" />}
          </button>

          {/* Toggle 3: Precision Pins */}
          <button
            type="button"
            onClick={() => setShowMarkers(!showMarkers)}
            className={`flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-lg transition text-left cursor-pointer ${
              showMarkers ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Incident Pins ({activeCrimes.length})
            </span>
            {showMarkers ? <Eye className="w-3 h-3 text-emerald-400" /> : <EyeOff className="w-3 h-3 text-slate-500" />}
          </button>

          {/* Free Tile Provider Switcher */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              <Globe className="w-3 h-3 text-indigo-400" />
              <span>Base Map Style</span>
            </div>
            <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
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
      <div className="absolute bottom-4 left-4 z-[500] bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl border border-slate-800 shadow-2xl max-w-[260px] hidden sm:block max-h-[220px] overflow-y-auto custom-scrollbar">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5 sticky top-0 bg-slate-900/95 backdrop-blur-md pb-1 z-20">
          <span className="w-2 h-2 rounded-full bg-indigo-400" />
          Classification Key
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
