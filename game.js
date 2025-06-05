// Initialize the Cesium viewer
const viewer = new Cesium.Viewer('cesiumContainer', {
    animation: false,
    timeline: false,
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    infoBox: false,
    selectionIndicator: false
});

const resultEl = document.getElementById('result');
const spinButton = document.getElementById('spinButton');
const fingerEl = document.getElementById('finger');
const container = document.getElementById('cesiumContainer');

// show the finger overlay immediately
fingerEl.style.display = 'block';

let fingerX = 0;
let fingerY = 0;

container.addEventListener('mousemove', (e) => {
    fingerX = e.clientX;
    fingerY = e.clientY;
    fingerEl.style.left = fingerX + 'px';
    fingerEl.style.top = fingerY + 'px';
});


function spinGlobe() {
    spinButton.disabled = true;
    resultEl.textContent = 'Spinning...';
    const start = Date.now();
    const spinDuration = 3000; // milliseconds

    const interval = setInterval(() => {
        const delta = Date.now() - start;
        viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, 0.1);
        if (delta >= spinDuration) {
            clearInterval(interval);
            const cartesian = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(fingerX, fingerY));
            if (cartesian) {
                const cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian);
                const lat = Cesium.Math.toDegrees(cartographic.latitude);
                const lon = Cesium.Math.toDegrees(cartographic.longitude);
                viewer.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(lon, lat, 2000000)
                });
                resultEl.textContent = `You live at: ${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
            } else {
                resultEl.textContent = 'Finger is not over the globe.';
            }
            spinButton.disabled = false;
        }
    }, 50);
}

spinButton.addEventListener('click', spinGlobe);
