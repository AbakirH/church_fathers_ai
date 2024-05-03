from flask import Flask, request, jsonify
from keras.models import load_model
from flask_cors import CORS, cross_origin
import numpy as np

import json
import os

app = Flask(__name__)
cors = CORS(app)

# @app.after_request
# def add_cors_headers(response):
#     response.headers.add("Access-Control-Allow-Origin", "*")
#     response.headers.add("Access-Control-Allow-Headers", "*")
#     response.headers.add("Access-Control-Allow-Methods", "*")
#     return response

@app.route('/<version>', methods=['POST'])
def test_classifier(version):
    if not request.is_json:
        response = {
            "predicted_label": "Missing JSON in request",
            "success":  false 
        }
        return jsonify(response)

    # Extract the JSON data
    data = request.get_json()
    input_embedding = data.get('text_vector')

    
    label_mapping_path = os.path.join(app.root_path, 'classifiers', f'bible_label_mapping_{version}.json')
    with open(label_mapping_path, "r") as f:
        label_mapping = json.load(f)

    model_path = os.path.join(app.root_path, 'classifiers', f'bible_label_classifier_{version}.keras')
    loaded_model = load_model(model_path)
    
    predictions = loaded_model.predict(np.array([input_embedding]))

    # Interpret the predictions (similar to before)
    predicted_label_index = np.argmax(predictions)
    predicted_label = label_mapping[str(predicted_label_index)]

    response = {
        "predicted_label": predicted_label,
        "success": True  
    }

    return jsonify(response)

@app.route('/', methods=['GET'])
def default_endpoint():
    return "Welcome to the default endpoint of the classifier service!"