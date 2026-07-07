package com.wallet.digitalwallet.ai;

public class AIRequest {

    private double amount;
    private int hour;
    private int day;
    private double senderBalance;
    private double receiverBalance;
    private double distance;
    private int deviceChanged;
    private int transactionsLastHour;

    public AIRequest() {
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

    public double getDistance() {
        return distance;
    }

    public void setDistance(double distance) {
        this.distance = distance;
    }

    public int getDeviceChanged() {
        return deviceChanged;
    }

    public void setDeviceChanged(int deviceChanged) {
        this.deviceChanged = deviceChanged;
    }

    public int getTransactionsLastHour() {
        return transactionsLastHour;
    }

    public void setTransactionsLastHour(int transactionsLastHour) {
        this.transactionsLastHour = transactionsLastHour;
    }

}