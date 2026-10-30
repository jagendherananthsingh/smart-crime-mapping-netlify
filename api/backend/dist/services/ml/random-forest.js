"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RandomForestClassifier = void 0;
const decision_tree_1 = require("./decision-tree");
class RandomForestClassifier {
    trees = [];
    numTrees;
    maxDepth;
    minSamplesSplit;
    numClasses = 0;
    featureNames = [];
    featureImportances = [];
    constructor(numTrees = 20, maxDepth = 7, minSamplesSplit = 4) {
        this.numTrees = numTrees;
        this.maxDepth = maxDepth;
        this.minSamplesSplit = minSamplesSplit;
    }
    train(X, y, numClasses, featureNames = []) {
        this.numClasses = numClasses;
        this.featureNames = featureNames;
        this.trees = [];
        const numSamples = X.length;
        const numFeatures = X[0]?.length || 0;
        this.featureImportances = new Array(numFeatures).fill(0);
        for (let t = 0; t < this.numTrees; t++) {
            // Bootstrap sampling with replacement
            const sampleIndices = [];
            for (let s = 0; s < numSamples; s++) {
                sampleIndices.push(Math.floor(Math.random() * numSamples));
            }
            const sampleX = sampleIndices.map((i) => X[i]);
            const sampleY = sampleIndices.map((i) => y[i]);
            const tree = new decision_tree_1.DecisionTreeClassifier(this.maxDepth, this.minSamplesSplit);
            tree.train(sampleX, sampleY, numClasses, featureNames);
            this.trees.push(tree);
            // Accumulate feature importance
            for (let f = 0; f < numFeatures; f++) {
                this.featureImportances[f] += tree.featureImportances[f] || 0;
            }
        }
        // Normalize aggregate feature importances
        const totalImportance = this.featureImportances.reduce((a, b) => a + b, 0);
        if (totalImportance > 0) {
            this.featureImportances = this.featureImportances.map((v) => v / totalImportance);
        }
    }
    predictRow(x) {
        if (this.trees.length === 0) {
            return { prediction: 0, probabilities: new Array(this.numClasses).fill(0) };
        }
        const avgProbabilities = new Array(this.numClasses).fill(0);
        for (const tree of this.trees) {
            const { probabilities } = tree.predictRow(x);
            for (let c = 0; c < this.numClasses; c++) {
                avgProbabilities[c] += (probabilities[c] || 0) / this.trees.length;
            }
        }
        let maxProb = -1;
        let bestClass = 0;
        for (let c = 0; c < this.numClasses; c++) {
            if (avgProbabilities[c] > maxProb) {
                maxProb = avgProbabilities[c];
                bestClass = c;
            }
        }
        return {
            prediction: bestClass,
            probabilities: avgProbabilities,
        };
    }
    predict(X) {
        return X.map((row) => this.predictRow(row).prediction);
    }
}
exports.RandomForestClassifier = RandomForestClassifier;
