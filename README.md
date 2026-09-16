# Lazberry PLY

A fast, private, browser-based viewer for PLY point clouds and triangle meshes.

Files are read locally with the browser File API and are never uploaded to a server.

## Features

- Open ASCII and binary little-endian PLY files by dropping or choosing a file.
- Render point clouds and triangle meshes with configurable point sampling.
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
