import re
import tqdm
import keras
import numpy as np
import pandas as pd
import json
import copy

import google.generativeai as genai
import google.ai.generativelanguage as glm

import seaborn as sns
import matplotlib.pyplot as plt

from keras import layers
from matplotlib.ticker import MaxNLocator

from google.api_core import retry

genai.configure(api_key="Your_API_Key_Here")
  ``
with open("./bible_train.json", 'r') as file:
    church_father_texts_train = pd.read_json(file).transpose()


from tqdm.auto import tqdm
tqdm.pandas()


def make_embed_text_fn(model):

  @retry.Retry(timeout=300.0)
  def embed_fn(text: str) -> list[float]:
    # Set the task_type to CLASSIFICATION.
    try:
      embedding = genai.embed_content(model=model,
                                      content=text,
                                      task_type="classification")
      v1 = embedding['embedding']
      v1_normalized = v1 / np.linalg.norm(v1)
      return v1_normalized
    except Exception as e:
      print(e)
      return []

  return embed_fn

def create_embeddings(model, df):
    returnVal = df['text'].progress_apply(make_embed_text_fn(model))
    if len(returnVal) > 0:
      df['Embeddings'] = returnVal
    return df


# print(church_father_texts_train.index)
model = 'models/text-embedding-004'
df_train = create_embeddings(model, church_father_texts_train)

embedding_size = len(df_train['Embeddings'].iloc[0])

def build_classification_model(input_size: int, num_classes: int) -> keras.Model:
    inputs = x = keras.Input(shape=(input_size,))
    x = layers.Dense(input_size, activation='relu')(x)
    x = layers.Dense(num_classes, activation='sigmoid')(x)
    return keras.Model(inputs=inputs, outputs=x)

embedding_size = len(df_train['Embeddings'].iloc[0])

# Get unique labels from the training data
unique_labels = df_train['bible_label'].unique()

# Create a label mapping dictionary
label_mapping = {label: i for i, label in enumerate(unique_labels)}
label_mapping = {i: label for label, i in label_mapping.items()}

label_mapping_path = "bible_train.json"
with open(label_mapping_path, "w") as f:
    json.dump(label_mapping, f)


classifier = build_classification_model(embedding_size, len(unique_labels))
classifier.summary()

classifier.compile(loss = keras.losses.SparseCategoricalCrossentropy(from_logits=True),
                   optimizer = keras.optimizers.Adam(learning_rate=0.001),
                   metrics=['accuracy'])

model_path = "bible_train.h5"  # Provide the desired path to save the model
classifier.save(model_path)

print("Model saved successfully at:", model_path)