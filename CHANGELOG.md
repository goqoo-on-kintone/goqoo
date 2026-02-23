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

(Previous release)
