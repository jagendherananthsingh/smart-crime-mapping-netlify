"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionTreeClassifier = void 0;
class DecisionTreeClassifier {
    root = null;
    maxDepth;
    minSamplesSplit;
    numClasses = 0;
    featureNames = [];
    featureImportances = [];
    constructor(maxDepth = 8, minSamplesSplit = 5) {
        this.maxDepth = maxDepth;
        this.minSamplesSplit = minSamplesSplit;
    }
    train(X, y, numClasses, featureNames = []) {
        this.numClasses = numClasses;
        this.featureNames = featureNames;
        this.featureImportances = new Array(X[0]?.length || 0).fill(0);
        this.root = this.buildTree(X, y, 0);
        // Normalize feature importances
        const totalImportance = this.featureImportances.reduce((a, b) => a + b, 0);
        if (totalImportance > 0) {
            this.featureImportances = this.featureImportances.map((v) => v / totalImportance);
        }
    }
    buildTree(X, y, depth) {
        const numSamples = X.length;
        const numFeatures = X[0]?.length || 0;
        // Class distribution
        const classCounts = new Array(this.numClasses).fill(0);
        for (const label of y) {
            classCounts[label] = (classCounts[label] || 0) + 1;
        }
        const probabilities = classCounts.map((count) => count / (numSamples || 1));
        let majorityClass = 0;
        let maxCount = -1;
        for (let c = 0; c < this.numClasses; c++) {
            if (classCounts[c] > maxCount) {
                maxCount = classCounts[c];
                majorityClass = c;
            }
        }
        // Stop conditions
        if (depth >= this.maxDepth ||
            numSamples < this.minSamplesSplit ||
            this.getGini(y) === 0 ||
            numFeatures === 0) {
            return {
                isLeaf: true,
                prediction: majorityClass,
                probabilities,
            };
        }
        // Find best split
        const currentGini = this.getGini(y);
        let bestGain = -1;
        let bestFeature = -1;
        let bestThreshold = 0;
        let bestLeftIndices = [];
        let bestRightIndices = [];
        for (let f = 0; f < numFeatures; f++) {
            const values = X.map((row) => row[f]);
            const uniqueValues = Array.from(new Set(values)).sort((a, b) => a - b);
            for (let i = 0; i < uniqueValues.length - 1; i++) {
                const threshold = (uniqueValues[i] + uniqueValues[i + 1]) / 2;
                const leftIdx = [];
                const rightIdx = [];
                for (let s = 0; s < numSamples; s++) {
                    if (X[s][f] <= threshold) {
                        leftIdx.push(s);
                    }
                    else {
                        rightIdx.push(s);
                    }
                }
                if (leftIdx.length === 0 || rightIdx.length === 0)
                    continue;
                const leftY = leftIdx.map((idx) => y[idx]);
                const rightY = rightIdx.map((idx) => y[idx]);
                const leftGini = this.getGini(leftY);
                const rightGini = this.getGini(rightY);
                const weightedGini = (leftIdx.length / numSamples) * leftGini +
                    (rightIdx.length / numSamples) * rightGini;
                const gain = currentGini - weightedGini;
                if (gain > bestGain) {
                    bestGain = gain;
                    bestFeature = f;
                    bestThreshold = threshold;
                    bestLeftIndices = leftIdx;
                    bestRightIndices = rightIdx;
                }
            }
        }
        if (bestGain <= 0.0001 || bestFeature === -1) {
            return {
                isLeaf: true,
                prediction: majorityClass,
                probabilities,
            };
        }
        // Accumulate importance
        this.featureImportances[bestFeature] += bestGain * numSamples;
        const leftX = bestLeftIndices.map((i) => X[i]);
        const leftY = bestLeftIndices.map((i) => y[i]);
        const rightX = bestRightIndices.map((i) => X[i]);
        const rightY = bestRightIndices.map((i) => y[i]);
        const leftChild = this.buildTree(leftX, leftY, depth + 1);
        const rightChild = this.buildTree(rightX, rightY, depth + 1);
        return {
            isLeaf: false,
            featureIndex: bestFeature,
            threshold: bestThreshold,
            gain: bestGain,
            left: leftChild,
            right: rightChild,
            probabilities,
            prediction: majorityClass,
        };
    }
    getGini(y) {
        if (y.length === 0)
            return 0;
        const counts = {};
        for (const val of y) {
            counts[val] = (counts[val] || 0) + 1;
        }
        let impurity = 1.0;
        for (const key in counts) {
            const p = counts[key] / y.length;
            impurity -= p * p;
        }
        return Math.max(0, impurity);
    }
    predictRow(x) {
        let current = this.root;
        if (!current)
            return { prediction: 0, probabilities: [] };
        while (current && !current.isLeaf) {
            if (current.featureIndex !== undefined &&
                current.threshold !== undefined &&
                x[current.featureIndex] <= current.threshold) {
                current = current.left || current;
            }
            else {
                current = current.right || current;
            }
        }
        return {
            prediction: current.prediction ?? 0,
            probabilities: current.probabilities ?? [],
        };
    }
    predict(X) {
        return X.map((row) => this.predictRow(row).prediction);
    }
}
exports.DecisionTreeClassifier = DecisionTreeClassifier;
