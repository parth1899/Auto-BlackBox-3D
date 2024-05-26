$(document).ready(function () {
    let animationId;
    let isAnimating = false;
    let index = 0;
    let data, car, scene, camera, renderer, controls, axesHelper;
    let anomalies = [];

    function fetchData() {
        $.ajax({
            url: '/data',
            type: 'GET',
            dataType: 'json',
            success: function (response) {
                if (response.error) {
                    alert(response.error);
                } else {
                    data = response.data;
                    anomalies = response.anomalies || [];
                    initializeScene();
                    loadCarModel();
                    enableButtons();
                    startAnimation();
                }
            },
            error: function () {
                alert('An error occurred while fetching data from the server.');
            }
        });
    }

    fetchData();

    function initializeScene() {
        $('#container').empty();

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('container').appendChild(renderer.domElement);

        controls = new THREE.OrbitControls(camera, renderer.domElement);

        var light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5).normalize();
        scene.add(light);

        var gridHelper = new THREE.GridHelper(100, 100);
        scene.add(gridHelper);

        var geometry = new THREE.BoxGeometry(100, 100, 100);
        var material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
        var mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        camera.position.z = 50;

        window.addEventListener('resize', onWindowResize, false);
    }

    function loadCarModel() {
        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.load('/static/models/NISSAN-GTR.mtl', function (materials) {
            materials.preload();

            var objLoader = new THREE.OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.load('/static/models/NISSAN-GTR.obj', function (object) {
                car = object;
                car.scale.set(0.01, 0.01, 0.01);
                scene.add(car);

                axesHelper = new THREE.AxesHelper(2);
                car.add(axesHelper);
            });
        });
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
        if (isAnimating && index < data.Timestamp.length && car) {
            car.position.set(data.x[index], data.y[index], data.z[index]);

            var roll = data.roll[index] * Math.PI / 180;
            var pitch = data.pitch[index] * Math.PI / 180;
            var yaw = data.yaw[index] * Math.PI / 180;

            car.rotation.set(pitch, yaw, roll);

            // Check for anomalies
            let currentTimestamp = data.Timestamp[index];
            let anomaly = anomalies.find(a => a.timestamp === currentTimestamp);
            if (anomaly) {
                alert(`Anomaly detected at timestamp: ${currentTimestamp}`);
            }

            index++;
        }

        controls.update();
        renderer.render(scene, camera);

        animationId = requestAnimationFrame(animate);
    }

    function startAnimation() {
        if (!isAnimating) {
            isAnimating = true;
        }
        animate();
    }

    function stopAnimation() {
        isAnimating = false;
    }

    function restartAnimation() {
        stopAnimation();
        index = 0;
        startAnimation();
    }

    function enableButtons() {
        $('#start-btn').prop('disabled', false);
        $('#stop-btn').prop('disabled', false);
        $('#restart-btn').prop('disabled', false);
    }

    $('#start-btn').click(startAnimation);
    $('#stop-btn').click(stopAnimation);
    $('#restart-btn').click(restartAnimation);
});
