$(document).ready(function () {
    let animationId;
    let isAnimating = false;
    let index = 0;
    let data, car, scene, camera, renderer, controls, axesHelper;
    let anomalies = [];
    let alertTextMeshes = [];
    let speed = 1; // Car speed in km/h
    let maxSpeed = 100; // Maximum speed in km/h
    let acceleration = 0.1; // Acceleration rate
    let brakeDeceleration = 0.2; // Deceleration rate when braking
    let groundPlanes = [];
    let carDirection = new THREE.Vector3(0, 0, 1); // Initial car direction

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

        // Add dynamic lighting
        var ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
        scene.add(ambientLight);

        var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        scene.add(directionalLight);

        function updateLighting() {
            let time = new Date().getHours();
            if (time >= 6 && time <= 18) {
                directionalLight.intensity = 0.5; // Daytime lighting
            } else {
                directionalLight.intensity = 0.1; // Nighttime lighting
            }
        }

        updateLighting();
        setInterval(updateLighting, 60000); // Update lighting every minute

        // Create multiple ground planes for continuous movement effect
        createGroundPlanes();

        camera.position.z = 50;

        window.addEventListener('resize', onWindowResize, false);
    }

    function createGroundPlanes() {
        const planeSize = 200;
        var textureLoader = new THREE.TextureLoader();
        var groundTexture = textureLoader.load('https://threejs.org/examples/textures/terrain/grasslight-big.jpg');
        groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set(4, 4);

        for (let i = 0; i < 3; i++) { // Create 3 ground planes
            var groundGeometry = new THREE.PlaneGeometry(planeSize, planeSize, 32, 32);
            var groundMaterial = new THREE.MeshBasicMaterial({ map: groundTexture });
            var ground = new THREE.Mesh(groundGeometry, groundMaterial);
            ground.rotation.x = -Math.PI / 2;
            ground.position.y = -1;
            ground.position.z = i * planeSize; // Position planes sequentially
            scene.add(ground);
            groundPlanes.push(ground);
        }
    }

    function loadCarModel() {
        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.load('/static/models/NISSAN-GTR.mtl', function (materials) {
            materials.preload();

            var objLoader = new THREE.OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.load('/static/models/NISSAN-GTR.obj', function (object) {
                car = object;
                car.scale.set(0.1, 0.1, 0.1);

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
            // Update car speed based on user input
            let inputSpeed = parseFloat($('#speed-range').val());
            if (speed < inputSpeed) {
                speed += acceleration;
                if (speed > inputSpeed) speed = inputSpeed;
            } else if (speed > inputSpeed) {
                speed -= brakeDeceleration;
                if (speed < inputSpeed) speed = inputSpeed;
            }

            // Update speedometer
            $('#speedometer').text(`Speed: ${Math.round(speed)} km/h`);

            // Calculate new ground position based on speed and yaw angle
            let yaw = data.yaw[index] * Math.PI / 180;
            let deltaX = (speed / 3.6) * Math.sin(yaw); // Convert speed from km/h to m/s
            let deltaZ = (speed / 3.6) * Math.cos(yaw);

            groundPlanes.forEach(ground => {
                ground.position.x -= deltaX;
                ground.position.z -= deltaZ;

                // Loop ground planes
                if (ground.position.z < -200) {
                    ground.position.z += 600; // Move to the back
                }
            });

            // Rotate the car according to pitch and roll
            var roll = data.roll[index] * Math.PI / 180;
            var pitch = data.pitch[index] * Math.PI / 180;
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

    $('#speed-range').on('input', function () {
        // No need to update speed here; it will be managed in the animate function
    });
});
