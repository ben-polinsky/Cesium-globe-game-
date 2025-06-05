# Cesium Globe Game

This simple web page lets you play the childhood globe spin game using [CesiumJS](https://cesium.com/platform/cesiumjs/). Click **Spin** to rotate the globe for a few seconds. A semi-transparent circle – the "finger" – follows your mouse at all times. When the spin stops, the game reports the latitude and longitude beneath your finger.

## Running

Open `index.html` in any modern web browser with internet access. The page loads CesiumJS from a CDN, so no build step is required. If the globe does not appear when opening the file directly, try serving the folder with a simple HTTP server (for example `npx serve`).

## Deployment

The project can be deployed for free using [Vercel](https://vercel.com/). After
installing the Vercel CLI run the following commands:

```bash
npx vercel init      # link or create the project
npx vercel --prod    # deploy to a production URL
```

The provided `vercel.json` configures a static deployment so no build step is
needed.

