$(document).ready(function () {
    $.ajax({
        url: '/anomalies_data',
        method: 'GET',
        success: function (data) {
            let tableBody = '';
            $.each(data, function (index, anomaly) {
                tableBody += `<tr>
                                <td>${index + 1}</td>
                                <td>${anomaly.index}</td>
                                <td>${anomaly.timestamp}</td>
                              </tr>`;
            });
            $('#anomalyTable tbody').html(tableBody);
        },
        error: function (error) {
            console.log('Error fetching anomaly data:', error);
        }
    });
});