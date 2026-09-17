# Lazberry PLY

A fast, private, browser-based viewer for PLY point clouds and triangle meshes.

Files are read locally with the browser File API and are never uploaded to a server.

## Features

- Open ASCII and binary little-endian PLY files by dropping or choosing a file.
- Render point clouds and triangle meshes with configurable point sampling.
- Use geometry-specific controls for point size, mesh opacity, wireframe, and vertices.
- Toggle trackball rotation for roll-capable, free-axis inspection.
- Ease into axis presets with 300 ms camera transitions and inspect opaque meshes with depth/normal edge enhancement.
- Start with an auto-orbiting RGB/CMY Z-up cube before opening a file.
- Inspect global and center-relative bounding boxes and geometry statistics.
- Toggle mesh faces, vertices, the spatial grid, and the bounding box.
- Use mouse navigation, axis shortcuts, preset views, and light/dark backgrounds.

## Development

```powershell
npm install
npm run dev
```

Run `npm test` for parser tests. Run `npm run build:pages` to generate the GitHub Pages site in `docs/`.

Contributions are managed through Issues and pull requests. See [CONTRIBUTING.md](CONTRIBUTING.md) for the development and versioning workflow.

## License

MIT
