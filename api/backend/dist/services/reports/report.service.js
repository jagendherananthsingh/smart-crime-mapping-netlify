"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const analytics_service_1 = require("../analytics/analytics.service");
const ModelResult_1 = require("../../models/ModelResult");
const Dataset_1 = require("../../models/Dataset");
class ReportService {
    static async generateAcademicReport(filters = {}) {
        const [summary, temporal, categories, geographic, insights, models, dataset] = await Promise.all([
            analytics_service_1.AnalyticsService.getSummary(filters),
            analytics_service_1.AnalyticsService.getTemporalAnalysis(filters),
            analytics_service_1.AnalyticsService.getCategoryAnalysis(filters),
            analytics_service_1.AnalyticsService.getGeographicAnalysis(filters),
            analytics_service_1.AnalyticsService.getDynamicInsights(filters),
            ModelResult_1.ModelResult.find().sort({ f1Score: -1 }).lean(),
            Dataset_1.Dataset.findOne().sort({ createdAt: -1 }).lean(),
        ]);
        const report = {
            projectInfo: {
                title: 'SMART CRIME MAPPING DATA ANALYSIS AND PREDICTIVE INSIGHTS',
                department: 'Department of CSE (Data Science)',
                institution: 'Geethanjali Institute of Science & Technology (Autonomous)',
                reportDate: new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                }),
                generatedTimestamp: new Date().toISOString(),
            },
            datasetInfo: {
                name: dataset?.name || 'Primary Historical Crime Repository',
                totalRecords: summary.totalRecords,
                uniqueCategories: summary.totalCategories,
                dateRange: dataset?.preprocessingSummary?.dateRange || {
                    start: '2023-01-01',
                    end: '2025-12-31',
                },
            },
            executiveSummary: {
                totalIncidents: summary.totalRecords,
                topCrimeCategory: summary.topCategory,
                topCategoryShare: `${summary.topCategoryPercentage}%`,
                primaryHotspotDistrict: summary.topDistrict,
                severityDistribution: summary.severityBreakdown,
            },
            insights: insights.insights,
            temporalAnalysis: {
                peakDay: temporal.dayOfWeekData.reduce((prev, curr) => (curr.count > prev.count ? curr : prev), { dayName: 'N/A', count: 0 }).dayName,
                peakHour: temporal.hourlyData.reduce((prev, curr) => (curr.count > prev.count ? curr : prev), { timeLabel: 'N/A', count: 0 }).timeLabel,
                monthlyTrend: temporal.monthlyTimeline,
            },
            geographicAnalysis: {
                districts: geographic.districts,
                topLocations: geographic.topLocations.slice(0, 5),
            },
            categoryAnalysis: categories.categoryBreakdown,
            machineLearningEvaluation: {
                modelsCompared: models.map((m) => ({
                    name: m.modelName,
                    accuracy: `${(m.accuracy * 100).toFixed(1)}%`,
                    precision: `${(m.precision * 100).toFixed(1)}%`,
                    recall: `${(m.recall * 100).toFixed(1)}%`,
                    f1Score: `${(m.f1Score * 100).toFixed(1)}%`,
                    trainingDuration: `${m.trainingTimeMs} ms`,
                    topFeatures: m.featureImportance?.slice(0, 3).map((f) => f.feature) || [],
                })),
                bestModel: models[0]?.modelName || 'Random Forest',
            },
            limitationsAndEthics: [
                'Historical data reflects reported incidents and may be subject to reporting variability or sampling variance.',
                'Predictions represent aggregate spatial-temporal probability estimates, NOT deterministic certainties.',
                'This software must NEVER be used to profile, track, or identify individual persons, nor make automated policing or judicial decisions.',
                'Statistical correlation in spatial-temporal crime models does not establish direct causation.',
            ],
            disclaimer: 'Predictions are statistical estimates based on historical data and are intended for academic and analytical purposes only. They should not be used to make decisions about individuals or to determine guilt, risk, or policing actions.',
        };
        return report;
    }
}
exports.ReportService = ReportService;
