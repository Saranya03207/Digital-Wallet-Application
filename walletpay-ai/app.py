from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI()

# ===================================================
# Load AI Model
# ===================================================

model = joblib.load("model.pkl")
scaler = joblib.load("scaler.pkl")


# ===================================================
# Transaction Prediction Request
# ===================================================

class TransactionRequest(BaseModel):

    amount: float
    hour: int
    day: int

    senderBalance: float
    receiverBalance: float

    averageAmount: float

    transactionsToday: int
    transactionsLastHour: int

    newReceiver: int
    nightTransaction: int


# ===================================================
# Investigation Request
# ===================================================

class InvestigationRequest(BaseModel):

    amount: float
    hour: int
    day: int

    senderBalance: float
    receiverBalance: float

    averageAmount: float

    transactionsToday: int
    transactionsLastHour: int

    newReceiver: int
    nightTransaction: int

    accountAgeDays: int
    repeatedReceiver: int
    deviceChanged: int


# ===================================================
# Shared AI Function
# ===================================================

def analyse_transaction(features):

    features = scaler.transform(features)

    prediction = model.predict(features)[0]

    anomaly_score = model.decision_function(features)[0]

    # Map anomaly score to a 0-100 risk score
    # Normal samples (prediction == 1, anomaly_score > 0): risk score between 5 and 45
    # Anomalous samples (prediction == -1, anomaly_score <= 0): risk score between 55 and 95
    if prediction == 1:
        # Scale positive anomaly score to [5, 45] range
        # Higher anomaly_score means more normal (lower risk)
        risk_score = 45.0 - (anomaly_score * 150.0)
        risk_score = max(5.0, min(45.0, risk_score))
        result = "Normal"
        reason = "Transaction matches customer's normal behaviour."
    else:
        # Scale negative anomaly score to [55, 95] range
        # More negative anomaly_score means more anomalous (higher risk)
        risk_score = 55.0 + (abs(anomaly_score) * 200.0)
        risk_score = max(55.0, min(95.0, risk_score))
        
        if risk_score >= 85:
            result = "Fraud"
            reason = "Multiple abnormal behaviour patterns detected."
        else:
            result = "Suspicious"
            reason = "Behaviour deviates from normal transaction history."

    return {
        "prediction": result,
        "score": round(risk_score, 2),
        "reason": reason
    }


# ===================================================
# Prediction API
# ===================================================

@app.post("/predict")
def predict(request: TransactionRequest):

    features = np.array([[
        request.amount,
        request.hour,
        request.day,
        request.senderBalance,
        request.receiverBalance,
        request.averageAmount,
        request.transactionsToday,
        request.transactionsLastHour,
        request.newReceiver,
        request.nightTransaction
    ]])

    return analyse_transaction(features)


# ===================================================
# Investigation API
# ===================================================

@app.post("/investigate")
def investigate(request: InvestigationRequest):

    features = np.array([[
        request.amount,
        request.hour,
        request.day,
        request.senderBalance,
        request.receiverBalance,
        request.averageAmount,
        request.transactionsToday,
        request.transactionsLastHour,
        request.newReceiver,
        request.nightTransaction
    ]])

    result = analyse_transaction(features)

    # Use the correct mapped risk score from analyse_transaction
    score = result["score"]

    # =====================================
    # Behaviour Score Adjustments
    # =====================================

    if request.accountAgeDays < 7:
        score += 3

    if request.repeatedReceiver == 0:
        score += 2

    if request.deviceChanged == 1:
        score += 5

    score = min(score, 100)

    result["score"] = round(score, 2)

    # =====================================
    # Final Investigation Result
    # =====================================

    if score >= 98:

        result["prediction"] = "Fraud"

        result["reason"] = (
            "AI detected multiple high-risk behavioural indicators."
        )

    elif score >= 90:

        result["prediction"] = "Suspicious"

        result["reason"] = (
            "Behaviour requires further investigation."
        )

    else:

        result["prediction"] = "Normal"

        result["reason"] = (
            "Behaviour is consistent with previous activity."
        )

    return result