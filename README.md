# Auto-BlackBox-3D

## Employing Black Box Mechanism for Investigation and Analysis of Road Accidents

## Overview
This project presents a novel system for accident analysis using advanced sensor technology. The system gathers real-time acceleration, gyroscope, and GPS data to create detailed 3D models of vehicle orientation during accidents. By employing machine learning techniques and data visualization tools, the system enhances post-accident analysis and provides valuable feedback for improving vehicle design and safety.

## Features
- **Data Collection**: Utilizes MPU6050 and GPS sensors to gather acceleration, gyroscope, and location data.
- **Anomaly Detection**: Employs autoencoders to detect anomalies in acceleration values.
- **3D Modeling**: Uses Three.js to create real-time 3D models of vehicle orientation.
- **Data Visualization**: Implements Plotly.js for comprehensive data visualization.
- **Location Tracking**: Integrates OpenStreetMap API for live GPS tracking.

## System Architecture
![System Architecture](images/system-architecture.png)

## Methodology
1. **Data Collection**: Sensors capture acceleration, gyroscope, and GPS data.
2. **Data Processing**: NodeMCU processes and transmits data to the cloud.
3. **3D Modeling**: Three.js visualizes vehicle orientation in 3D.
4. **Anomaly Detection**: Autoencoders identify anomalies in the data.
5. **Data Visualization**: Plotly.js generates graphs for data analysis.

## Results
- **3D Model Rendering**: Real-time visualization of vehicle orientation during accidents.
- **Anomaly Detection**: Identified 581 anomalies with a 94.99% accuracy rate.
- **Data Visualization**: Comprehensive graphs showing acceleration and gyroscope data.

### Homepage of Flask Application
![Homepage of Flask Application](images/homepage.png)

### Hardware Connections
![Hardware Connections](images/hardware.png)

### Viewing 3D Model
![Viewing 3D Model](images/view-3D-Model.png)

### Anomalies
![Anomalies](images/anomalies.png)

### PCA Projection of Sensor Readings
![PCA Projection of Sensor Readings](images/pca.png)

### Tracking Live Location
![Tracking Live Location](images/tracking.png)
