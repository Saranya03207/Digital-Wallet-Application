import pandas as pd
import joblib

from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

# ==============================
# Load Dataset
# ==============================

df = pd.read_csv("dataset.csv")

print("Dataset Loaded Successfully")
print(df.head())

# ==============================
# Features used by AI
# ==============================

features = [

    "amount",

    "hour",

    "day",

    "senderBalance",

    "receiverBalance",

    "averageAmount",

    "todayTransactions",

    "transactionsLastHour",

    "newReceiver",

    "nightTransaction"

]

X = df[features]

# ==============================
# Scale Features
# ==============================

scaler = StandardScaler()

X_scaled = scaler.fit_transform(X)

# ==============================
# Train Isolation Forest
# ==============================

model = IsolationForest(

    contamination=0.05,

    random_state=42,

    n_estimators=200

)

model.fit(X_scaled)

# ==============================
# Save Model
# ==============================

joblib.dump(model, "model.pkl")

joblib.dump(scaler, "scaler.pkl")

print("\nAI Model Trained Successfully")

print("model.pkl saved")

print("scaler.pkl saved")