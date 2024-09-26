from joblib import load

def predict_gender(height, weight):
    clf_loaded = load('weight-height.pkl')

    prediction = clf_loaded.predict([[height, weight]])

    return str(prediction[0])

#height = 155
#weight = 40
#result = predict_gender(height, weight)
#if result == "male":
#    print("Nam")
#else:
#    print("Nu")
