## [6.1.0](https://github.com/evva-sfw/abrevva-react-native/compare/6.0.1...6.1.0) - 2026-07-20

### ⚙️ Build System

- Updated release it dependencies ([#138](https://github.com/evva-sfw/abrevva-react-native/pull/138))

### 🚀 Continuous Integration

- Update release and changelog workflows ([#153](https://github.com/evva-sfw/abrevva-react-native/pull/153))
- Integrated changelog update into release workflow ([#156](https://github.com/evva-sfw/abrevva-react-native/pull/156))
- Removed obsolete code ([#157](https://github.com/evva-sfw/abrevva-react-native/pull/157))
- Ignore package.json version in releaseit step ([#158](https://github.com/evva-sfw/abrevva-react-native/pull/158))
- Fix release workflow to use git configed app token with release-it ([#159](https://github.com/evva-sfw/abrevva-react-native/pull/159))
- Added allowSameVersion flag and use gh api to create a signed tag ([#160](https://github.com/evva-sfw/abrevva-react-native/pull/160))
- Adjusted release workflow to generate release on github without release-it  ([#161](https://github.com/evva-sfw/abrevva-react-native/pull/161))
- Fixed syntax error in create signed tag gh api call ([#162](https://github.com/evva-sfw/abrevva-react-native/pull/162))
- Integrated new release workflow using git cliff to manage version bump & changelog ([#164](https://github.com/evva-sfw/abrevva-react-native/pull/164))

### 🧪 Tests

- Fix jest dependency for tests ([#155](https://github.com/evva-sfw/abrevva-react-native/pull/155))

### 🧹 Chore

- *(deps)* Bump fast-xml-builder from 1.1.5 to 1.2.0 ([#139](https://github.com/evva-sfw/abrevva-react-native/pull/139))
- *(deps)* Bump @babel/plugin-transform-modules-systemjs from 7.29.0 to 7.29.4 ([#140](https://github.com/evva-sfw/abrevva-react-native/pull/140))
- *(deps)* Bump brace-expansion from 5.0.5 to 5.0.6 ([#142](https://github.com/evva-sfw/abrevva-react-native/pull/142))
- *(deps)* Bump qs from 6.15.1 to 6.15.2 ([#143](https://github.com/evva-sfw/abrevva-react-native/pull/143))
- *(deps-dev)* Bump turbo from 2.9.6 to 2.9.14 ([#144](https://github.com/evva-sfw/abrevva-react-native/pull/144))
- *(deps)* Bump shell-quote from 1.8.3 to 1.8.4 ([#145](https://github.com/evva-sfw/abrevva-react-native/pull/145))
- *(deps)* Bump joi from 17.13.3 to 17.13.4 ([#146](https://github.com/evva-sfw/abrevva-react-native/pull/146))
- *(deps)* Bump launch-editor from 2.13.2 to 2.14.1 ([#147](https://github.com/evva-sfw/abrevva-react-native/pull/147))
- *(deps)* Bump ws from 6.2.3 to 6.2.4 ([#148](https://github.com/evva-sfw/abrevva-react-native/pull/148))
- *(deps)* Bump tar from 7.5.13 to 7.5.19 ([#149](https://github.com/evva-sfw/abrevva-react-native/pull/149))
- *(deps)* Bump concurrent-ruby from 1.3.3 to 1.3.7 in /example ([#150](https://github.com/evva-sfw/abrevva-react-native/pull/150))
- *(deps-dev)* Bump @babel/core from 7.29.0 to 7.29.6 ([#151](https://github.com/evva-sfw/abrevva-react-native/pull/151))
- *(deps)* Bump js-yaml from 3.14.2 to 3.15.0 ([#152](https://github.com/evva-sfw/abrevva-react-native/pull/152))
## [6.0.1](https://github.com/evva-sfw/abrevva-react-native/compare/6.0.0...6.0.1) - 2026-04-25

### 🧹 Chore

- *(deps)* Bump addressable from 2.8.9 to 2.9.0 in /example ([#131](https://github.com/evva-sfw/abrevva-react-native/pull/131))
- *(deps)* Bump basic-ftp from 5.2.0 to 5.2.1 ([#134](https://github.com/evva-sfw/abrevva-react-native/pull/134))
- *(deps)* Bump basic-ftp from 5.2.1 to 5.2.2 ([#135](https://github.com/evva-sfw/abrevva-react-native/pull/135))
- *(deps)* Bump picomatch from 2.3.1 to 2.3.2 ([#136](https://github.com/evva-sfw/abrevva-react-native/pull/136))
- *(deps)* Bump fast-xml-parser from 5.5.9 to 5.7.1 ([#137](https://github.com/evva-sfw/abrevva-react-native/pull/137))
## [6.0.0](https://github.com/evva-sfw/abrevva-react-native/compare/5.1.7...6.0.0) - 2026-04-08

### 🎉 Features

- Nitro module migration ([#124](https://github.com/evva-sfw/abrevva-react-native/pull/124))

### 🐛 Bug Fixes

- Remove auth step ; added update npm step ([#129](https://github.com/evva-sfw/abrevva-react-native/pull/129))
- Export paths ([#132](https://github.com/evva-sfw/abrevva-react-native/pull/132))
- Formatting in package.json ([#133](https://github.com/evva-sfw/abrevva-react-native/pull/133))

### 🚀 Continuous Integration

- Potential fix for code scanning alert no. 1: Workflow does not contain permissions ([#114](https://github.com/evva-sfw/abrevva-react-native/pull/114))
- Enable OIDC trusted publish ([#130](https://github.com/evva-sfw/abrevva-react-native/pull/130))

### 🧹 Chore

- *(deps)* Bump lodash from 4.17.21 to 4.17.23 ([#108](https://github.com/evva-sfw/abrevva-react-native/pull/108))
- *(deps)* Bump basic-ftp from 5.0.5 to 5.2.0 ([#110](https://github.com/evva-sfw/abrevva-react-native/pull/110))
- *(deps)* Bump tar from 7.4.3 to 7.5.9 ([#111](https://github.com/evva-sfw/abrevva-react-native/pull/111))
- *(deps)* Bump minimatch from 3.1.2 to 3.1.5 ([#112](https://github.com/evva-sfw/abrevva-react-native/pull/112))
- *(deps)* Bump fast-xml-parser from 4.5.3 to 4.5.4 ([#113](https://github.com/evva-sfw/abrevva-react-native/pull/113))
- *(deps)* Bump tar from 7.5.9 to 7.5.11 ([#116](https://github.com/evva-sfw/abrevva-react-native/pull/116))
- *(deps)* Bump json from 2.15.1 to 2.15.2.1 in /example ([#117](https://github.com/evva-sfw/abrevva-react-native/pull/117))
- *(deps)* Bump flatted from 3.3.3 to 3.4.2 ([#118](https://github.com/evva-sfw/abrevva-react-native/pull/118))
- *(deps)* Bump fast-xml-parser from 4.5.4 to 4.5.5 ([#120](https://github.com/evva-sfw/abrevva-react-native/pull/120))
- *(deps)* Bump picomatch from 2.3.1 to 2.3.2 ([#121](https://github.com/evva-sfw/abrevva-react-native/pull/121))
- *(deps)* Bump handlebars from 4.7.8 to 4.7.9 ([#122](https://github.com/evva-sfw/abrevva-react-native/pull/122))
- *(deps)* Bump node-forge from 1.3.2 to 1.4.0 ([#123](https://github.com/evva-sfw/abrevva-react-native/pull/123))
- Add release it dep ([#128](https://github.com/evva-sfw/abrevva-react-native/pull/128))
## [5.1.7](https://github.com/evva-sfw/abrevva-react-native/compare/5.1.6...5.1.7) - 2025-11-27

### 🚀 Continuous Integration

- Potential fix for code scanning alert no. 6: Workflow does not contain permissions ([#102](https://github.com/evva-sfw/abrevva-react-native/pull/102))

### 🧹 Chore

- *(deps)* Bump node-forge from 1.3.1 to 1.3.2 ([#105](https://github.com/evva-sfw/abrevva-react-native/pull/105))
## [5.1.6](https://github.com/evva-sfw/abrevva-react-native/compare/5.1.5...5.1.6) - 2025-11-20

### 🧹 Chore

- *(deps)* Bump js-yaml from 3.14.1 to 3.14.2 ([#101](https://github.com/evva-sfw/abrevva-react-native/pull/101))
## [5.1.5](https://github.com/evva-sfw/abrevva-react-native/compare/5.1.4...5.1.5) - 2025-11-14

### 🧹 Chore

- Added react-native version disclaimer ([#100](https://github.com/evva-sfw/abrevva-react-native/pull/100))
## [5.1.4](https://github.com/evva-sfw/abrevva-react-native/compare/5.1.3...5.1.4) - 2025-10-15

### 🐛 Bug Fixes

- Change signalize method signature; update deps ([#99](https://github.com/evva-sfw/abrevva-react-native/pull/99))

### 🧹 Chore

- *(deps)* Bump rexml from 3.3.9 to 3.4.2 in /example ([#96](https://github.com/evva-sfw/abrevva-react-native/pull/96))
## [5.1.3](https://github.com/evva-sfw/abrevva-react-native/compare/5.1.2...5.1.3) - 2025-10-03

### 📝 Documentation

- Update readme ([#98](https://github.com/evva-sfw/abrevva-react-native/pull/98))
## [5.1.2](https://github.com/evva-sfw/abrevva-react-native/compare/5.1.1...5.1.2) - 2025-10-03

### 🧹 Chore

- Update readme and build settings ([#97](https://github.com/evva-sfw/abrevva-react-native/pull/97))
## [5.1.1](https://github.com/evva-sfw/abrevva-react-native/compare/5.1.0...5.1.1) - 2025-09-16

### 🎉 Features

- Update sdk versions; update readme ([#95](https://github.com/evva-sfw/abrevva-react-native/pull/95))

### 📝 Documentation

- Set license name ([#94](https://github.com/evva-sfw/abrevva-react-native/pull/94))
## [5.1.0](https://github.com/evva-sfw/abrevva-react-native/compare/5.0.1...5.1.0) - 2025-03-07

### 🎉 Features

- Coding station integration new ([#92](https://github.com/evva-sfw/abrevva-react-native/pull/92))

### 🚀 Continuous Integration

- Check signed commits ([#90](https://github.com/evva-sfw/abrevva-react-native/pull/90))
- Pin workflow action versions ([#89](https://github.com/evva-sfw/abrevva-react-native/pull/89))
## [5.0.1](https://github.com/evva-sfw/abrevva-react-native/compare/5.0.0...5.0.1) - 2025-02-19

### 🐛 Bug Fixes

- Added try catch block to getBool function call ([#88](https://github.com/evva-sfw/abrevva-react-native/pull/88))

### 🧹 Chore

- *(deps)* Bump @octokit/request from 8.4.0 to 8.4.1 ([#87](https://github.com/evva-sfw/abrevva-react-native/pull/87))
## [5.0.0](https://github.com/evva-sfw/abrevva-react-native/compare/4.0.1...5.0.0) - 2025-02-19

### 🐛 Bug Fixes

- Resolve blocking async plugin methods ([#85](https://github.com/evva-sfw/abrevva-react-native/pull/85))

### 🧹 Chore

- *(deps)* Bump @octokit/request-error from 5.1.0 to 5.1.1 ([#84](https://github.com/evva-sfw/abrevva-react-native/pull/84))
- *(deps)* Bump @octokit/endpoint from 9.0.5 to 9.0.6 ([#86](https://github.com/evva-sfw/abrevva-react-native/pull/86))
## [4.0.1](https://github.com/evva-sfw/abrevva-react-native/compare/4.0.0...4.0.1) - 2025-02-14

### 🧹 Chore

- Sdk version bump ([#83](https://github.com/evva-sfw/abrevva-react-native/pull/83))
## [4.0.0](https://github.com/evva-sfw/abrevva-react-native/compare/2.0.2...4.0.0) - 2025-02-14

### 🎉 Features

- [**breaking**] Update sdk versions and plugin methods and signatures ([#82](https://github.com/evva-sfw/abrevva-react-native/pull/82))

### 🚀 Continuous Integration

- Harden pipeline ([#81](https://github.com/evva-sfw/abrevva-react-native/pull/81))

### 🧹 Chore

- *(deps)* Bump nanoid from 3.3.7 to 3.3.8 ([#80](https://github.com/evva-sfw/abrevva-react-native/pull/80))
- *(deps)* Bump cross-spawn from 7.0.3 to 7.0.6 ([#78](https://github.com/evva-sfw/abrevva-react-native/pull/78))
- *(deps)* Bump rexml from 3.3.6 to 3.3.9 in /example ([#69](https://github.com/evva-sfw/abrevva-react-native/pull/69))
- *(deps)* Bump serve-static from 1.15.0 to 1.16.2 ([#76](https://github.com/evva-sfw/abrevva-react-native/pull/76))
- *(deps-dev)* Bump @react-native/eslint-config from 0.74.87 to 0.76.1 ([#74](https://github.com/evva-sfw/abrevva-react-native/pull/74))
## [2.0.2](https://github.com/evva-sfw/abrevva-react-native/compare/2.0.1...2.0.2) - 2024-12-06

### 🐛 Bug Fixes

- Android manifest permssions for BLE; fix DisengageStatus return ([#79](https://github.com/evva-sfw/abrevva-react-native/pull/79))
## [2.0.1](https://github.com/evva-sfw/abrevva-react-native/compare/2.0.0...2.0.1) - 2024-12-05

### 🐛 Bug Fixes

- Resolve disengage and scanning issues; add missing manifest perm… ([#77](https://github.com/evva-sfw/abrevva-react-native/pull/77))

### 🚀 Continuous Integration

- Add icons to release notes ([#65](https://github.com/evva-sfw/abrevva-react-native/pull/65))
- Remove dependabot config ([#75](https://github.com/evva-sfw/abrevva-react-native/pull/75))

### 🧹 Chore

- *(deps)* Bump @scure/base from 1.1.7 to 1.1.9 ([#55](https://github.com/evva-sfw/abrevva-react-native/pull/55))
- *(deps)* Bump react-native-safe-area-context from 4.10.9 to 4.12.0 ([#67](https://github.com/evva-sfw/abrevva-react-native/pull/67))
- *(deps-dev)* Bump @babel/runtime from 7.25.4 to 7.26.0 ([#68](https://github.com/evva-sfw/abrevva-react-native/pull/68))
- *(deps-dev)* Bump react-native-builder-bob from 0.30.0 to 0.30.3 ([#73](https://github.com/evva-sfw/abrevva-react-native/pull/73))
- *(deps-dev)* Bump @evilmartians/lefthook from 1.7.14 to 1.8.2 ([#72](https://github.com/evva-sfw/abrevva-react-native/pull/72))
- *(deps-dev)* Bump eslint-plugin-import from 2.29.1 to 2.31.0 ([#71](https://github.com/evva-sfw/abrevva-react-native/pull/71))
## [2.0.0](https://github.com/evva-sfw/abrevva-react-native/compare/1.0.1...2.0.0) - 2024-10-22

### 🎉 Features

- Replaced manual disengage logic with AbrevvaSDK disengage function ([#46](https://github.com/evva-sfw/abrevva-react-native/pull/46))

### 🐛 Bug Fixes

- [**breaking**] Removed broken nfc code ([#61](https://github.com/evva-sfw/abrevva-react-native/pull/61))

### 🚀 Continuous Integration

- Fix version in filename for release ([#45](https://github.com/evva-sfw/abrevva-react-native/pull/45))
- Reconfigure auto-changelog to only track merge commits ([#52](https://github.com/evva-sfw/abrevva-react-native/pull/52))

### 🧹 Chore

- *(deps-dev)* Bump react-native-builder-bob from 0.29.1 to 0.30.0 ([#49](https://github.com/evva-sfw/abrevva-react-native/pull/49))
- *(deps-dev)* Bump @commitlint/config-conventional from 19.2.2 to 19.4.1 ([#50](https://github.com/evva-sfw/abrevva-react-native/pull/50))
- *(deps-dev)* Bump commitlint from 19.4.0 to 19.4.1 ([#48](https://github.com/evva-sfw/abrevva-react-native/pull/48))
- *(deps-dev)* Bump @release-it/conventional-changelog from 8.0.1 to 8.0.2 ([#56](https://github.com/evva-sfw/abrevva-react-native/pull/56))
- [**breaking**] Rename package to @evva/ instead of @evva-sfw/ ([#60](https://github.com/evva-sfw/abrevva-react-native/pull/60))
## [1.0.1](https://github.com/evva-sfw/abrevva-react-native/compare/1.0.0...1.0.1) - 2024-08-28

### ⚙️ Build System

- Fix workflow cache names ([#40](https://github.com/evva-sfw/abrevva-react-native/pull/40))
- Add yarn cache to github workflow caching ([#42](https://github.com/evva-sfw/abrevva-react-native/pull/42))
- Add npm-compatibility-check test ([#43](https://github.com/evva-sfw/abrevva-react-native/pull/43))

### 🐛 Bug Fixes

- Corrected output Path for decryptFileFromURL (android) ([#44](https://github.com/evva-sfw/abrevva-react-native/pull/44))

### 📝 Documentation

- Format readme and add shields.io ([#41](https://github.com/evva-sfw/abrevva-react-native/pull/41))
## [1.0.0](https://github.com/evva-sfw/abrevva-react-native/compare/0.1.5...1.0.0) - 2024-08-26

### ⚙️ Build System

- Add attest provenance with lint and release workflow ([#29](https://github.com/evva-sfw/abrevva-react-native/pull/29))
- Enable android build cache ([#39](https://github.com/evva-sfw/abrevva-react-native/pull/39))

### 🎉 Features

- Tests for android & ios ([#23](https://github.com/evva-sfw/abrevva-react-native/pull/23))
- Add missing signalize bridge functions ([#36](https://github.com/evva-sfw/abrevva-react-native/pull/36))
- Added typing for ble interface ([#37](https://github.com/evva-sfw/abrevva-react-native/pull/37))

### 🐛 Bug Fixes

- Minor adjustments to scan timeout ([#28](https://github.com/evva-sfw/abrevva-react-native/pull/28))

### 🧹 Chore

- Update README.md ([#30](https://github.com/evva-sfw/abrevva-react-native/pull/30))
- *(deps-dev)* Remove turbo as dev-dep ([#32](https://github.com/evva-sfw/abrevva-react-native/pull/32))
- *(deps-dev)* Bump eslint-plugin-simple-import-sort from 10.0.0 to 12.1.1 ([#34](https://github.com/evva-sfw/abrevva-react-native/pull/34))
- *(deps)* Bump rexml from 3.3.3 to 3.3.6 in /example ([#38](https://github.com/evva-sfw/abrevva-react-native/pull/38))
## [0.1.4](https://github.com/evva-sfw/abrevva-react-native/compare/0.1.0...0.1.4) - 2024-08-22

### 🧹 Chore

- *(deps)* Bump rexml from 3.2.9 to 3.3.3 in /example ([#22](https://github.com/evva-sfw/abrevva-react-native/pull/22))
- Minor UI improvements ([#24](https://github.com/evva-sfw/abrevva-react-native/pull/24))
- Moved eslint config to package.json ([#25](https://github.com/evva-sfw/abrevva-react-native/pull/25))
- Add .editorconfig ([#26](https://github.com/evva-sfw/abrevva-react-native/pull/26))
- Release-it workflow ([#27](https://github.com/evva-sfw/abrevva-react-native/pull/27))
## [0.1.0](https://github.com/evva-sfw/abrevva-react-native/releases/tag/0.1.0) - 2024-08-13

### ⚙️ Build System

- Workflow for android build ([#7](https://github.com/evva-sfw/abrevva-react-native/pull/7))
- *(deps-dev)* Bump @evilmartians/lefthook from 1.7.7 to 1.7.11 ([#16](https://github.com/evva-sfw/abrevva-react-native/pull/16))

### 🎉 Features

- Add missing ts interfaces for abrevva modules ([#14](https://github.com/evva-sfw/abrevva-react-native/pull/14))

### 🐛 Bug Fixes

- Added missing yarn files ([#6](https://github.com/evva-sfw/abrevva-react-native/pull/6))

### 🔀 Code Refactoring

- Structural changes ([#20](https://github.com/evva-sfw/abrevva-react-native/pull/20))

### 🧹 Chore

- Fix internal links ([#3](https://github.com/evva-sfw/abrevva-react-native/pull/3))
- *(ci)* Create workflow for lint ([#2](https://github.com/evva-sfw/abrevva-react-native/pull/2))
- Small typos and indents ([#13](https://github.com/evva-sfw/abrevva-react-native/pull/13))
- *(ci)* Add workflow to check semantic PR summary ([#5](https://github.com/evva-sfw/abrevva-react-native/pull/5))
- *(deps-dev)* Bump @release-it/conventional-changelog from 5.1.1 to 8.0.1 ([#8](https://github.com/evva-sfw/abrevva-react-native/pull/8))
- *(deps-dev)* Bump @commitlint/config-conventional from 17.8.1 to 19.2.2 ([#9](https://github.com/evva-sfw/abrevva-react-native/pull/9))
- *(deps-dev)* Bump react-native-builder-bob from 0.26.0 to 0.29.0 ([#18](https://github.com/evva-sfw/abrevva-react-native/pull/18))
- *(deps-dev)* Bump commitlint from 17.8.1 to 19.4.0 ([#19](https://github.com/evva-sfw/abrevva-react-native/pull/19))
- Fix package.json ([#17](https://github.com/evva-sfw/abrevva-react-native/pull/17))
- Update README ([#21](https://github.com/evva-sfw/abrevva-react-native/pull/21))
