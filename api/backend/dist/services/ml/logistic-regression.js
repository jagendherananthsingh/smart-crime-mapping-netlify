"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultinomialLogisticRegression = void 0;
class MultinomialLogisticRegression {
    weights = []; // [numClasses][numFeatures]
    biases = []; // [numClasses]
    numClasses = 0;
    numFeatures = 0;
    featureNames = [];
    means = [];
    stds = [];
    learningRate;
    iterations;
    l2Reg;
    constructor(learningRate = 0.05, iterations = 400, l2Reg = 0.001) {
        this.learningRate = learningRate;
        this.iterations = iterations;
        this.l2Reg = l2Reg;
    }
    normalize(X, isTraining = false) {
        const numSamples = X.length;
        const numFeatures = X[0]?.length || 0;
        if (isTraining) {
            this.means = new Array(numFeatures).fill(0);
            this.stds = new Array(numFeatures).fill(0);
            for (let f = 0; f < numFeatures; f++) {
                let sum = 0;
                for (let s = 0; s < numSamples; s++) {
                    sum += X[s][f];
                }
                this.means[f] = sum / (numSamples || 1);
                let varSum = 0;
                for (let s = 0; s < numSamples; s++) {
                    varSum += Math.pow(X[s][f] - this.means[f], 2);
                }
                this.stds[f] = Math.sqrt(varSum / (numSamples || 1)) || 1.0;
            }
        }
        return X.map((row) => row.map((val, f) => (val - (this.means[f] || 0)) / (this.stds[f] || 1)));
    }
    softmax(logits) {
        const maxLogit = Math.max(...logits);
        const exp = logits.map((z) => Math.exp(z - maxLogit));
        const sumExp = exp.reduce((a, b) => a + b, 0);
        return exp.map((e) => e / (sumExp || 1));
    }
    train(X, y, numClasses, featureNames = []) {
        this.numClasses = numClasses;
        this.numFeatures = X[0]?.length || 0;
        this.featureNames = featureNames;
        const normalizedX = this.normalize(X, true);
        const numSamples = normalizedX.length;
        // Initialize weights and biases to small random numbers
        this.weights = Array.from({ length: numClasses }, () => Array.from({ length: this.numFeatures }, () => (Math.random() - 0.5) * 0.01));
        this.biases = new Array(numClasses).fill(0);
        // Gradient Descent
        for (let iter = 0; iter < this.iterations; iter++) {
            const gradW = Array.from({ length: numClasses }, () => new Array(this.numFeatures).fill(0));
            const gradB = new Array(numClasses).fill(0);
            for (let s = 0; s < numSamples; s++) {
                const x_s = normalizedX[s];
                const y_s = y[s];
                // Compute logits: z_k = W_k * x + b_k
                const logits = [];
                for (let c = 0; c < numClasses; c++) {
                    let z = this.biases[c];
                    for (let f = 0; f < this.numFeatures; f++) {
                        z += this.weights[c][f] * x_s[f];
                    }
                    logits.push(z);
                }
                const probs = this.softmax(logits);
                // Compute error: (p_k - 1(y == k))
                for (let c = 0; c < numClasses; c++) {
                    const error = probs[c] - (y_s === c ? 1 : 0);
                    gradB[c] += error;
                    for (let f = 0; f < this.numFeatures; f++) {
                        gradW[c][f] += error * x_s[f];
                    }
                }
            }
            // Update parameters with L2 regularization
            for (let c = 0; c < numClasses; c++) {
                this.biases[c] -= (this.learningRate * gradB[c]) / numSamples;
                for (let f = 0; f < this.numFeatures; f++) {
                    const regGrad = this.l2Reg * this.weights[c][f];
                    this.weights[c][f] -=
                        this.learningRate * (gradW[c][f] / numSamples + regGrad);
                }
            }
        }
    }
    predictRow(x) {
        if (this.weights.length === 0) {
            return { prediction: 0, probabilities: new Array(this.numClasses).fill(0) };
        }
        const normX = x.map((val, f) => (val - (this.means[f] || 0)) / (this.stds[f] || 1));
        const logits = [];
        for (let c = 0; c < this.numClasses; c++) {
            let z = this.biases[c];
            for (let f = 0; f < this.numFeatures; f++) {
                z += this.weights[c][f] * normX[f];
            }
            logits.push(z);
        }
        const probabilities = this.softmax(logits);
        let maxProb = -1;
        let prediction = 0;
        for (let c = 0; c < this.numClasses; c++) {
            if (probabilities[c] > maxProb) {
                maxProb = probabilities[c];
                prediction = c;
            }
        }
        return { prediction, probabilities };
    }
    predict(X) {
        return X.map((row) => this.predictRow(row).prediction);
    }
    getFeatureImportances() {
        if (this.weights.length === 0)
            return [];
        // Calculate aggregate magnitude of weights for each feature across all classes
        const importances = new Array(this.numFeatures).fill(0);
        for (let f = 0; f < this.numFeatures; f++) {
            let sumMag = 0;
            for (let c = 0; c < this.numClasses; c++) {
                sumMag += Math.abs(this.weights[c][f]);
            }
            importances[f] = sumMag;
        }
        const total = importances.reduce((a, b) => a + b, 0);
        return total > 0 ? importances.map((v) => v / total) : importances;
    }
}
exports.MultinomialLogisticRegression = MultinomialLogisticRegression;
