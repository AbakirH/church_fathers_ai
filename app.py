from flask import Flask, request, jsonify
from keras.models import load_model
import numpy as np

import google.generativeai as genai
import google.ai.generativelanguage as glm
from google.api_core import retry
import json
import os

app = Flask(__name__)

@app.route('/<version>', methods=['POST'])
def test_classifier(version):
    if not request.is_json:
        return "Missing JSON in request", 400

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

    # Add further code to use loaded_model and label_mapping as needed

    return predicted_label
