$(document).ready(function () {
    let animationId;
    let isAnimating = false;
    let index = 0;
    let data, car, scene, camera, renderer, controls, axesHelper;
    let anomalies = [];
    let alertTextMeshes = [];

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

        // Create and add terrain
        // var terrainGeometry = new THREE.PlaneGeometry(200, 200, 256, 256);
        // var terrainMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });

        // var terrainMesh = new THREE.Mesh(terrainGeometry, terrainMaterial);
        // terrainMesh.rotation.x = -Math.PI / 2;
        // scene.add(terrainMesh);

        // Wireframe cube for reference
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
                car.scale.set(0.2, 0.2, 0.2);

                // Center the car on the terrain
                car.position.set(0, 0, 0); // Set initial y position

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

    function createAlertText(message) {
        // Remove existing alert texts if present
        alertTextMeshes.forEach(mesh => scene.remove(mesh));
        alertTextMeshes = [];

        var loader = new THREE.FontLoader();
        loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
            var geometry = new THREE.TextGeometry(message, {
                font: font,
                size: 1,
                height: 0.1,
                curveSegments: 12,
            });

            var material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            var newAlertTextMesh = new THREE.Mesh(geometry, material);

            newAlertTextMesh.position.set(0, 10, 0); // Move the alert text up
            scene.add(newAlertTextMesh);
            alertTextMeshes.push(newAlertTextMesh);

            setTimeout(() => {
                scene.remove(newAlertTextMesh);
                alertTextMeshes = alertTextMeshes.filter(mesh => mesh !== newAlertTextMesh);
            }, 2000); // Display alert for 2 seconds
        });
    }

    function animate() {
        if (isAnimating && index < data.Timestamp.length && car) {
            car.position.set(data.x[index], 0, data.z[index]);

            var roll = data.roll[index] * Math.PI / 180;
            var pitch = data.pitch[index] * Math.PI / 180;
            var yaw = data.yaw[index] * Math.PI / 180;

            car.rotation.set(pitch, yaw, roll);

            let currentTimestamp = data.Timestamp[index];
            let anomaly = anomalies.find(a => a.timestamp === currentTimestamp);
            if (anomaly) {
                createAlertText(`Anomaly detected at timestamp: ${currentTimestamp}`);
            }

            index++;
        }

        controls.update();
        renderer.render(scene, camera);

        if (isAnimating) {
            animationId = requestAnimationFrame(animate);
        }
    }

    function startAnimation() {
        if (!isAnimating) {
            isAnimating = true;
            animate();
        }
    }

    function stopAnimation() {
        isAnimating = false;
        cancelAnimationFrame(animationId);
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
