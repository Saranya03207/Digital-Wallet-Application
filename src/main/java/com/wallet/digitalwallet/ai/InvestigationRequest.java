package com.wallet.digitalwallet.ai;

public class InvestigationRequest {

    // Transaction Details
    private double amount;
    private int hour;
    private int day;

    // User Behaviour
    private double averageAmount;
    private long transactionsToday;
    private long transactionsLastHour;

    // Account Details
    private double senderBalance;
    private double receiverBalance;
    private int accountAgeDays;

    // Receiver Behaviour
    private long repeatedReceiver;
    private int newReceiver;

    // Security Features
    private int deviceChanged;
    private int nightTransaction;

    public InvestigationRequest() {
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public int getHour() {
        return hour;
    }

    public void setHour(int hour) {
        this.hour = hour;
    }

    public int getDay() {
        return day;
    }

    public void setDay(int day) {
        this.day = day;
    }

    public double getAverageAmount() {
        return averageAmount;
    }

    public void setAverageAmount(double averageAmount) {
        this.averageAmount = averageAmount;
    }

    public long getTransactionsToday() {
        return transactionsToday;
    }

    public void setTransactionsToday(long transactionsToday) {
        this.transactionsToday = transactionsToday;
    }

    public long getTransactionsLastHour() {
        return transactionsLastHour;
    }

    public void setTransactionsLastHour(long transactionsLastHour) {
        this.transactionsLastHour = transactionsLastHour;
    }

    public double getSenderBalance() {
        return senderBalance;
    }

    public void setSenderBalance(double senderBalance) {
        this.senderBalance = senderBalance;
    }

    public double getReceiverBalance() {
        return receiverBalance;
    }

    public void setReceiverBalance(double receiverBalance) {
        this.receiverBalance = receiverBalance;
    }

    public int getAccountAgeDays() {
        return accountAgeDays;
    }

    public void setAccountAgeDays(int accountAgeDays) {
        this.accountAgeDays = accountAgeDays;
    }

    public long getRepeatedReceiver() {
        return repeatedReceiver;
    }

    public void setRepeatedReceiver(long repeatedReceiver) {
        this.repeatedReceiver = repeatedReceiver;
    }

    public int getNewReceiver() {
        return newReceiver;
    }

    public void setNewReceiver(int newReceiver) {
        this.newReceiver = newReceiver;
    }

    public int getDeviceChanged() {
        return deviceChanged;
    }

    public void setDeviceChanged(int deviceChanged) {
        this.deviceChanged = deviceChanged;
    }

    public int getNightTransaction() {
        return nightTransaction;
    }

    public void setNightTransaction(int nightTransaction) {
        this.nightTransaction = nightTransaction;
    }
}