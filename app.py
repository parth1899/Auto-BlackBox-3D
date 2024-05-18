from flask import Flask, render_template, request, jsonify
import pandas as pd

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
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
            return jsonify(data)
        else:
            missing_columns = required_columns - set(df.columns)
            return jsonify({'error': f'CSV file is missing required columns: {", ".join(missing_columns)}'})

    return jsonify({'error': 'Invalid file type. Only CSV files are allowed'})

if __name__ == '__main__':
    app.run(debug=True)
