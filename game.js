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
const infoOverlay = document.getElementById('infoOverlay');

// show the finger overlay immediately
fingerEl.style.display = 'block';

async function fetchPlaceInfo(lat, lon) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&email=demo@example.com`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed request');
        const data = await response.json();
        const addr = data.address || {};
        const water = addr.ocean || addr.sea || addr.river || addr.water;
        const place = addr.city || addr.town || addr.village || addr.hamlet || addr.state || addr.country;
        return { place: place || water || 'the ocean', waterName: water };
    } catch (err) {
        console.error(err);
        return { place: 'an unknown place', waterName: null };
    }
}

async function fetchWikiSummary(title) {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('No wiki page');
    return await response.json();
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
                fetchPlaceInfo(lat, lon).then(async (info) => {
                    const msg = info.waterName
                        ? `You landed in the ${info.waterName} at ${lat.toFixed(2)}°, ${lon.toFixed(2)}°`
                        : `You landed near ${info.place} at ${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
                    resultEl.textContent = msg;
                    try {
                        const wiki = await fetchWikiSummary(info.waterName || info.place);
                        let html = `<strong>${wiki.title}</strong><br>${wiki.extract}`;
                        if (wiki.thumbnail && wiki.thumbnail.source) {
                            html += `<br><img src="${wiki.thumbnail.source}" alt="${wiki.title}">`;
                        }
                        infoOverlay.innerHTML = html;
                        infoOverlay.style.display = 'block';
                    } catch (e) {
                        infoOverlay.style.display = 'none';
                    }
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
