# Cesium Globe Game

This simple web page lets you play the childhood globe spin game using [CesiumJS](https://cesium.com/platform/cesiumjs/). Click **Spin** to rotate the globe for a few seconds. A semi-transparent circle – the "finger" – follows your mouse at all times. When the spin stops, the game reports the latitude and longitude beneath your finger and looks up the nearest city (or ocean) using the free Nominatim service from OpenStreetMap.

## Running

Because Cesium uses Web Workers, the page must be served over HTTP. From this
folder run a simple local server such as `npx serve` or `python3 -m
http.server` and then open the reported `http://localhost` URL. The game loads
CesiumJS from a CDN and queries OpenStreetMap, so an internet connection is
required.

## Deployment

The project can be deployed for free using [Vercel](https://vercel.com/). After
installing the Vercel CLI run the following commands:

```bash
npx vercel init      # link or create the project
npx vercel --prod    # deploy to a production URL
```

The provided `vercel.json` configures a static deployment so no build step is
needed.

