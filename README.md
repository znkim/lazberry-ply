<p align="center">
  <img src="public/favicon.svg" width="96" height="96" alt="Lazberry PLY logo">
</p>

<h1 align="center">Lazberry PLY</h1>

<p align="center">A fast, private PLY, LAS, and LAZ point-cloud viewer that runs entirely in your browser.</p>

<p align="center">
  <a href="https://znkim.github.io/lazberry-ply/"><strong>Open Lazberry PLY →</strong></a>
</p>

Open a `.ply`, `.las`, or `.laz` file by dragging and dropping it anywhere on the
viewer, or by clicking the file picker. Files stay on your device and are never
uploaded to a server.

## Features

- Drag-and-drop and file-picker loading for PLY, LAS, and LAZ files
- ASCII and binary little-endian PLY parsing
- LAS 1.0–1.4 point formats 0–10, including common point attributes
- Local LAZ decompression in a Web Worker using WASM
- Point-cloud and triangle-mesh rendering
- Point Eye Dome Lighting with adjustable strength, and normal-based point diagnostics when PLY normals are present
- Mesh triangle colors, lighting, and normal color diagnostics
- LAS/LAZ coordinate-system metadata when available
- Perspective, isometric, turntable, and trackball navigation
- Mesh faces, wireframe, vertices, screen-space edges, grid, and bounding-box controls
- Smooth axis shortcuts and light/dark backgrounds

## Open a file

1. Open the [web viewer](https://znkim.github.io/lazberry-ply/).
2. Drag a `.ply`, `.las`, or `.laz` file onto the viewer, or click the drop zone
   to choose one.
3. The file is parsed locally in your browser. No point-cloud data is uploaded.

PLY files may contain point clouds or triangle meshes. LAS and LAZ files are
opened as point clouds.

## Development

```powershell
npm install
npm run dev
```

Run `npm test` for tests and `npm run build:pages` to regenerate the GitHub Pages site in `docs/`.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the issue and pull-request workflow.
