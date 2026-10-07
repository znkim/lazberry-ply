# Changelog

All notable changes to Lazberry PLY are documented here. This project follows
[semantic versioning](https://semver.org/).

## [0.7.0] - 2026-10-07

Faster Gaussian splat rendering. Large splats (1.7M splats / 400 MB tested) were
fragment-bound; this release cuts per-frame fill cost and redundant renders.

### Added

- **Splat resolution** slider (25–100%) in the Gaussian splat controls. It lowers
  the canvas render resolution while splats are shown, trading sharpness for
  frame rate on high-DPI displays and very large splats.

### Changed

- Splat quads are sized to the visible footprint: the radius is capped at √8σ
  (was 3σ) and further reduced for low-opacity splats, to where their alpha falls
  below 1/255. Splats that are fully transparent are culled in the vertex shader.
  Image quality is unchanged because only invisible fragments are skipped.
- The WebGL context is created without MSAA. Blending millions of translucent
  splats into a multisampled buffer multiplied memory bandwidth. Mesh and line
  edges may look slightly more aliased.
- Mouse drag, wheel, resize, and splat sort results now schedule at most one
  render per animation frame instead of rendering on every event.
- The canvas drawing buffer is resized only when its size actually changes,
  instead of being reassigned on every frame.

## [0.6.0] - 2026-10-02

- Add 3D Gaussian Splatting PLY rendering.

## [0.5.3] - 2026-10-02

- Fix binary PLY data skipped after `end_header`.

## [0.5.2] - 2026-09-29

- Fix axis shortcuts across viewer controls.

## [0.5.1] - 2026-09-28

- Debug rendering and LAS/LAZ CRS metadata.

## [0.5.0] - 2026-09-17

- LAS and LAZ support.

## [0.4.0] - 2026-09-17

- Viewport interaction improvements.

## [0.3.0] - 2026-09-17

- Free axis orientation.

## [0.2.1] - 2026-09-16

- Point-cloud logo and favicon.

## [0.2.0] - 2026-09-16

- Display controls.

## [0.1.0] - 2026-09-16

- Initial release: browser-based PLY viewer.
