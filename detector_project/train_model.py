import os
import requests
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import joblib

DATA_URLS = [
    "https://raw.githubusercontent.com/abbylmm/fake_job_posting/main/data/fake_job_postings.csv",
    "https://raw.githubusercontent.com/Anshupriya2694/Fake-Job-Posting-Prediction/master/fake_job_postings.csv"
]
CSV_PATH = "fake_job_postings.csv"
MODEL_DIR = os.path.join("detector_app", "ml_models")
VECTORIZER_PATH = os.path.join(MODEL_DIR, "tfidf_vectorizer.joblib")
MODEL_PATH = os.path.join(MODEL_DIR, "job_classifier.joblib")

def download_data():
    if os.path.exists(CSV_PATH):
        print(f"Dataset already exists at {CSV_PATH}. Skipping download.")
        return True

    print("Attempting to download dataset...")
    for url in DATA_URLS:
        try:
            print(f"Downloading from: {url}")
            response = requests.get(url, timeout=60)
            if response.status_code == 200:
                with open(CSV_PATH, 'wb') as f:
                    f.write(response.content)
                print("Dataset downloaded successfully!")
                return True
            else:
                print(f"Failed with status code: {response.status_code}")
        except Exception as e:
            print(f"Error downloading from {url}: {e}")
    return False

def train_pipeline():
    # 1. Download data
    if not download_data():
        print("ERROR: Could not download the dataset from any of the URLs. Exiting.")
        return

    # 2. Load and clean data
    print("Loading data...")
    df = pd.read_csv(CSV_PATH)
    
    # Fill NaN values with empty strings
    text_cols = ['title', 'company_profile', 'description', 'requirements']
    for col in text_cols:
        df[col] = df[col].fillna('')

    # Combine text features
    print("Combining text features...")
    df['combined_text'] = (
        df['title'] + " " + 
        df['company_profile'] + " " + 
        df['description'] + " " + 
        df['requirements']
    )

    X = df['combined_text']
    y = df['fraudulent']

    print(f"Dataset summary: Total={len(df)}, Real={sum(y == 0)}, Fake={sum(y == 1)}")

    # 3. Train-Test Split (stratified due to class imbalance)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # 4. TF-IDF Vectorization
    print("Vectorizing text using TF-IDF...")
    vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    # 5. Train Logistic Regression model with balanced class weights
    print("Training Logistic Regression model...")
    model = LogisticRegression(class_weight='balanced', max_iter=1000, random_state=42)
    model.fit(X_train_vec, y_train)

    # 6. Evaluate Model
    y_pred = model.predict(X_test_vec)
    print("\n--- Model Evaluation Results ---")
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    # 7. Save model artifacts
    os.makedirs(MODEL_DIR, exist_ok=True)
    print(f"Saving TfidfVectorizer to {VECTORIZER_PATH}...")
    joblib.dump(vectorizer, VECTORIZER_PATH)
    print(f"Saving Logistic Regression Classifier to {MODEL_PATH}...")
    joblib.dump(model, MODEL_PATH)
    print("Pipeline training completed successfully!")

if __name__ == "__main__":
    train_pipeline()
