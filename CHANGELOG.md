# Changelog

## [1.3.0] - Unreleased (beta017)

Changes since v1.2.0 (2023-04-03)

### Features

#### Authentication Enhancements
- **API token authentication support** - Support API token authentication in addition to password authentication
- **Revised authentication property structure** - Redesigned Auth type
- **Export Auth type** - Auth type is now accessible when using as a library

#### dts Generation Improvements
- **Read .env.development etc. during generate dts** - Support environment-specific configuration files
- **Sequential dts file generation with improved error logging** - Avoid parallel execution issues and improve debugging

#### Build & Development Environment
- **Dart Sass build support** - Migrated from Node Sass to modern Sass environment
- **Configurable dev-server port** - Avoid port conflicts when developing multiple projects simultaneously
- **__devinfo__ works with multiple JS files of different build timings in one app** - Improved debug info display during development

#### AWS S3 Deployment
- **S3 session token support** - Support deployment with AWS STS temporary credentials
- **Works correctly with ACL disabled** - Support S3 buckets with ACL disabled

#### Error Handling
- **KintoneAllRecordsError message displays correctly** - Improved error messages for bulk record retrieval errors

### Internal Changes

- Migrated from Node Sass to Dart Sass
- Removed fibers from sass-loader (not needed for Dart Sass)
- Updated @kintone/dts-gen to latest version
- Introduced minimist-options for improved CLI argument parsing

---

## [1.2.0] - 2023-04-03

### Features

- OAuth support
- Proxy authentication and client certificate authentication for OAuth

---

## [1.1.0] - 2022-01-13

- Template upgrade

---

## [1.0.0] - 2021-12-23

### Features

#### Build & Development Environment
- TypeScript build support
- React/Vue build support
- Display URL in console when starting dev-server
- Source maps work properly in devtools
- Load .env.development etc. based on NODE_ENV

#### S3 Deployment
- S3 upload enabled
- Display S3 upload URL after build

#### dts Generation
- goqoo generate dts now works
- Skip feature added

#### Library Features
- devinfo output support
- Skip subsequent JS files when using dev-server and S3 together
- getQueryOrder function added to lib
- sweetalert customization added

#### Generator
- Choose between standard, react, vue
- New in-app generator types
- Sub-generator creation mechanism
- Generator switched to sao

---

## [0.3.0] - 2019-05-23

- Documentation improvements

---

## [0.2.0] - 2018-10-15

### Features

- new and generate now call yeoman indirectly
- Pretty output for all files in `goqoo new`
- File overwrite warning in `goqoo new`
- Added `skip-yarn` option to `goqoo new`
- `goqoo new .` to initialize current directory as Goqoo project

---

## [0.1.0] - 2018-06-11

### Features

- Basic CLI functionality (goqoo new, generate)
- webpack configuration
- ESLint, Prettier configuration
- generate scaffold implementation
- Dropbox public link auto-generation
