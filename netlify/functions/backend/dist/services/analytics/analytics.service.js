"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const CrimeRecord_1 = require("../../models/CrimeRecord");
const Dataset_1 = require("../../models/Dataset");
const CANONICAL_DISTRICTS = {
    'alluri sitharama raju': ['Alluri Sitharama Raju'],
    'anakapalli': ['Anakapalli'],
    'anantapur': ['Ananthapuramu', 'Anantapur'],
    'ananthapuramu': ['Ananthapuramu', 'Anantapur'],
    'annamayya': ['Annamayya'],
    'bapatla': ['Bapatla'],
    'chittoor': ['Chittoor'],
    'dr.b.r.ambedkar konaseema': ['Dr.B.R.Ambedkar Konaseema', 'Konaseema'],
    'konaseema': ['Dr.B.R.Ambedkar Konaseema', 'Konaseema'],
    'east godavari': ['East Godavari', 'Rajamahendravaram'],
    'rajamahendravaram': ['East Godavari', 'Rajamahendravaram'],
    'eluru': ['Eluru'],
    'guntur': ['Guntur', 'Guntur(U)', 'Guntur(R)'],
    'kakinada': ['Kakinada'],
    'krishna': ['Krishna', 'Vijayawada Railway'],
    'kurnool': ['Kurnool', 'Guntakal Railway'],
    'nandyal': ['Nandyal'],
    'ntr': ['NTR', 'Vijayawada Railway'],
    'ntr (vijayawada)': ['NTR', 'Vijayawada Railway'],
    'vijayawada': ['NTR', 'Vijayawada Railway'],
    'palnadu': ['Palnadu'],
    'parvathipuram manyam': ['Parvathipuram Manyam'],
    'prakasam': ['Prakasam'],
    'sps nellore': ['SPS Nellore', 'Nellore'],
    'nellore': ['SPS Nellore', 'Nellore'],
    's.p.s.r nellore': ['SPS Nellore', 'Nellore'],
    'sri sathya sai': ['Sri Sathya Sai'],
    'srikakulam': ['Srikakulam'],
    'tirupati': ['Tirupathi', 'Tirupati'],
    'tirupathi': ['Tirupathi', 'Tirupati'],
    'visakhapatnam': ['Visakhapatnam', 'Vishakapatnam'],
    'vishakapatnam': ['Visakhapatnam', 'Vishakapatnam'],
    'vizianagaram': ['Vizianagaram'],
    'west godavari': ['West Godavari'],
    'ysr': ['YSR', 'Kadapa', 'YSR Kadapa'],
    'ysr kadapa': ['YSR', 'Kadapa', 'YSR Kadapa'],
    'kadapa': ['YSR', 'Kadapa', 'YSR Kadapa'],
};
const CANONICAL_CATEGORIES = {
    'theft': 'Theft',
    'thefts': 'Theft',
    'burglary': 'Burglary',
    'burglaries': 'Burglary',
    'robbery': 'Robbery',
    'robberies': 'Robbery',
    'murder': 'Murder',
    'murders': 'Murder',
    'cheating': 'Cheatings',
    'cheatings': 'Cheatings',
    'riot': 'Riots',
    'riots': 'Riots',
    'rape': 'Rape',
    'rapes': 'Rape',
    'dacoity': 'Dacoity',
    'dowry death': 'Dowry Deaths',
    'dowry deaths': 'Dowry Deaths',
    'kidnapping (women & girls)': 'Kidnapping (Women & Girls)',
    'kidnapping (others)': 'Kidnapping (Others)',
    'kidnapping': 'Kidnapping (Women & Girls)',
    'molestation & harassment': 'Molestation & Harassment',
    'molestation': 'Molestation & Harassment',
    'harassment': 'Molestation & Harassment',
    'other ipc crimes': 'Other IPC Crimes',
    'other crimes': 'Other Crimes',
    'other': 'Other Crimes',
};
class AnalyticsService {
    static cache = new Map();
    static inFlight = new Map();
    static CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache
    static async withCache(key, fn) {
        const cached = this.cache.get(key);
        if (cached && cached.expiry > Date.now())
            return cached.data;
        if (this.inFlight.has(key)) {
            return this.inFlight.get(key);
        }
        const promise = (async () => {
            try {
                const data = await fn();
                this.cache.set(key, { data, expiry: Date.now() + this.CACHE_TTL });
                return data;
            }
            finally {
                this.inFlight.delete(key);
            }
        })();
        this.inFlight.set(key, promise);
        return promise;
    }
    static prewarm() {
        setTimeout(async () => {
            try {
                await Promise.allSettled([
                    this.getSummary({}),
                    this.getCategoryAnalysis({}),
                    this.getGeographicAnalysis({}),
                    this.getTemporalAnalysis({}),
                ]);
                console.log('[AnalyticsService] Cache pre-warmed for rapid sub-50ms responses');
            }
            catch (e) {
                // non-blocking
            }
        }, 200);
    }
    /**
     * Build MongoDB match stage from filter options with fast indexed canonical resolution
     */
    static buildMatchQuery(filters) {
        const query = {};
        if (filters.startDate || filters.endDate) {
            query.date = {};
            if (filters.startDate)
                query.date.$gte = new Date(filters.startDate);
            if (filters.endDate)
                query.date.$lte = new Date(filters.endDate);
        }
        if (filters.year)
            query.year = Number(filters.year);
        if (filters.month)
            query.month = Number(filters.month);
        if (filters.crimeCategory && filters.crimeCategory !== 'ALL') {
            const catTrim = String(filters.crimeCategory).trim().toLowerCase();
            const exactCat = CANONICAL_CATEGORIES[catTrim] || CANONICAL_CATEGORIES[catTrim.replace(/s$/, '')];
            if (exactCat) {
                query.crimeCategory = exactCat;
            }
            else {
                const baseName = catTrim.replace(/s$/i, '');
                query.crimeCategory = { $regex: new RegExp(`^${baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i') };
            }
        }
        if (filters.district && filters.district !== 'ALL') {
            const dItems = Array.isArray(filters.district) ? filters.district : [filters.district];
            const allAliases = new Set();
            for (const d of dItems) {
                if (!d || d === 'ALL')
                    continue;
                const key = String(d).trim().toLowerCase();
                const aliases = CANONICAL_DISTRICTS[key] || [String(d).trim()];
                aliases.forEach((a) => allAliases.add(a));
            }
            const aliasArray = Array.from(allAliases).filter(Boolean);
            if (aliasArray.length === 1) {
                query.district = aliasArray[0];
            }
            else if (aliasArray.length > 1) {
                query.district = { $in: aliasArray };
            }
        }
        if (filters.city && filters.city !== 'ALL') {
            query.city = { $regex: new RegExp(`^${String(filters.city).trim()}`, 'i') };
        }
        if (filters.severity && filters.severity !== 'ALL') {
            query.severity = String(filters.severity).toUpperCase();
        }
        if (filters.search) {
            query.$or = [
                { locationName: { $regex: filters.search, $options: 'i' } },
                { crimeType: { $regex: filters.search, $options: 'i' } },
                { description: { $regex: filters.search, $options: 'i' } },
                { caseId: { $regex: filters.search, $options: 'i' } },
            ];
        }
        return query;
    }
    /**
     * Get KPI Summary Card Metrics
     */
    static async getSummary(filters = {}) {
        return this.withCache('getSummary_' + JSON.stringify(filters), () => this._getSummary(filters));
    }
    static async _getSummary(filters = {}) {
        const match = this.buildMatchQuery(filters);
        const hasFilter = Object.keys(match).length > 0;
        const [totalRecords, categoryAgg, districtAgg, severityAgg, datasetCount] = await Promise.all([
            hasFilter ? CrimeRecord_1.CrimeRecord.countDocuments(match) : CrimeRecord_1.CrimeRecord.estimatedDocumentCount(),
            CrimeRecord_1.CrimeRecord.aggregate([
                { $match: match },
                { $group: { _id: '$crimeCategory', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
            CrimeRecord_1.CrimeRecord.aggregate([
                { $match: match },
                { $group: { _id: '$district', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 1 },
            ]),
            CrimeRecord_1.CrimeRecord.aggregate([
                { $match: match },
                { $group: { _id: '$severity', count: { $sum: 1 } } },
            ]),
            Dataset_1.Dataset.countDocuments(),
        ]);
        const topCategory = categoryAgg[0]?._id || 'N/A';
        const topCategoryCount = categoryAgg[0]?.count || 0;
        const topDistrict = districtAgg[0]?._id || 'N/A';
        const topDistrictCount = districtAgg[0]?.count || 0;
        // Calculate recent month records based on latest date present in dataset
        const latestRecord = await CrimeRecord_1.CrimeRecord.findOne(match).sort({ date: -1 }).select('date').lean();
        let recordsThisMonth = 0;
        if (latestRecord && latestRecord.date) {
            const maxDate = new Date(latestRecord.date);
            const firstOfMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
            recordsThisMonth = await CrimeRecord_1.CrimeRecord.countDocuments({
                ...match,
                date: { $gte: firstOfMonth, $lte: maxDate },
            });
        }
        return {
            totalRecords,
            totalCategories: categoryAgg.length,
            topCategory,
            topCategoryCount,
            topCategoryPercentage: totalRecords > 0 ? Number(((topCategoryCount / totalRecords) * 100).toFixed(1)) : 0,
            topDistrict,
            topDistrictCount,
            recordsThisMonth,
            datasetCount,
            severityBreakdown: severityAgg.map((s) => ({ severity: s._id, count: s.count })),
        };
    }
    /**
     * Get Temporal Trends (Over Time, Day of Week, Hour, Yearly, Monthly)
     */
    static async getTemporalAnalysis(filters = {}) {
        return this.withCache('getTemporalAnalysis_' + JSON.stringify(filters), () => this._getTemporalAnalysis(filters));
    }
    static async _getTemporalAnalysis(filters = {}) {
        const match = this.buildMatchQuery(filters);
        const [byMonth, byDayOfWeek, byHour, byYear] = await Promise.all([
            // Over time by year-month
            CrimeRecord_1.CrimeRecord.aggregate([
                { $match: match },
                {
                    $group: {
                        _id: { year: '$year', month: '$month' },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } },
            ]),
            // By Day of Week (0-6)
            CrimeRecord_1.CrimeRecord.aggregate([
                { $match: match },
                {
                    $group: {
                        _id: '$dayOfWeek',
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
            // By Hour of Day (0-23)
            CrimeRecord_1.CrimeRecord.aggregate([
                { $match: match },
                {
                    $group: {
                        _id: '$hour',
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
            // By Year
            CrimeRecord_1.CrimeRecord.aggregate([
                { $match: match },
                {
                    $group: {
                        _id: '$year',
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
        ]);
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyTimeline = byMonth.map((item) => ({
            period: `${monthNames[item._id.month]} ${item._id.year}`,
            year: item._id.year,
            month: item._id.month,
            count: item.count,
        }));
        const dayOfWeekData = Array.from({ length: 7 }, (_, i) => {
            const found = byDayOfWeek.find((d) => d._id === i);
            return {
                dayIndex: i,
                dayName: dayNames[i],
                count: found ? found.count : 0,
            };
        });
        const hourlyData = Array.from({ length: 24 }, (_, i) => {
            const found = byHour.find((h) => h._id === i);
            return {
                hour: i,
                timeLabel: `${i.toString().padStart(2, '0')}:00`,
                count: found ? found.count : 0,
            };
        });
        const yearlyData = byYear.map((y) => ({
            year: y._id.toString(),
            count: y.count,
        }));
        // Build hourlyDistribution, dayOfWeekDistribution, monthlySeasonality and peak calculations
        const hourlyDistribution = {};
        let peakHour = 20;
        let maxHourCount = -1;
        let dayCount = 0;
        let nightCount = 0;
        for (const h of hourlyData) {
            hourlyDistribution[h.hour] = h.count;
            if (h.count > maxHourCount) {
                maxHourCount = h.count;
                peakHour = h.hour;
            }
            if (h.hour >= 6 && h.hour < 18) {
                dayCount += h.count;
            }
            else {
                nightCount += h.count;
            }
        }
        const totalHours = Math.max(1, dayCount + nightCount);
        const dayPct = Number(((dayCount / totalHours) * 100).toFixed(1));
        const nightPct = Number(((nightCount / totalHours) * 100).toFixed(1));
        const peakEndHour = (peakHour + 2) % 24;
        const peakWindow = `${peakHour.toString().padStart(2, '0')}:00 - ${peakEndHour.toString().padStart(2, '0')}:00`;
        const dayOfWeekDistribution = {};
        for (const d of dayOfWeekData) {
            dayOfWeekDistribution[d.dayIndex] = d.count;
        }
        const monthlySeasonality = {};
        for (const m of byMonth) {
            monthlySeasonality[m._id.month] = (monthlySeasonality[m._id.month] || 0) + m.count;
        }
        return {
            monthlyTimeline,
            dayOfWeekData,
            hourlyData,
            yearlyData,
            hourlyDistribution,
            dayOfWeekDistribution,
            monthlySeasonality,
            peakHour,
            peakWindow,
            dayPct,
            nightPct,
        };
    }
    /**
     * Get Crime Category & Severity Breakdown
     */
    static async getCategoryAnalysis(filters = {}) {
        return this.withCache('getCategoryAnalysis_' + JSON.stringify(filters), () => this._getCategoryAnalysis(filters));
    }
    static async _getCategoryAnalysis(filters = {}) {
        const match = this.buildMatchQuery(filters);
        const [categories, categoryBySeverity] = await Promise.all([
            CrimeRecord_1.CrimeRecord.aggregate([
                { $match: match },
                {
                    $group: {
                        _id: '$crimeCategory',
                        count: { $sum: 1 },
                    },
                },
                { $sort: { count: -1 } },
            ]),
            CrimeRecord_1.CrimeRecord.aggregate([
                { $match: match },
                {
                    $group: {
                        _id: { category: '$crimeCategory', severity: '$severity' },
                        count: { $sum: 1 },
                    },
                },
            ]),
        ]);
        const total = categories.reduce((sum, c) => sum + c.count, 0) || 1;
        const categoryBreakdown = categories.map((c) => ({
            category: c._id,
            name: c._id,
            count: c.count,
            value: c.count,
            percentage: Number(((c.count / total) * 100).toFixed(1)),
        }));
        // Pivot categoryBySeverity into crossTab matrix
        const crossTabMap = {};
        for (const c of categories) {
            crossTabMap[c._id] = { category: c._id, LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0, total: c.count };
        }
        for (const item of categoryBySeverity) {
            const cat = item._id.category;
            const sev = item._id.severity;
            if (!crossTabMap[cat]) {
                crossTabMap[cat] = { category: cat, LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0, total: 0 };
            }
            if (sev && crossTabMap[cat][sev] !== undefined) {
                crossTabMap[cat][sev] += item.count;
            }
        }
        const crossTab = Object.values(crossTabMap);
        const severityTotals = {
            LOW: crossTab.reduce((s, r) => s + r.LOW, 0),
            MEDIUM: crossTab.reduce((s, r) => s + r.MEDIUM, 0),
            HIGH: crossTab.reduce((s, r) => s + r.HIGH, 0),
            CRITICAL: crossTab.reduce((s, r) => s + r.CRITICAL, 0),
        };
        const highOrCriticalTotal = severityTotals.HIGH + severityTotals.CRITICAL;
        const highSeverityPercentage = total > 0 ? Number(((highOrCriticalTotal / total) * 100).toFixed(1)) : 0;
        return {
            total,
            categories: categoryBreakdown,
            categoryBreakdown,
            crossTab,
            categoryBySeverity: categoryBySeverity.map((item) => ({
                category: item._id.category,
                severity: item._id.severity,
                count: item.count,
            })),
            severityTotals,
            highSeverityPercentage,
        };
    }
    /**
     * Get Geographic & District Analytics
     */
    static async getGeographicAnalysis(filters = {}) {
        return this.withCache('getGeographicAnalysis_' + JSON.stringify(filters), () => this._getGeographicAnalysis(filters));
    }
    static async _getGeographicAnalysis(filters = {}) {
        const match = this.buildMatchQuery(filters);
        const [districts, topLocations, districtCategoryAgg] = await Promise.all([
            CrimeRecord_1.CrimeRecord.aggregate([
                { $match: match },
                {
                    $group: {
                        _id: '$district',
                        count: { $sum: 1 },
                        avgLat: { $avg: '$latitude' },
                        avgLng: { $avg: '$longitude' },
                        criticalCount: {
                            $sum: {
                                $cond: [{ $in: ['$severity', ['HIGH', 'CRITICAL']] }, 1, 0],
                            },
                        },
                    },
                },
                { $sort: { count: -1 } },
            ]),
            CrimeRecord_1.CrimeRecord.aggregate([
                { $match: match },
                {
                    $group: {
                        _id: { location: '$locationName', district: '$district' },
                        count: { $sum: 1 },
                        severityHighCount: {
                            $sum: {
                                $cond: [{ $in: ['$severity', ['HIGH', 'CRITICAL']] }, 1, 0],
                            },
                        },
                    },
                },
                { $sort: { count: -1 } },
                { $limit: 10 },
            ]),
            CrimeRecord_1.CrimeRecord.aggregate([
                { $match: match },
                {
                    $group: {
                        _id: { district: '$district', category: '$crimeCategory' },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { count: -1 } },
            ]),
        ]);
        const topCatByDistrict = {};
        for (const item of districtCategoryAgg) {
            if (!topCatByDistrict[item._id.district]) {
                topCatByDistrict[item._id.district] = item._id.category;
            }
        }
        const totalRecords = districts.reduce((sum, d) => sum + d.count, 0) || 1;
        const districtList = districts.map((d) => ({
            district: d._id,
            name: d._id,
            count: d.count,
            value: d.count,
            percentage: Number(((d.count / totalRecords) * 100).toFixed(1)),
            topCategory: topCatByDistrict[d._id] || 'Other Crimes',
            criticalRatio: d.count > 0 ? Number((d.criticalCount / d.count).toFixed(3)) : 0.18,
            criticalPercentage: d.count > 0 ? Number(((d.criticalCount / d.count) * 100).toFixed(1)) : 18.0,
            center: [Number((d.avgLat || 16.5).toFixed(5)), Number((d.avgLng || 80.5).toFixed(5))],
            concentrationLevel: d.count / totalRecords > 0.25
                ? 'High Concentration'
                : d.count / totalRecords > 0.12
                    ? 'Medium Concentration'
                    : 'Low Concentration',
        }));
        const locationList = topLocations.map((l) => ({
            location: l._id.location,
            district: l._id.district,
            count: l.count,
            highSeverityCount: l.severityHighCount,
        }));
        return {
            districts: districtList,
            topLocations: locationList,
        };
    }
    /**
     * Generate Dynamic Statistical Text Insights
     */
    static async getDynamicInsights(filters = {}) {
        return this.withCache('getDynamicInsights_' + JSON.stringify(filters), () => this._getDynamicInsights(filters));
    }
    static async _getDynamicInsights(filters = {}) {
        const match = this.buildMatchQuery(filters);
        const [summary, temporal, categoryData, geoData] = await Promise.all([
            this.getSummary(filters),
            this.getTemporalAnalysis(filters),
            this.getCategoryAnalysis(filters),
            this.getGeographicAnalysis(filters),
        ]);
        const insights = [];
        // 1. Top Category insight
        if (summary.topCategory && summary.topCategory !== 'N/A') {
            insights.push(`${summary.topCategory} represents the most frequent crime category, accounting for ${summary.topCategoryPercentage}% of all recorded incidents.`);
        }
        // 2. Peak Day of week
        if (temporal.dayOfWeekData.length > 0) {
            const sortedDays = [...temporal.dayOfWeekData].sort((a, b) => b.count - a.count);
            const topDay = sortedDays[0];
            const weekendSum = (temporal.dayOfWeekData[0].count + temporal.dayOfWeekData[6].count);
            const weekendPct = summary.totalRecords > 0
                ? ((weekendSum / summary.totalRecords) * 100).toFixed(1)
                : '0';
            insights.push(`Weekly patterns show peak incident volume on ${topDay.dayName}s (${topDay.count} events), with weekend activities comprising ${weekendPct}% of the dataset.`);
        }
        // 3. Peak Hourly Window
        if (temporal.hourlyData.length > 0) {
            const sortedHours = [...temporal.hourlyData].sort((a, b) => b.count - a.count);
            const peakHour = sortedHours[0].hour;
            const nextHour = (peakHour + 1) % 24;
            insights.push(`Hourly analysis reveals concentrated historical activity during the ${peakHour}:00 - ${nextHour}:00 time window.`);
        }
        // 4. Geographic Concentration
        if (geoData.districts.length > 0) {
            const topDist = geoData.districts[0];
            insights.push(`Geographic clustering indicates that ${topDist.district} has the highest historical concentration (${topDist.count} incidents, ${topDist.percentage}% share).`);
        }
        // 5. Severity distribution
        const highSev = summary.severityBreakdown.find((s) => s.severity === 'HIGH' || s.severity === 'CRITICAL');
        if (highSev && summary.totalRecords > 0) {
            const highPct = ((highSev.count / summary.totalRecords) * 100).toFixed(1);
            insights.push(`High and critical severity offenses constitute ${highPct}% of recorded events, emphasizing targeted preventative monitoring.`);
        }
        return {
            insights,
            generatedAt: new Date().toISOString(),
            recordCount: summary.totalRecords,
        };
    }
    /**
     * Get High-Accuracy Hotspot Risk Density Index (HRDI) Analysis
     */
    static async getHotspotsAnalysis(filters = {}) {
        return this.withCache('getHotspotsAnalysis_' + JSON.stringify(filters), () => this._getHotspotsAnalysis(filters));
    }
    static async _getHotspotsAnalysis(filters = {}) {
        const match = this.buildMatchQuery(filters);
        const hotspots = await CrimeRecord_1.CrimeRecord.aggregate([
            { $match: match },
            {
                $group: {
                    _id: { location: '$locationName', district: '$district' },
                    count: { $sum: 1 },
                    latitude: { $avg: '$latitude' },
                    longitude: { $avg: '$longitude' },
                    criticalCount: { $sum: { $cond: [{ $eq: ['$severity', 'CRITICAL'] }, 1, 0] } },
                    highCount: { $sum: { $cond: [{ $eq: ['$severity', 'HIGH'] }, 1, 0] } },
                    mediumCount: { $sum: { $cond: [{ $eq: ['$severity', 'MEDIUM'] }, 1, 0] } },
                    lowCount: { $sum: { $cond: [{ $eq: ['$severity', 'LOW'] }, 1, 0] } },
                    categories: { $push: '$crimeCategory' },
                },
            },
            { $sort: { count: -1 } },
            { $limit: 15 },
        ]);
        const maxCount = hotspots[0]?.count || 1;
        const formattedHotspots = hotspots.map((h, index) => {
            // Find top crime category for this location
            const catCount = {};
            for (const c of h.categories) {
                catCount[c] = (catCount[c] || 0) + 1;
            }
            let topCat = 'Theft';
            let topCatCnt = 0;
            for (const [c, cnt] of Object.entries(catCount)) {
                if (cnt > topCatCnt) {
                    topCatCnt = cnt;
                    topCat = c;
                }
            }
            // Calculate Hotspot Risk Density Index (HRDI) between 25 and 99
            const volumeScore = (h.count / maxCount) * 55;
            const severityScore = ((h.criticalCount * 3 + h.highCount * 2 + h.mediumCount * 1) / Math.max(h.count, 1)) * 15;
            const riskScore = Math.min(99, Math.max(25, Math.round(volumeScore + severityScore)));
            return {
                rank: index + 1,
                locationName: h._id.location || 'Urban Jurisdiction',
                district: h._id.district,
                count: h.count,
                latitude: Number((h.latitude || 16.5).toFixed(4)),
                longitude: Number((h.longitude || 80.6).toFixed(4)),
                primaryCategory: topCat,
                criticalCount: h.criticalCount,
                highCount: h.highCount,
                riskScore,
                riskLevel: riskScore >= 75 ? 'CRITICAL RISK' : riskScore >= 55 ? 'HIGH RISK' : 'MODERATE RISK',
                patrolRecommendation: riskScore >= 75
                    ? 'Intensive continuous mobile patrol & automated surveillance recommended.'
                    : riskScore >= 55
                        ? 'Scheduled high-visibility evening patrol beats recommended.'
                        : 'Standard community policing & routine beat monitoring.',
            };
        });
        return {
            hotspots: formattedHotspots,
            totalHotspotsAnalyzed: hotspots.length,
        };
    }
    /**
     * Comparative District Benchmark Analysis (Side-by-side)
     */
    static async compareDistricts(districtA, districtB, year) {
        const key = `compare_${districtA}_${districtB}_${year || 'all'}`;
        return this.withCache(key, async () => {
            const matchA = { district: districtA };
            const matchB = { district: districtB };
            if (year && Number(year) > 2000) {
                matchA.year = Number(year);
                matchB.year = Number(year);
            }
            const [dataA, dataB] = await Promise.all([
                this._getDistrictProfile(matchA, districtA),
                this._getDistrictProfile(matchB, districtB),
            ]);
            return {
                districtA: dataA,
                districtB: dataB,
            };
        });
    }
    static async _getDistrictProfile(match, districtName) {
        const [total, categoryAgg, severityAgg, hourlyAgg, topLocations] = await Promise.all([
            CrimeRecord_1.CrimeRecord.countDocuments(match),
            CrimeRecord_1.CrimeRecord.aggregate([
                { $match: match },
                { $group: { _id: '$crimeCategory', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 },
            ]),
            CrimeRecord_1.CrimeRecord.aggregate([
                { $match: match },
                { $group: { _id: '$severity', count: { $sum: 1 } } },
            ]),
            CrimeRecord_1.CrimeRecord.aggregate([
                { $match: match },
                { $group: { _id: '$hour', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 1 },
            ]),
            CrimeRecord_1.CrimeRecord.aggregate([
                { $match: match },
                { $group: { _id: '$locationName', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 3 },
            ]),
        ]);
        const highOrCritical = severityAgg
            .filter((s) => s._id === 'HIGH' || s._id === 'CRITICAL')
            .reduce((a, b) => a + b.count, 0);
        return {
            district: districtName,
            totalIncidents: total,
            topCategory: categoryAgg[0]?._id || 'N/A',
            topCategoryCount: categoryAgg[0]?.count || 0,
            highSeverityRatio: total > 0 ? Number(((highOrCritical / total) * 100).toFixed(1)) : 0,
            peakHour: hourlyAgg[0]?._id !== undefined ? hourlyAgg[0]._id : 20,
            topLocations: topLocations.map((l) => ({ location: l._id, count: l.count })),
            categories: categoryAgg.map((c) => ({ category: c._id, count: c.count })),
        };
    }
}
exports.AnalyticsService = AnalyticsService;
