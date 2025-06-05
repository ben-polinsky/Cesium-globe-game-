// Set up CesiumJS
Cesium.Ion.defaultAccessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4ZTlhZTM1MC1lNjM0LTRkNTQtYTE3OC02NWI0YjQ3NTAxNzgiLCJpZCI6MjU5LCJpYXQiOjE3NDg4ODUxMzV9.8mGFxgmp1QW0MIdArET4EVn5c7DKlt_HHA_Gnnu7eF4";
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

async function fetchNearestPlace(lat, lon) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed request');
        const data = await response.json();
        const addr = data.address || {};
        const place = addr.city || addr.town || addr.village || addr.hamlet || addr.state || addr.country;
        return place || 'the ocean';
    } catch (err) {
        console.error(err);
        return 'an unknown place';
    }
}

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

    function animateSpin() {
        const delta = Date.now() - start;
        const rotationAngle = (delta / spinDuration) * Math.PI * 2; // Full rotation over spinDuration
        viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, rotationAngle);
        if (delta < spinDuration) {
            requestAnimationFrame(animateSpin);
        } else {
            const cartesian = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(fingerX, fingerY));
            if (cartesian) {
                const cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesian);
                const lat = Cesium.Math.toDegrees(cartographic.latitude);
                const lon = Cesium.Math.toDegrees(cartographic.longitude);
                fetchNearestPlace(lat, lon).then((place) => {
                    resultEl.textContent = `You landed near ${place} at ${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
                });
            } else {
                resultEl.textContent = 'Finger is not over the globe.';
            }
            spinButton.disabled = false;
        }
    };

    animateSpin();
}

spinButton.addEventListener('click', spinGlobe);
