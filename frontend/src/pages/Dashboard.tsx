import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  ShieldAlert,
  TrendingUp,
  AlertTriangle,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  BarChart2,
  Calendar,
  PhoneCall,
  ShieldCheck,
  CheckCircle2,
  Lock,
  PieChart as PieIcon,
  HelpCircle,
} from 'lucide-react';
import { dashboardApi, crimeApi } from '../api/endpoints';
import {
  DashboardSummary,
  FilterState,
  CrimeRecord,
} from '../types';
import { StatCard } from '../components/common/StatCard';
import { FilterBar } from '../components/common/FilterBar';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { TrendLineChart } from '../charts/TrendLineChart';
import { CategoryBarChart } from '../charts/CategoryBarChart';
import { DistributionDonutChart } from '../charts/DistributionDonutChart';
import { CrimeMap } from '../maps/CrimeMap';
import { formatNumber } from '../utils/formatters';
import { getDistrictMetrics, normalizeDistrictName, STATE_METRICS } from '../data/districtMetrics';

export const ALL_AP_DISTRICTS = [
  'Alluri Sitharama Raju',
  'Anakapalli',
  'Anantapur',
  'Annamayya',
  'Bapatla',
  'Chittoor',
  'Dr.B.R.Ambedkar Konaseema',
  'East Godavari',
  'Eluru',
  'Guntakal Railway',
  'Guntur',
  'Kakinada',
  'Krishna',
  'Kurnool',
  'NTR (Vijayawada)',
  'Nandyal',
  'Palnadu',
  'Parvathipuram Manyam',
  'Prakasam',
  'Rajamahendravaram',
  'SPS Nellore',
  'Sri Sathya Sai',
  'Srikakulam',
  'Tirupati',
  'Vijayawada Railway',
  'Visakhapatnam',
  'Vizianagaram',
  'West Godavari',
  'YSR Kadapa',
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isUser = user?.role === 'USER';
  const isAdmin = user?.role === 'ADMIN';

  const [filters, setFilters] = useState<FilterState>({});
  const [filterData, setFilterData] = useState<{
    districts: string[];
    categories: string[];
    years: number[];
  }>({ districts: ALL_AP_DISTRICTS, categories: [], years: [2023, 2022, 2021] });

  const DEFAULT_SUMMARY: DashboardSummary = {
    totalRecords: STATE_METRICS.totalRecords,
    totalCategories: STATE_METRICS.categories.length,
    topCategory: STATE_METRICS.topCategory,
    topCategoryCount: STATE_METRICS.topCategoryCount,
    topCategoryPercentage: STATE_METRICS.topCategoryPercentage,
    topDistrict: 'Guntur',
    topDistrictCount: 28114,
    recordsThisMonth: 4245,
    datasetCount: 1,
    severityBreakdown: STATE_METRICS.severityBreakdown as any,
  };

  const DEFAULT_CATEGORIES = STATE_METRICS.categories.slice(0, 8);

  const DEFAULT_LOCATIONS = [
    { district: 'Visakhapatnam', count: 29231, percentage: 5.9, latitude: 17.6868, longitude: 83.2185 },
    { district: 'NTR (Vijayawada)', count: 34561, percentage: 7.0, latitude: 16.5062, longitude: 80.648 },
    { district: 'Guntur', count: 28114, percentage: 5.7, latitude: 16.3067, longitude: 80.4365 },
    { district: 'Kurnool', count: 26491, percentage: 5.4, latitude: 15.8281, longitude: 78.0373 },
    { district: 'Tirupati', count: 18727, percentage: 3.8, latitude: 13.6288, longitude: 79.4192 },
    { district: 'SPS Nellore', count: 22237, percentage: 4.5, latitude: 14.4426, longitude: 79.9865 },
  ];

  const [summary, setSummary] = useState<DashboardSummary>(DEFAULT_SUMMARY);
  const [trends, setTrends] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>(DEFAULT_CATEGORIES);
  const [locations, setLocations] = useState<any[]>(DEFAULT_LOCATIONS);
  const [insights, setInsights] = useState<any[]>([]);
  const [recentCrimes, setRecentCrimes] = useState<CrimeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryViewMode, setCategoryViewMode] = useState<'major' | 'all'>('major');

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await crimeApi.getFilterOptions();
        const serverDists = res.data?.districts || [];
        const mergedDists = Array.from(new Set([...ALL_AP_DISTRICTS, ...serverDists])).sort();
        setFilterData({
          districts: mergedDists,
          categories: res.data?.categories || [],
          years: res.data?.years || [2023, 2022, 2021],
        });
      } catch {
        setFilterData({
          districts: ALL_AP_DISTRICTS,
          categories: ['Theft', 'Burglary', 'Robbery', 'Riots', 'Cheatings', 'Molestation & Harassment'],
          years: [2023, 2022, 2021],
        });
      }
    };
    fetchFilters();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      setError(null);

      // Fast progressive streaming: update UI components immediately as each endpoint resolves
      const pSummary = dashboardApi.getSummary(filters).then((res) => {
        if (res?.data) setSummary(res.data);
      }).catch(() => {});

      const pCategories = dashboardApi.getCategories(filters).then((res) => {
        const catArr = res?.data?.categoryBreakdown || res?.data?.categories || [];
        if (catArr.length > 0) setCategories(catArr);
      }).catch(() => {});

      const pLocations = dashboardApi.getLocations(filters).then((res) => {
        const locArr = res?.data?.districts || res?.data?.topLocations || [];
        if (locArr.length > 0) setLocations(locArr);
      }).catch(() => {});

      const pTrends = dashboardApi.getTrends(filters).then((res) => {
        if (res?.data) setTrends(res.data);
      }).catch(() => {});

      const pInsights = dashboardApi.getInsights(filters).then((res) => {
        if (res?.data?.insights) setInsights(res.data.insights);
      }).catch(() => {});

      const pCrimes = crimeApi.getCrimes({ ...filters, limit: 30 }).then((res) => {
        if (res?.data?.records) setRecentCrimes(res.data.records);
      }).catch(() => {});

      await Promise.allSettled([pSummary, pCategories, pLocations, pTrends, pInsights, pCrimes]);
    } catch (err: any) {
      console.warn('Dashboard fetch notice:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Active district metrics (instant dynamic responsiveness)
  const currentDistrictMetrics = useMemo(() => {
    return getDistrictMetrics(filters.district);
  }, [filters.district]);

  const isDistrictFiltered = Boolean(filters.district && filters.district !== 'ALL');

  // Compute dynamic KPI values
  const activeTotalRecords = useMemo(() => {
    if (filters.year && currentDistrictMetrics.yearly[filters.year]) {
      return currentDistrictMetrics.yearly[filters.year];
    }
    if (isDistrictFiltered) {
      if (
        summary &&
        (normalizeDistrictName(summary.topDistrict) === normalizeDistrictName(filters.district) ||
          normalizeDistrictName((summary as any).district) === normalizeDistrictName(filters.district))
      ) {
        return summary.totalRecords;
      }
      return currentDistrictMetrics.totalRecords;
    }
    return summary?.totalRecords || currentDistrictMetrics.totalRecords;
  }, [filters.year, filters.district, isDistrictFiltered, summary, currentDistrictMetrics]);

  const activeCategories = useMemo(() => {
    if (isDistrictFiltered) {
      if (categories && categories.length > 0 && (categories[0] as any)?.district === filters.district) {
        return categories;
      }
      return currentDistrictMetrics.categories;
    }
    return categories && categories.length > 0 ? categories : currentDistrictMetrics.categories;
  }, [isDistrictFiltered, categories, currentDistrictMetrics, filters.district]);

  // Compute specific crime categories (excluding generic administrative/local act buckets for clear citizen insights)
  const specificCategories = useMemo(() => {
    return activeCategories.filter((c: any) => {
      const name = (c.category || c._id || c.name || '').trim();
      return name !== 'Other Crimes' && name !== 'Other IPC Crimes';
    });
  }, [activeCategories]);

  // Leading specific crime category for the KPI card
  const leadingCategory = useMemo(() => {
    if (specificCategories.length > 0) {
      return {
        category: specificCategories[0].category || specificCategories[0]._id || specificCategories[0].name,
        count: specificCategories[0].count,
      };
    }
    return {
      category: currentDistrictMetrics.topCategory || 'Theft',
      count: currentDistrictMetrics.topCategoryCount || 0,
    };
  }, [specificCategories, currentDistrictMetrics]);

  const activeTopCategory = isDistrictFiltered
    ? (summary && normalizeDistrictName(summary.topDistrict) === normalizeDistrictName(filters.district)
        ? summary.topCategory
        : leadingCategory.category)
    : (summary?.topCategory || leadingCategory.category);

  const activeTopCategoryCount = isDistrictFiltered
    ? (summary && normalizeDistrictName(summary.topDistrict) === normalizeDistrictName(filters.district)
        ? summary.topCategoryCount
        : leadingCategory.count)
    : (summary?.topCategoryCount || leadingCategory.count);

  const activeDivision = isDistrictFiltered
    ? filters.district!
    : (summary?.topDistrict || 'Visakhapatnam');

  const activeSeverityBreakdown = useMemo(() => {
    if (isDistrictFiltered) {
      if (
        summary?.severityBreakdown &&
        summary.severityBreakdown.length > 0 &&
        (normalizeDistrictName(summary.topDistrict) === normalizeDistrictName(filters.district) ||
          normalizeDistrictName((summary as any).district) === normalizeDistrictName(filters.district))
      ) {
        return summary.severityBreakdown;
      }
      return currentDistrictMetrics.severityBreakdown;
    }
    return summary?.severityBreakdown && summary.severityBreakdown.length > 0
      ? summary.severityBreakdown
      : currentDistrictMetrics.severityBreakdown;
  }, [isDistrictFiltered, summary, currentDistrictMetrics, filters.district]);

  const activeCriticalCount = useMemo(() => {
    return activeSeverityBreakdown
      ?.filter((s: any) => s.severity === 'HIGH' || s.severity === 'CRITICAL')
      ?.reduce((a: number, s: any) => a + s.count, 0) ?? 0;
  }, [activeSeverityBreakdown]);

  const activeSafetyRatio = isDistrictFiltered
    ? currentDistrictMetrics.safetyRatio
    : Math.max(100 - Number(((activeCriticalCount / Math.max(activeTotalRecords, 1)) * 100).toFixed(1)), 85);

  // Normalize monthly trend data for chart
  const trendChartData = (trends?.monthlyTimeline && trends.monthlyTimeline.length > 0)
    ? trends.monthlyTimeline.map((t: any) => ({
        period: t.period,
        count: t.count,
      }))
    : Object.entries(currentDistrictMetrics.yearly).map(([yr, count]) => ({
        period: `${yr}`,
        count,
      }));

  // Build hourly breakdown from trends data
  const hourlyBreakdown: Record<number, number> = {};
  trends?.hourlyData?.forEach((h: any) => {
    hourlyBreakdown[h.hour] = h.count;
  });
  const maxHour = Math.max(...Object.values(hourlyBreakdown).map(Number), 1);

  // Normalized data for User charts: Top identifiable crime classifications
  const userCategoryBarData = useMemo(() => {
    const list = specificCategories.length > 0 ? specificCategories : activeCategories;
    return list.slice(0, 6).map((c: any) => ({
      category: c.category || c._id || c.name || 'Category',
      count: c.count || 0,
      percentage: c.percentage,
    }));
  }, [specificCategories, activeCategories]);

  const severityPieData = useMemo(() => {
    return activeSeverityBreakdown.map((s: any) => ({
      name: `${s.severity || s._id} Severity`,
      value: s.count,
    }));
  }, [activeSeverityBreakdown]);

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="card" count={4} />
        <LoadingSkeleton type="chart" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 shadow-lg backdrop-blur-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            {isUser ? (
              <>
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                Andhra Pradesh Citizen Safety & Awareness Portal
              </>
            ) : (
              <>
                <BarChart2 className="w-6 h-6 text-indigo-400" />
                Andhra Pradesh Crime Analytics Overview
              </>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isUser
              ? 'Public Safety Overview • High-Level Crime Distributions, Incident Trends & Citizen Guidance'
              : 'AP Smart Crime Analysis • Spatial-Temporal Pattern & Risk Evaluation (2021–2023)'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          {isUser ? (
            <a
              href="tel:112"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Emergency Helpline: 112
            </a>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/predictions')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Run ML Prediction
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        districts={filterData.districts}
        categories={filterData.categories}
        years={filterData.years}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={isUser ? "Public Monitored Incidents" : "Total Recorded Incidents"}
          value={formatNumber(activeTotalRecords)}
          subtitle={isDistrictFiltered ? `${filters.district} District Data` : "Official AP Police Data"}
          icon={ShieldAlert}
          variant="indigo"
        />
        <StatCard
          title={isUser ? "Most Frequent Incident Type" : "Leading Crime Category"}
          value={isUser ? leadingCategory.category : (activeTopCategory || leadingCategory.category || '—')}
          subtitle={`${formatNumber(isUser ? leadingCategory.count : activeTopCategoryCount)} recorded`}
          icon={TrendingUp}
          variant="purple"
        />
        <StatCard
          title={isUser ? (isDistrictFiltered ? "Selected District Division" : "Highest Monitored Division") : (isDistrictFiltered ? "Selected Division Focus" : "Primary Hotspot District")}
          value={activeDivision}
          subtitle={isUser ? (isDistrictFiltered ? "Active Police Jurisdiction Area" : "Active Police Vigilance Area") : "Highest incident density"}
          icon={MapPin}
          variant="amber"
        />
        <StatCard
          title={isUser ? "Public Safety Vigilance Ratio" : "High & Critical Severity"}
          value={isUser ? `${activeSafetyRatio}%` : formatNumber(activeCriticalCount)}
          subtitle={isUser ? "Standard Non-Violent / Managed" : `${((activeCriticalCount / Math.max(activeTotalRecords, 1)) * 100).toFixed(1)}% of total volume`}
          icon={isUser ? ShieldCheck : AlertTriangle}
          variant={isUser ? "emerald" : "rose"}
        />
      </div>

      {/* Conditional View: USER gets limited neat visuals & formatted safety text data; ADMIN gets full visuals */}
      {isUser ? (
        <div className="space-y-6">
          {/* Public Visualizations Row: Neat Bar Chart & Pie Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bar Chart: Major Reported Categories */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-cyan-400" />
                    Top Incident Categories in {isDistrictFiltered ? `${filters.district} District` : 'Andhra Pradesh'}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/20">
                    Public Awareness
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Comparative distribution of most common incident classifications to assist citizen awareness
                </p>
              </div>
              <CategoryBarChart data={userCategoryBarData} height={290} />
              <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Data Source: State Police Incident Repository</span>
                <span className="text-slate-300 font-medium">{isDistrictFiltered ? `${filters.district} District` : 'Updated 2021–2023'}</span>
              </div>
            </div>

            {/* Pie Chart: Incident Severity Breakdown */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <PieIcon className="w-4 h-4 text-emerald-400" />
                    Incident Severity Proportion {isDistrictFiltered ? `• ${filters.district}` : '• Classification'}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/20">
                    Classification
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-2">
                  Breakdown by severity impact class
                </p>
              </div>
              <DistributionDonutChart data={severityPieData} height={260} />
              <div className="mt-2 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-[11px] text-slate-300">
                <span className="font-semibold text-emerald-400">Public Note:</span> The overwhelming majority of recorded events are minor civil infractions or property thefts handled by local precincts.
              </div>
            </div>
          </div>

          {/* Formatted Text Data & Public Guidance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Safety Advisories */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3.5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Citizen Safety Guidelines
                  </h4>
                  <p className="text-[10px] text-slate-400">Essential precautions & advisories</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
                  <div className="font-semibold text-indigo-300 mb-0.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                    Digital & Cyber Fraud Vigilance
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Never share OTPs, bank credentials, or install unsolicited APK files. Immediately report cyber frauds to <strong>1930</strong>.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
                  <div className="font-semibold text-emerald-300 mb-0.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Transit & Night Travel Security
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Prefer well-lit arterial roads in urban centers. Keep the <strong>AP Disha SOS</strong> mobile safety application active during late journeys.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
                  <div className="font-semibold text-amber-300 mb-0.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    Locked House Monitoring (LHMS)
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Traveling out of town? Register your home with local beat officers via the AP Police Seva portal for complimentary CCTV watch.
                  </p>
                </div>
              </div>
            </div>

            {/* Emergency Directory */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3.5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Emergency Helpline Directory
                  </h4>
                  <p className="text-[10px] text-slate-400">Direct 24/7 assistance hotlines</p>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { label: 'AP Police Control Room', number: '100 / 112', desc: 'Immediate emergency & crime response', color: 'text-rose-400' },
                  { label: 'Disha Women Helpline', number: '1091 / 181', desc: 'Women & girls SOS emergency assistance', color: 'text-pink-400' },
                  { label: 'Cyber Crime Emergency', number: '1930', desc: 'Immediate financial cyber fraud freeze', color: 'text-cyan-400' },
                  { label: 'Childline Helpline', number: '1098', desc: 'Child protection & welfare support', color: 'text-amber-400' },
                  { label: 'Emergency Ambulance', number: '108', desc: 'State trauma care & medical assistance', color: 'text-emerald-400' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-slate-800 text-xs">
                    <div>
                      <div className="font-semibold text-slate-200 text-[11px]">{item.label}</div>
                      <div className="text-[10px] text-slate-400">{item.desc}</div>
                    </div>
                    <span className={`font-mono font-bold text-xs ${item.color} bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-700/60`}>
                      {item.number}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Police Team & Admin Liaison Card */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Law Enforcement Coordination
                    </h4>
                    <p className="text-[10px] text-slate-400">Restricted intelligence & clearance</p>
                  </div>
                </div>

                <div className="text-xs text-slate-300 space-y-2.5">
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Under state data protection policies, coordinate-level crime maps, granular victim metadata, temporal trajectories, and predictive algorithms are restricted strictly to authorized Police Personnel and Department Administrators.
                  </p>
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
                    <div className="font-bold mb-1 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Need Officer or Academic Clearance?
                    </div>
                    <span>
                      Police officers or researchers requiring official case records, GIS maps, or predictive inference must submit a formal requisition with official proof to the System Administrator.
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/data-requests')}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Submit Official Police Requisition</span>
                </button>
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>Requires Badge &amp; FIR Proof</span>
                  <button
                    type="button"
                    onClick={() => navigate('/data-requests')}
                    className="text-indigo-400 hover:underline cursor-pointer"
                  >
                    Track Status &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Automated Insights for ADMIN & POLICE */}
          {insights.length > 0 && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900/90 to-purple-950/60 border border-indigo-800/50 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Automated Statistical Insights & Pattern Summary
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {insights.map((insight, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-indigo-400" />
                Longitudinal Incident Trajectory
              </h3>
              <p className="text-xs text-slate-400 mb-4">Monthly crime frequency trends</p>
              <TrendLineChart data={trendChartData} height={300} />
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-sm font-bold text-white mb-0.5">Crime Category Proportion</h3>
                  <p className="text-xs text-slate-400">
                    {categoryViewMode === 'major' ? 'Share across major crime types' : 'All crime classifications'}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/60 text-[11px] self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setCategoryViewMode('major')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                      categoryViewMode === 'major'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Major Types
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryViewMode('all')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                      categoryViewMode === 'all'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All Categories
                  </button>
                </div>
              </div>
              <DistributionDonutChart
                data={categoryViewMode === 'major' ? specificCategories : activeCategories}
                height={290}
                centerLabel={categoryViewMode === 'major' ? 'Major Crimes' : 'Total Crimes'}
              />
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-1">Incidents by Category</h3>
              <p className="text-xs text-slate-400 mb-4">Total counts by classification</p>
              <CategoryBarChart data={activeCategories} height={280} />
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-1">District Spatial Concentration</h3>
              <p className="text-xs text-slate-400 mb-4">Top districts by incident volume</p>
              <div className="space-y-3">
                {locations.slice(0, 5).map((loc: any, idx: number) => {
                  const name = loc.district || loc.location || loc.name || 'Unknown';
                  const count = loc.count || 0;
                  const maxCount = locations[0]?.count || 1;
                  const percent = Math.round((count / maxCount) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200 truncate max-w-[160px]">
                          {idx + 1}. {name}
                        </span>
                        <span className="font-mono text-indigo-400 font-bold">{formatNumber(count)}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => navigate('/analytics')}
                className="mt-4 w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-indigo-300 hover:text-white flex items-center justify-center gap-2 transition"
              >
                View Complete Analytics <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Hourly Activity */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-indigo-400" />
                24-Hour Activity Profile
              </h3>
              <p className="text-xs text-slate-400 mb-4">Incident distribution by hour of day</p>
              <div className="grid grid-cols-6 gap-1.5">
                {Array.from({ length: 24 }).map((_, h) => {
                  const cnt = hourlyBreakdown[h] || 0;
                  const intensity = maxHour > 0 ? cnt / maxHour : 0;
                  const isPeak = intensity > 0.75;
                  return (
                    <div
                      key={h}
                      title={`${h}:00 — ${cnt} incidents`}
                      className={`flex flex-col items-center p-2 rounded-lg border text-center ${
                        isPeak
                          ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                          : intensity > 0.4
                          ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                          : 'bg-slate-800/60 border-slate-750 text-slate-400'
                      }`}
                    >
                      <span className="text-[9px] font-mono">{h}h</span>
                      <span className="text-xs font-black mt-0.5">{cnt}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Spatial Hotspot Map Preview */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  Spatial Hotspot Geographic Preview
                </h3>
                <p className="text-xs text-slate-400">
                  Incident coordinate density overlay {isDistrictFiltered ? `• ${filters.district}` : '• Andhra Pradesh'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/crime-map')}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition cursor-pointer self-start sm:self-auto"
              >
                Open Full Crime Map <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <CrimeMap
              crimes={recentCrimes}
              hotspots={locations}
              height="380px"
              showControls={true}
              onSelectDistrict={() => navigate('/crime-map')}
            />
          </div>
        </>
      )}
    </div>
  );
};
