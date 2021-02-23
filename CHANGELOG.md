## 0.5.0 (2021-02-23)

#### Features
- Replace all template variables, intead of specific props

## 0.4.0 (2021-02-23)

- Minify output
- Fiddle with packages

## 0.3.0 (2021-02-22)

#### Features
- Implement watcher that full-reloads the page on image add/remove

#### Fixes
- Switch build to rollup to avoid issue with `tsup` when importing `normalizePath` from vite

## 0.2.0 (2021-02-18)

#### Features
- Add option `props` to allow users to select which props images are automatically imported to

## 0.1.0 (2021-02-17)

Initial release with barebones functionality. `<img src="X">` searches for e.g. x.png, x.jpg, and automatically imports.
