import { Viewer, Ion, Cartesian3, Cartesian2, Ellipsoid, Math } from "cesium";
// import "cesium/Build/Cesium/Widgets/widgets.css";

// Set up CesiumJS access token
Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4ZTlhZTM1MC1lNjM0LTRkNTQtYTE3OC02NWI0YjQ3NTAxNzgiLCJpZCI6MjU5LCJpYXQiOjE3NDg4ODUxMzV9.8mGFxgmp1QW0MIdArET4EVn5c7DKlt_HHA_Gnnu7eF4";

// Initialize the Cesium viewer
const viewer = new Viewer("cesiumContainer", {
  animation: false,
  timeline: false,
  baseLayerPicker: false,
  geocoder: false,
  homeButton: false,
  sceneModePicker: false,
  navigationHelpButton: false,
  infoBox: false,
  selectionIndicator: false,
});

const resultEl = document.getElementById("result");
const spinButton = document.getElementById(
  "spinButton"
) as HTMLButtonElement | null;
const fingerEl = document.getElementById("finger");
const container = document.getElementById("cesiumContainer");
const infoOverlay = document.getElementById("infoOverlay");

if (!resultEl || !spinButton || !fingerEl || !container || !infoOverlay) {
  throw new Error("Required HTML elements are missing");
}

// show the finger overlay immediately
if (fingerEl) fingerEl.style.display = "block";

interface PlaceInfo {
  place: string;
  waterName: string | null;
}

async function fetchPlaceInfo(lat: number, lon: number): Promise<PlaceInfo> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&email=demo@example.com`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed request");

    const data = await response.json();
    const addr = data.address || {};
    let water = addr.ocean || addr.sea || addr.river || addr.water;
    const place =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.hamlet ||
      addr.state ||
      addr.country;

    if (!water) {
      try {
        water = await fetchWaterBody(lat, lon);
      } catch (e) {
        console.error(e);
      }
    }
    return { place: place || water || "the ocean", waterName: water };
  } catch (err) {
    console.error(err);
    return { place: "an unknown place", waterName: null };
  }
}

async function fetchWikiSummary(title: string): Promise<any> {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
    title
  )}`;

  const response = await fetch(url);

  if (!response.ok) throw new Error("No wiki page");

  return await response.json();
}

async function fetchOfficialWebsite(
  wikibaseId: string | null
): Promise<string | null> {
  if (!wikibaseId) return null;

  const url = `https://www.wikidata.org/wiki/Special:EntityData/${wikibaseId}.json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("No wikidata");

  const data = await response.json();
  const entity = data.entities && data.entities[wikibaseId];
  const claim =
    entity && entity.claims && entity.claims.P856 && entity.claims.P856[0];

  return claim && claim.mainsnak && claim.mainsnak.datavalue
    ? claim.mainsnak.datavalue.value
    : null;
}

async function fetchImage(title: string): Promise<any | null> {
  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(
    title
  )}&page_size=1`;
  const response = await fetch(url);
  if (!response.ok) return null;

  const data = await response.json();
  if (data.results && data.results.length > 0) {
    return data.results[0];
  }

  return null;
}

async function fetchWaterBody(
  lat: number,
  lon: number
): Promise<string | null> {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed water lookup");

  const data = await response.json();
  const info = (data.localityInfo && data.localityInfo.informative) || [];

  for (const item of info) {
    const name = item.name || "";
    const desc = (item.description || "").toLowerCase();

    if (
      /ocean|sea|gulf|bay|strait|channel|lake/.test(name.toLowerCase()) ||
      /ocean|sea|gulf|bay|strait|channel|lake/.test(desc)
    ) {
      return name;
    }
  }
  return null;
}

let fingerX = 0;
let fingerY = 0;

container.addEventListener("mousemove", (e: MouseEvent) => {
  fingerX = e.clientX;
  fingerY = e.clientY;
  fingerEl.style.left = fingerX + "px";
  fingerEl.style.top = fingerY + "px";
});

function spinGlobe(): void {
  if (!resultEl || !spinButton || !fingerEl || !container || !infoOverlay) {
    throw new Error("Required HTML elements are missing");
  }

  spinButton.disabled = true;
  resultEl.textContent = "Spinning...";
  const start = Date.now();
  const spinDuration = 3000;

  function animateSpin() {
    const delta = Date.now() - start;
    const rotationAngle = (delta / spinDuration) * Math.PI * 2; // Full rotation over spinDuration
    viewer.scene.camera.rotate(Cartesian3.UNIT_Z, rotationAngle);
    if (delta < spinDuration) {
      requestAnimationFrame(animateSpin);
    } else {
      const cartesian = viewer.camera.pickEllipsoid(
        new Cartesian2(fingerX, fingerY)
      );
      if (cartesian) {
        const cartographic = Ellipsoid.WGS84.cartesianToCartographic(cartesian);
        const lat = Math.toDegrees(cartographic.latitude);
        const lon = Math.toDegrees(cartographic.longitude);
        fetchPlaceInfo(lat, lon).then(async (info) => {
          const locationText = info.waterName
            ? `in the ${info.waterName}`
            : `near ${info.place}`;
          resultEl!.textContent = `You landed ${locationText} at ${lat.toFixed(
            2
          )}°, ${lon.toFixed(2)}°`;
          try {
            const wiki = await fetchWikiSummary(info.waterName || info.place);
            const official = await fetchOfficialWebsite(wiki.wikibase_item);
            const media = await fetchImage(wiki.title);
            let html = `<strong>${wiki.title}</strong><br>${wiki.extract}`;
            if (media && media.thumbnail) {
              html += `<br><a href="${media.url}" target="_blank"><img src="${media.thumbnail}" alt="${wiki.title}"></a>`;
            } else if (wiki.thumbnail && wiki.thumbnail.source) {
              html += `<br><img src="${wiki.thumbnail.source}" alt="${wiki.title}">`;
            }
            if (official) {
              html += `<br><a href="${official}" target="_blank">Official Website</a>`;
            }
            html += `<br><a href="https://www.youtube.com/results?search_query=${encodeURIComponent(
              wiki.title
            )}" target="_blank">Search videos</a>`;
            infoOverlay!.innerHTML = html;
            infoOverlay!.style.display = "block";
          } catch (e) {
            infoOverlay!.style.display = "none";
          }
          spinButton!.disabled = false;
        });
      } else {
        resultEl!.textContent = "Finger is not over the globe.";
        spinButton!.disabled = false;
      }
    }
  }
  animateSpin();
}

spinButton.addEventListener("click", spinGlobe);
