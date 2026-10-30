import React, { useState, useEffect } from 'react';
import { MapPin, Layers, Filter, Search, Calendar, ChevronRight, X, ShieldAlert } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { crimeApi } from '../api/endpoints';
import { CrimeRecord, FilterState } from '../types';
import { CrimeMap } from '../maps/CrimeMap';
import { FilterBar } from '../components/common/FilterBar';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { formatDate, formatHour } from '../utils/formatters';
import { getCategoryColor, getSeverityBadgeProps } from '../utils/colors';

export const CrimeMapPage: React.FC = () => {
  const { user } = useAuth();
  const [crimes, setCrimes] = useState<CrimeRecord[]>([]);
  const [selectedCrime, setSelectedCrime] = useState<CrimeRecord | null>(null);
  const [filters, setFilters] = useState<FilterState>({});
  const [filterData, setFilterData] = useState<{
    districts: string[];
    categories: string[];
    years: number[];
  }>({ districts: [], categories: [], years: [] });

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch filter options
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await crimeApi.getFilterOptions();
        setFilterData({
          districts: res.data.districts || [],
          categories: res.data.categories || [],
          years: res.data.years || [],
        });
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    };
    fetchFilters();
  }, []);

  // Fetch crimes for the map
  const fetchMapCrimes = async () => {
    try {
      setLoading(true);
      const res = await crimeApi.getCrimes({
        ...filters,
        search: searchQuery || undefined,
        limit: 150, // Fast, lag-free payload
      });
      setCrimes(res.data.records || []);
    } catch (err) {
      console.error('Failed to load crimes for map:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapCrimes();
  }, [filters]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMapCrimes();
  };

  // Calculate quick stats from current filtered crimes
  const categoryCounts = crimes.reduce<Record<string, number>>((acc, c) => {
    acc[c.crimeCategory] = (acc[c.crimeCategory] || 0) + 1;
    return acc;
  }, {});

  const severityCounts = crimes.reduce<Record<string, number>>((acc, c) => {
    acc[c.severity] = (acc[c.severity] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <MapPin className="w-6 h-6 text-indigo-400" />
            Interactive Spatial Crime Mapping & Hotspots
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Explore coordinate-level incident pins, severity clustering, and multi-district hotspot distributions
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="font-semibold text-white">{crimes.length}</span> records displayed
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          districts={filterData.districts}
          categories={filterData.categories}
          years={filterData.years}
        />

        {/* Text Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by case ID, location name, or specific crime description..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Main Map & Side Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Canvas (3 Cols) */}
        <div className="lg:col-span-3 relative">
          <CrimeMap
            crimes={crimes}
            selectedCrime={selectedCrime}
            onSelectCrime={setSelectedCrime}
            height="620px"
            showControls={true}
          />
          {loading && (
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/95 border border-slate-700/80 backdrop-blur-md shadow-2xl text-xs text-white">
              <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              <span className="font-semibold text-slate-200">Updating Spatial Hotspots...</span>
            </div>
          )}
        </div>

        {/* Right Side Stats Panel (1 Col) */}
        <div className="space-y-4">
          {/* Selected Incident Card */}
          {selectedCrime ? (
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-700/60 shadow-xl relative">
              <button
                type="button"
                onClick={() => setSelectedCrime(null)}
                className="absolute top-3 right-3 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>

              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Selected Incident
              </span>
              <h3 className="text-base font-bold text-white mt-1">{selectedCrime.crimeType}</h3>
              <p className="text-xs text-slate-300 font-mono mt-0.5">ID: {selectedCrime.caseId}</p>

              <div className="mt-3 space-y-2 text-xs border-t border-indigo-900/60 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Category:</span>
                  <span className="font-semibold text-white">{selectedCrime.crimeCategory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">District:</span>
                  <span className="font-semibold text-slate-200">{selectedCrime.district}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Location:</span>
                  <span className="font-semibold text-slate-200 truncate max-w-[150px]">
                    {selectedCrime.locationName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date & Time:</span>
                  <span className="font-semibold text-slate-200">
                    {formatDate(selectedCrime.date)} ({formatHour(selectedCrime.hour)})
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Severity:</span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      getSeverityBadgeProps(selectedCrime.severity).bg
                    } ${getSeverityBadgeProps(selectedCrime.severity).text}`}
                  >
                    {selectedCrime.severity}
                  </span>
                </div>
                <div className="pt-2 border-t border-indigo-900/60 text-[11px] text-slate-300">
                  <p className="font-medium text-slate-400">Description:</p>
                  <p className="mt-0.5 text-slate-300 italic">{selectedCrime.description}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center py-6">
              <MapPin className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-300">No Incident Selected</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Click any pin on the map or select a row below to inspect incident metadata.
              </p>
            </div>
          )}

          {/* Category Breakdown for current selection */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Map Distribution
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
              {Object.entries(categoryCounts).map(([cat, count]) => {
                const percent = Math.round((count / (crimes.length || 1)) * 100);
                const color = getCategoryColor(cat);
                return (
                  <div key={cat} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-medium">{cat}</span>
                      <span className="text-slate-400 font-mono">
                        {count} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${percent}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Severity Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Severity Class Breakdown
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((sev) => {
                const count = severityCounts[sev] || 0;
                const badge = getSeverityBadgeProps(sev);
                return (
                  <div key={sev} className={`p-2 rounded-xl border ${badge.border} ${badge.bg} text-center`}>
                    <span className="text-[10px] font-bold uppercase block text-slate-400">{sev}</span>
                    <span className={`text-base font-black ${badge.text}`}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-3">
          Mapped Incidents Log ({crimes.length} records)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 px-3">Case ID</th>
                <th className="pb-3 px-3">Category</th>
                <th className="pb-3 px-3">Crime Type</th>
                <th className="pb-3 px-3">District / Area</th>
                <th className="pb-3 px-3">Date</th>
                <th className="pb-3 px-3">Hour</th>
                <th className="pb-3 px-3">Severity</th>
                <th className="pb-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {crimes.slice(0, 15).map((crime) => {
                const badge = getSeverityBadgeProps(crime.severity);
                const isSelected = selectedCrime?.caseId === crime.caseId;

                return (
                  <tr
                    key={crime.caseId}
                    className={`hover:bg-slate-800/50 transition cursor-pointer ${
                      isSelected ? 'bg-indigo-950/40' : ''
                    }`}
                    onClick={() => setSelectedCrime(crime)}
                  >
                    <td className="py-3 px-3 font-mono font-medium text-slate-300">{crime.caseId}</td>
                    <td className="py-3 px-3">
                      <span
                        className="inline-block px-2 py-0.5 rounded text-[11px] font-bold text-white"
                        style={{ backgroundColor: getCategoryColor(crime.crimeCategory) }}
                      >
                        {crime.crimeCategory}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-white">{crime.crimeType}</td>
                    <td className="py-3 px-3 text-slate-300">
                      {crime.locationName} ({crime.district})
                    </td>
                    <td className="py-3 px-3 text-slate-400">{formatDate(crime.date)}</td>
                    <td className="py-3 px-3 text-slate-400 font-mono">{formatHour(crime.hour)}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${badge.bg} ${badge.text}`}>
                        {crime.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCrime(crime);
                        }}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1"
                      >
                        <span>Focus</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
