
package com.wallet.digitalwallet.dto;

public class AIDashboardResponse {

    private long totalTransactions;

    private long analysedTransactions;

    private long normalTransactions;

    private long suspiciousTransactions;

    private long fraudTransactions;

    private double averageScore;

    public long getTotalTransactions() {
        return totalTransactions;
    }

    public void setTotalTransactions(long totalTransactions) {
        this.totalTransactions = totalTransactions;
    }

    public long getAnalysedTransactions() {
        return analysedTransactions;
    }

    public void setAnalysedTransactions(long analysedTransactions) {
        this.analysedTransactions = analysedTransactions;
    }

    public long getNormalTransactions() {
        return normalTransactions;
    }

    public void setNormalTransactions(long normalTransactions) {
        this.normalTransactions = normalTransactions;
    }

    public long getSuspiciousTransactions() {
        return suspiciousTransactions;
    }

    public void setSuspiciousTransactions(long suspiciousTransactions) {
        this.suspiciousTransactions = suspiciousTransactions;
    }

    public long getFraudTransactions() {
        return fraudTransactions;
    }

    public void setFraudTransactions(long fraudTransactions) {
        this.fraudTransactions = fraudTransactions;
    }

    public double getAverageScore() {
        return averageScore;
    }

    public void setAverageScore(double averageScore) {
        this.averageScore = averageScore;
    }

}