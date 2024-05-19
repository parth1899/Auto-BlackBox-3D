$(document).ready(function () {
    $.ajax({
        url: '/xyz_data',
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
        var x = data.x;
        var y = data.y;
        var z = data.z;

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
            title: 'Acceleration Data',
            xaxis: {
                title: 'Timestamp'
            },
            yaxis: {
                title: 'Acceleration'
            }
        };

        var data = [traceX, traceY, traceZ];

        Plotly.newPlot('acceleration-chart', data, layout);
    }
});
