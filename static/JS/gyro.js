$(document).ready(function () {
    $.ajax({
        url: '/gyro_data',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.error) {
                alert(response.error);
            } else {
                var data = response;
                plotGraph(data);
            }
        },
        error: function () {
            alert('An error occurred while fetching data from the server.');
        }
    });

    function plotGraph(data) {
        var timestamp = data.Timestamp;
        var x = data.roll;
        var y = data.pitch;
        var z = data.yaw;

        var traceX = {
            x: timestamp,
            y: x,
            mode: 'lines',
            name: 'X axis'
        };

        var traceY = {
            x: timestamp,
            y: y,
            mode: 'lines',
            name: 'Y axis'
        };

        var traceZ = {
            x: timestamp,
            y: z,
            mode: 'lines',
            name: 'Z axis'
        };

        var layout = {
            title: 'Gyroscope Data',
            xaxis: {
                title: 'Timestamp'
            },
            yaxis: {
                title: 'Angular Velocity'
            }
        };

        var data = [traceX, traceY, traceZ];

        Plotly.newPlot('gyroscope-chart', data, layout);
    }
});
