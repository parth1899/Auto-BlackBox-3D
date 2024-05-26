$(document).ready(function (){
    var map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([73.7831388, 18.5434664]), // Initial center
            zoom: 10
        })
    });

    var marker = new ol.Overlay({
        position: ol.proj.fromLonLat([73.7831388, 18.5434664]), // Initial position
        positioning: 'center-center',
        element: document.createElement('div'),
        stopEvent: false
    });
    marker.getElement().style.background = 'red';
    marker.getElement().style.width = '10px';
    marker.getElement().style.height = '10px';
    marker.getElement().style.borderRadius = '50%';
    map.addOverlay(marker);

    function updateLocation() {
        fetch('/live-coordinates')
            .then(response => response.json())
            .then(data => {
                var newPos = ol.proj.fromLonLat([data.lng, data.lat]);
                marker.setPosition(newPos);
                map.getView().setCenter(newPos);
            })
            .catch(error => console.error('Error:', error));
    }

    // Update location every 5 seconds
    setInterval(updateLocation, 5000);
})
