# golang-github-action
Advanced GitHub action for Golang.

- Select any Go toolchain version.
- Specify additional Go packages to build and install in `$GOBIN`.
- Automatically cache `$GOCACHE` and `$GOMODCACHE` across runs (no need to add `actions/cache`).

## Inputs

### `go-version`

**Required** The Go toolchain version to set up. 

Any version >= `1.12` works, including release candidates. 
Provide an exact match, for example: `1.16`, `1.16rc1`, `1.15.8`.

### `go-packages`

**Optional** A list of Go packages to get and install.

Use the same package naming convention as `go get`, separate entries with new lines.
For example: 

- `golang.org/x/lint/golint`
- `golang.org/x/tools/cmd/goimports@v0.1.0`

## Example

```yaml
uses: hengin-cloud/golang-github-action@v1
  with:
    go-version: 1.16
    go-packages: |
      golang.org/x/lint/golint
      golang.org/x/tools/cmd/goimports@v0.1.0
```
