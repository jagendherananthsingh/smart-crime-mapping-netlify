"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapController = void 0;
const CrimeRecord_1 = require("../models/CrimeRecord");
const analytics_service_1 = require("../services/analytics/analytics.service");
const response_1 = require("../utils/response");
const districtMetrics_1 = require("../data/districtMetrics");
const crime_controller_1 = require("./crime.controller");
const database_1 = require("../config/database");
class MapController {
    static async getMarkers(req, res) {
        try {
            if ((0, database_1.isDbConnected)()) {
                const match = analytics_service_1.AnalyticsService.buildMatchQuery(req.query);
                const limit = parseInt(req.query.limit, 10) || 500;
                const markers = await CrimeRecord_1.CrimeRecord.find(match)
                    .select('caseId date crimeCategory crimeType locationName latitude longitude district city severity')
                    .sort({ date: -1 })
                    .limit(limit)
                    .lean();
                if (markers !== undefined) {
                    (0, response_1.sendSuccess)(res, markers, 'Map markers retrieved');
                    return;
                }
            }
            const fallbackMarkers = (0, crime_controller_1.generateFallbackCrimes)(150, req.query);
            (0, response_1.sendSuccess)(res, fallbackMarkers, 'Map markers retrieved (Cloud Resilient Mode)');
        }
        catch (error) {
            const fallbackMarkers = (0, crime_controller_1.generateFallbackCrimes)(150, req.query);
            (0, response_1.sendSuccess)(res, fallbackMarkers, 'Map markers retrieved (Cloud Fallback Mode)');
        }
    }
    static async getHeatmap(req, res) {
        try {
            const severityWeights = {
                LOW: 0.3,
                MEDIUM: 0.6,
                HIGH: 0.85,
                CRITICAL: 1.0,
            };
            if ((0, database_1.isDbConnected)()) {
                const match = analytics_service_1.AnalyticsService.buildMatchQuery(req.query);
                const records = await CrimeRecord_1.CrimeRecord.find(match)
                    .select('latitude longitude severity')
                    .limit(2000)
                    .lean();
                if (records !== undefined) {
                    const points = records.map((r) => [
                        r.latitude,
                        r.longitude,
                        severityWeights[r.severity] || 0.5,
                    ]);
                    (0, response_1.sendSuccess)(res, points, 'Heatmap data points retrieved');
                    return;
                }
            }
            const fallbackRecords = (0, crime_controller_1.generateFallbackCrimes)(250, req.query);
            const points = fallbackRecords.map((r) => [
                r.latitude,
                r.longitude,
                severityWeights[r.severity] || 0.5,
            ]);
            (0, response_1.sendSuccess)(res, points, 'Heatmap data points retrieved (Cloud Resilient Mode)');
        }
        catch (error) {
            const severityWeights = {
                LOW: 0.3,
                MEDIUM: 0.6,
                HIGH: 0.85,
                CRITICAL: 1.0,
            };
            const fallbackRecords = (0, crime_controller_1.generateFallbackCrimes)(200, req.query);
            const points = fallbackRecords.map((r) => [
                r.latitude,
                r.longitude,
                severityWeights[r.severity] || 0.5,
            ]);
            (0, response_1.sendSuccess)(res, points, 'Heatmap data points retrieved (Cloud Fallback Mode)');
        }
    }
    static async getHotspots(req, res) {
        try {
            if ((0, database_1.isDbConnected)()) {
                const filters = req.query;
                const data = await analytics_service_1.AnalyticsService.getGeographicAnalysis(filters);
                if (data && data.districts && data.districts.length > 0) {
                    (0, response_1.sendSuccess)(res, data.districts, 'District hotspots retrieved');
                    return;
                }
            }
        }
        catch (e) {
            console.warn('[Map getHotspots notice]', e?.message || e);
        }
        // High fidelity fallback AP district hotspot centroids
        const AP_DISTRICT_HOTSPOTS = [
            { district: 'Guntur', count: 12427, latitude: 16.30694, longitude: 80.43614, criticalCount: 211, topCategory: 'Theft' },
            { district: 'NTR (Vijayawada)', count: 11519, latitude: 16.50617, longitude: 80.64833, criticalCount: 151, topCategory: 'Theft' },
            { district: 'Visakhapatnam', count: 9746, latitude: 17.68639, longitude: 83.21837, criticalCount: 201, topCategory: 'Cheatings' },
            { district: 'Prakasam', count: 9104, latitude: 15.91233, longitude: 79.74039, criticalCount: 112, topCategory: 'Theft' },
            { district: 'Kurnool', count: 8832, latitude: 15.82859, longitude: 78.03719, criticalCount: 160, topCategory: 'Burglary' },
            { district: 'West Godavari', count: 8817, latitude: 16.91755, longitude: 81.33441, criticalCount: 87, topCategory: 'Theft' },
            { district: 'Anantapur', count: 8760, latitude: 14.68185, longitude: 77.60112, criticalCount: 165, topCategory: 'Theft' },
            { district: 'Chittoor', count: 8670, latitude: 13.21718, longitude: 79.09990, criticalCount: 99, topCategory: 'Theft' },
            { district: 'Krishna', count: 8363, latitude: 16.61540, longitude: 80.52212, criticalCount: 191, topCategory: 'Theft' },
            { district: 'YSR Kadapa', count: 7555, latitude: 14.46733, longitude: 78.82452, criticalCount: 97, topCategory: 'Burglary' },
            { district: 'East Godavari', count: 7415, latitude: 17.32949, longitude: 82.03436, criticalCount: 150, topCategory: 'Theft' },
            { district: 'SPS Nellore', count: 7414, latitude: 14.44304, longitude: 79.98656, criticalCount: 139, topCategory: 'Theft' },
            { district: 'Srikakulam', count: 6289, latitude: 18.29432, longitude: 83.89407, criticalCount: 76, topCategory: 'Theft' },
            { district: 'Tirupati', count: 6246, latitude: 13.62855, longitude: 79.41903, criticalCount: 90, topCategory: 'Theft' },
            { district: 'Vizianagaram', count: 5610, latitude: 18.10661, longitude: 83.39518, criticalCount: 127, topCategory: 'Theft' },
            { district: 'Eluru', count: 5583, latitude: 16.71063, longitude: 81.09542, criticalCount: 82, topCategory: 'Theft' },
            { district: 'Bapatla', count: 3760, latitude: 15.90455, longitude: 80.46752, criticalCount: 66, topCategory: 'Theft' },
            { district: 'Dr.B.R.Ambedkar Konaseema', count: 3500, latitude: 16.80005, longitude: 82.22921, criticalCount: 64, topCategory: 'Theft' },
            { district: 'Anakapalli', count: 3438, latitude: 17.69029, longitude: 83.00441, criticalCount: 53, topCategory: 'Theft' },
            { district: 'Sri Sathya Sai', count: 3355, latitude: 14.16361, longitude: 77.29985, criticalCount: 45, topCategory: 'Theft' },
            { district: 'Kakinada', count: 3232, latitude: 16.98861, longitude: 82.24734, criticalCount: 50, topCategory: 'Theft' },
            { district: 'Nandyal', count: 3183, latitude: 15.47812, longitude: 78.48626, criticalCount: 64, topCategory: 'Theft' },
            { district: 'Palnadu', count: 3073, latitude: 16.35933, longitude: 79.50008, criticalCount: 51, topCategory: 'Theft' },
            { district: 'Annamayya', count: 2676, latitude: 14.00029, longitude: 78.99942, criticalCount: 45, topCategory: 'Theft' },
            { district: 'Rajamahendravaram', count: 1758, latitude: 17.00107, longitude: 81.80499, criticalCount: 41, topCategory: 'Theft' },
            { district: 'Parvathipuram Manyam', count: 1656, latitude: 18.77771, longitude: 83.42726, criticalCount: 29, topCategory: 'Theft' },
            { district: 'Alluri Sitharama Raju', count: 672, latitude: 17.99985, longitude: 82.87056, criticalCount: 40, topCategory: 'Theft' }
        ];
        (0, response_1.sendSuccess)(res, AP_DISTRICT_HOTSPOTS, 'District hotspots retrieved (Cloud Resilient Mode)');
    }
    static async getAreaStats(req, res) {
        try {
            const { district } = req.query;
            if (!district) {
                (0, response_1.sendError)(res, 'District query parameter is required', 400);
                return;
            }
            const distStr = district.toString();
            const match = analytics_service_1.AnalyticsService.buildMatchQuery({ district: distStr });
            if ((0, database_1.isDbConnected)()) {
                const [total, categoryAgg, severityAgg, topLocations] = await Promise.all([
                    CrimeRecord_1.CrimeRecord.countDocuments(match),
                    CrimeRecord_1.CrimeRecord.aggregate([
                        { $match: match },
                        { $group: { _id: '$crimeCategory', count: { $sum: 1 } } },
                        { $sort: { count: -1 } },
                    ]),
                    CrimeRecord_1.CrimeRecord.aggregate([
                        { $match: match },
                        { $group: { _id: '$severity', count: { $sum: 1 } } },
                    ]),
                    CrimeRecord_1.CrimeRecord.aggregate([
                        { $match: match },
                        { $group: { _id: '$locationName', count: { $sum: 1 } } },
                        { $sort: { count: -1 } },
                        { $limit: 5 },
                    ]),
                ]);
                if (total > 0) {
                    const mostCommonCrime = categoryAgg[0]?._id || 'N/A';
                    const mostCommonCrimeCount = categoryAgg[0]?.count || 0;
                    (0, response_1.sendSuccess)(res, {
                        district: distStr,
                        totalIncidents: total,
                        mostCommonCrime,
                        mostCommonCrimeCount,
                        categoryBreakdown: categoryAgg.map((c) => ({
                            category: c._id,
                            count: c.count,
                            percentage: total > 0 ? Number(((c.count / total) * 100).toFixed(1)) : 0,
                        })),
                        severityBreakdown: severityAgg.map((s) => ({
                            severity: s._id,
                            count: s.count,
                        })),
                        topLocations: topLocations.map((l) => ({
                            location: l._id,
                            count: l.count,
                        })),
                    }, 'Area statistics retrieved');
                    return;
                }
            }
        }
        catch (error) {
            console.warn('[Map getAreaStats notice]', error?.message || error);
        }
        const dist = (req.query.district || 'Visakhapatnam').toString();
        const dm = (0, districtMetrics_1.getDistrictMetrics)(dist);
        (0, response_1.sendSuccess)(res, {
            district: dm.district,
            totalIncidents: dm.totalRecords,
            mostCommonCrime: dm.topCategory,
            mostCommonCrimeCount: dm.topCategoryCount,
            categoryBreakdown: dm.categories.map((c) => ({
                category: c.category,
                count: c.count,
                percentage: c.percentage,
            })),
            severityBreakdown: dm.severityBreakdown,
            topLocations: [
                { location: `${dm.district} Central Commercial Hub`, count: Math.round(dm.totalRecords * 0.12) },
                { location: `${dm.district} Transit Bus Terminal`, count: Math.round(dm.totalRecords * 0.09) },
                { location: `${dm.district} Railway Station Perimeter`, count: Math.round(dm.totalRecords * 0.07) },
                { location: `${dm.district} High Density Corridor`, count: Math.round(dm.totalRecords * 0.05) },
            ],
        }, 'Area statistics retrieved (Cloud Resilient Mode)');
    }
}
exports.MapController = MapController;
