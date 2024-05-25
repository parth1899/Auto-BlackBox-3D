$(document).ready(function () {
    $.ajax({
        url: '/pca_data',
        type: 'GET',
        success: function (response) {
            var pcaData = response;
            console.log(pcaData);
            if (Array.isArray(pcaData)) {
                var anomalies = pcaData.filter(function (data) {
                    return data.anomaly === true;
                });
                var normalData = pcaData.filter(function (data) {
                    return data.anomaly !== true;
                });

                var traceNormal = {
                    x: normalData.map(data => data.component_1),
                    y: normalData.map(data => data.component_2),
                    mode: 'markers',
                    type: 'scatter',
                    name: 'Normal Data',
                    marker: { color: 'rgba(75, 192, 192, 0.5)' }
                };

                var traceAnomalies = {
                    x: anomalies.map(data => data.component_1),
                    y: anomalies.map(data => data.component_2),
                    mode: 'markers',
                    type: 'scatter',
                    name: 'Anomalies',
                    marker: { color: 'rgba(255, 99, 132, 1)' }
                };

                var data = [traceNormal, traceAnomalies];

                var layout = {
                    title: 'PCA Components with Anomalies',
                    xaxis: { title: 'Component 1' },
                    yaxis: { title: 'Component 2' }
                };

                Plotly.newPlot('chartPlaceholder', data, layout);
            } else {
                console.error('Invalid data format:', pcaData);
            }
        },
        error: function (error) {
            console.log('Error fetching PCA data:', error);
        }
    });
});
