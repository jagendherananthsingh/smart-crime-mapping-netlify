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
