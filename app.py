from flask import Flask, render_template, request, jsonify
import pandas as pd

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

if __name__ == '__main__':
    app.run(debug=True)
