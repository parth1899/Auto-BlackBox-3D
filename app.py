from flask import Flask, render_template, request, jsonify
import numpy as np
import pandas as pd
from sklearn.discriminant_analysis import StandardScaler
import tensorflow as tf
from sklearn.decomposition import PCA

app = Flask(__name__)

stored_data = None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/uploadform')
def upload_form():
    return render_template('form.html')

@app.route('/models')
def view_model():
    return render_template('model.html')

@app.route('/acceleration')
def acceleration_graph():
    return render_template('acceleration.html')

@app.route('/gyro')
def gyro_graph():
    return render_template('gyro.html')

@app.route('/anomalies_page')
def anomalies_page():
    return render_template('anomalies.html')

@app.route('/anomalies_graph')
def graph():
    return render_template('anomalies_graph.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    global stored_data
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    if file and file.filename.endswith('.csv'):
        df = pd.read_csv(file)
        required_columns = {'Timestamp', 'Acceleration_X', 'Acceleration_Y', 'Acceleration_Z', 'Rotation_X', 'Rotation_Y', 'Rotation_Z'}
        if required_columns.issubset(df.columns):
            data = {
                'Timestamp': df['Timestamp'].tolist(),
                'x': df['Acceleration_X'].tolist(),
                'y': df['Acceleration_Y'].tolist(),
                'z': df['Acceleration_Z'].tolist(),
                'roll': df['Rotation_X'].tolist(),
                'pitch': df['Rotation_Y'].tolist(),
                'yaw': df['Rotation_Z'].tolist(),
            }
            stored_data = data
            # print(stored_data)
            return jsonify({'message': 'File uploaded successfully'})
        else:
            missing_columns = required_columns - set(df.columns)
            return jsonify({'error': f'CSV file is missing required columns: {", ".join(missing_columns)}'})

    return jsonify({'error': 'Invalid file type. Only CSV files are allowed'})

@app.route('/data', methods=['GET'])
def get_data():
    global stored_data
    if stored_data:
        return jsonify(stored_data)
    else:
        return jsonify({'error': 'No data available'})

@app.route('/gyro_data', methods=['GET'])
def get_gyro():
    global stored_data
    if stored_data:
        xyz_data = {'Timestamp':stored_data['Timestamp'], 'roll': stored_data['roll'], 'pitch': stored_data['pitch'], 'yaw': stored_data['yaw']}
        return jsonify(xyz_data)
    else:
        return jsonify({'error': 'No data available'})
    
@app.route('/xyz_data', methods=['GET'])
def get_xyz_data():
    global stored_data
    if stored_data:
        gyro_data = {'Timestamp':stored_data['Timestamp'], 'x': stored_data['x'], 'y': stored_data['y'], 'z': stored_data['z']}
        return jsonify(gyro_data)
    else:
        return jsonify({'error': 'No data available'})

model = tf.keras.models.load_model('autoencoder_model.keras')

@app.route('/anomalies_data', methods=['GET'])
def detect_anomalies():
    global stored_data

    stored_data_df = pd.DataFrame(stored_data)

    features = stored_data_df.drop('Timestamp', axis=1)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(features)

    reconstructed = model.predict(X_scaled)
    mse = np.mean(np.power(X_scaled - reconstructed, 2), axis=1)

    threshold = np.percentile(mse, 99)

    anomalies = mse > threshold
    anomaly_indices = stored_data_df.index[anomalies].tolist()

    anomaly_timestamps = stored_data_df.loc[anomaly_indices, 'Timestamp'].tolist()

    anomaly_data = [{'index': idx, 'timestamp': timestamp} for idx, timestamp in zip(anomaly_indices, anomaly_timestamps)]
    
    return jsonify(anomaly_data)

@app.route('/pca_data', methods=['GET'])
def get_pca_data():
    global stored_data

    stored_data_df = pd.DataFrame(stored_data)

    features = stored_data_df.drop('Timestamp', axis=1)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(features)

    reconstructed = model.predict(X_scaled)
    mse = np.mean(np.power(X_scaled - reconstructed, 2), axis=1)

    threshold = np.percentile(mse, 99)

    anomalies = mse > threshold
    
    # Perform PCA
    pca = PCA(n_components=2)  # You can choose the number of components as per your requirement
    pca_components = pca.fit_transform(X_scaled)

    # Convert anomalies to a list before JSON serialization
    anomalies_list = anomalies.tolist()

    pca_data = [{'component_1': component[0], 'component_2': component[1], 'anomaly': anomaly} 
                for component, anomaly in zip(pca_components, anomalies_list)]

    return jsonify(pca_data)

if __name__ == '__main__':
    app.run(debug=True)
