# Contributing

Development is organized around GitHub Issues and pull requests.

1. Create or select an Issue describing one bounded change.
2. Create a branch from `main`.
3. Implement and verify the change locally.
4. Run `npm test` and `npm run build:pages`.
5. Commit the regenerated `docs/` output with source changes.
6. Open a pull request that closes the Issue.

## Versions

Lazberry PLY follows semantic versioning:

- Patch: backward-compatible fixes.
- Minor: backward-compatible features or format support.
- Major: incompatible behavior or API changes.

Update the `version` field in `package.json` in the pull request that prepares a release. Keep each release focused on one coherent milestone rather than mixing unrelated work.
