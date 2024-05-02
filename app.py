from flask import Flask
from keras.models import load_model
import numpy as np

import google.generativeai as genai
import google.ai.generativelanguage as glm
from google.api_core import retry
import json

app = Flask(__name__)

@app.route('/v1')
def test_classifier():
    version = "v5_new_commentary"
    label_mapping_path = "classifiers/bible_label_mapping_" + version + ".json"  # Specify the path where the label mapping JSON file is saved
    with open(label_mapping_path, "r") as f:
        label_mapping = json.load(f)

    # Load the saved model
    model_path = "classifiers/bible_label_classifier_" + version + ".keras"  # Specify the path where the model is saved
    loaded_model = load_model(model_path)
