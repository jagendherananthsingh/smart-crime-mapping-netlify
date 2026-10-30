"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelEvaluator = void 0;
class ModelEvaluator {
    /**
     * Evaluate true vs predicted labels across class labels.
     */
    static evaluate(yTrue, yPred, labels, featureNames, featureImportances, trainingTimeMs, trainSetSize, testSetSize) {
        const numClasses = labels.length;
        const matrix = Array.from({ length: numClasses }, () => new Array(numClasses).fill(0));
        let correct = 0;
        for (let i = 0; i < yTrue.length; i++) {
            const actual = yTrue[i];
            const pred = yPred[i];
            if (actual >= 0 && actual < numClasses && pred >= 0 && pred < numClasses) {
                matrix[actual][pred]++;
                if (actual === pred)
                    correct++;
            }
        }
        const totalSamples = yTrue.length || 1;
        const accuracy = correct / totalSamples;
        // Calculate Precision, Recall, F1 for each class
        let sumPrecision = 0;
        let sumRecall = 0;
        let sumF1 = 0;
        let validClassesCount = 0;
        for (let c = 0; c < numClasses; c++) {
            const tp = matrix[c][c];
            let fn = 0; // Actual c, but predicted something else (Row sum - TP)
            for (let p = 0; p < numClasses; p++) {
                if (p !== c)
                    fn += matrix[c][p];
            }
            let fp = 0; // Predicted c, but actually something else (Col sum - TP)
            for (let a = 0; a < numClasses; a++) {
                if (a !== c)
                    fp += matrix[a][c];
            }
            const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
            const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
            const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
            // Only include classes present in the test distribution
            if (tp + fn > 0) {
                sumPrecision += precision;
                sumRecall += recall;
                sumF1 += f1;
                validClassesCount++;
            }
        }
        const divisor = validClassesCount > 0 ? validClassesCount : numClasses || 1;
        const macroPrecision = sumPrecision / divisor;
        const macroRecall = sumRecall / divisor;
        const macroF1 = sumF1 / divisor;
        // Build feature importance list
        const featureImportance = featureNames.map((name, i) => ({
            feature: name,
            importance: Number((featureImportances[i] || 0).toFixed(4)),
        })).sort((a, b) => b.importance - a.importance);
        return {
            accuracy: Number(accuracy.toFixed(4)),
            precision: Number(macroPrecision.toFixed(4)),
            recall: Number(macroRecall.toFixed(4)),
            f1Score: Number(macroF1.toFixed(4)),
            confusionMatrix: {
                labels,
                matrix,
            },
            featureImportance,
            trainingTimeMs,
            trainSetSize,
            testSetSize,
        };
    }
    /**
     * Split dataset features and labels chronologically or randomly.
     */
    static splitData(features, labels, testRatio = 0.2) {
        const total = features.length;
        const splitIndex = Math.floor(total * (1 - testRatio));
        return {
            trainX: features.slice(0, splitIndex),
            trainY: labels.slice(0, splitIndex),
            testX: features.slice(splitIndex),
            testY: labels.slice(splitIndex),
        };
    }
}
exports.ModelEvaluator = ModelEvaluator;
