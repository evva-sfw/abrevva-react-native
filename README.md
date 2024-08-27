<p align="center">
  <h1 align="center">EVVA React-Native Module</h1>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@evva-sfw/abrevva-react-native">
    <img alt="NPM Version" src="https://img.shields.io/npm/v/%40evva-sfw%2Fabrevva-react-native"></a>
  <a href="https://www.npmjs.com/package/@evva-sfw/abrevva-react-native">
  <img alt="NPM Downloads" src="https://img.shields.io/npm/dy/%40evva-sfw%2Fabrevva-react-native"></a>
  <img alt="GitHub package.json dynamic" src="https://img.shields.io/github/package-json/packageManager/evva-sfw/abrevva-react-native">
  <img alt="NPM Unpacked Size (with version)" src="https://img.shields.io/npm/unpacked-size/%40evva-sfw%2Fabrevva-react-native/latest">
  <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/evva-sfw/abrevva-react-native">
  <a href="https://github.com/evva-sfw/abrevva-react-native/actions"><img alt="GitHub branch check runs" src="https://img.shields.io/github/check-runs/evva-sfw/abrevva-react-native/main"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-EVVA_License-yellow.svg?color=fce500&logo=data:image/svg+xml;base64,PCEtLSBHZW5lcmF0ZWQgYnkgSWNvTW9vbi5pbyAtLT4KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjY0MCIgaGVpZ2h0PSIxMDI0IiB2aWV3Qm94PSIwIDAgNjQwIDEwMjQiPgo8ZyBpZD0iaWNvbW9vbi1pZ25vcmUiPgo8L2c+CjxwYXRoIGZpbGw9IiNmY2U1MDAiIGQ9Ik02MjIuNDIzIDUxMS40NDhsLTMzMS43NDYtNDY0LjU1MmgtMjg4LjE1N2wzMjkuODI1IDQ2NC41NTItMzI5LjgyNSA0NjYuNjY0aDI3NS42MTJ6Ij48L3BhdGg+Cjwvc3ZnPgo=" alt="EVVA License"></a>

</p>

The EVVA React-Native Module is a collection of tools to work with electronical EVVA access components. It allows for scanning and connecting via BLE.

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Examples](#examples)

## Features

- BLE Scanner for EVVA components in range
- Localize EVVA components encountered by a scan
- Disengage EVVA components encountered by a scan
- Read / Write data via BLE

## Requirements

- react-native < 0.74.3
- Java 17+ (Android)
- Android SDK (Android)
- Android 10+ (API level 29) (Android)
- Xcode 15.4 (iOS)
- iOS 15.0+ (iOS)

## Installation

```
yarn add @evva-sfw/abrevva-react-native
```

### iOS

Execute `bundle exec pod install` inside of your projects ios/ folder.

### Android

Perform a gradle sync.

## Examples

### Initialize and scan for EVVA components

To start off first import `AbrevvaBle` from this module

```typescript
import { AbrevvaBle } from '@evva-sfw/abrevva-react-native';

async function scanForBleDevices(androidNeverForLocation: Boolean = true, timeout: Number) {
  await AbrevvaBle.initialize(androidNeverForLocation);

  AbrevvaBle.requestLEScan( 
    (data: ScanResult) => {
        console.log(`Found device: ${data.name}`);
    },
    (address: string) => {
        console.log(`Connected to device: ${address}`);
    },
    (address: string) => {
        console.log(`Disconnected to device: ${address}`);
    },
    10_000
  );
}
```

### Localize EVVA component

With the signalize method you can localize EVVA components. On a successful signalization the component will emit a melody indicating its location.

```typescript
const success = await AbrevvaBle.signalize('deviceId');
```

### Perform disengage on EVVA components

For the component disengage you have to provide access credentials to the EVVA component. Those are generally acquired in the form of access media metadata from the Xesar software.

```typescript
const status = await AbrevvaBle.disengage(
  'deviceId',
  'mobileId',
  'mobileDeviceKey',
  'mobileGroupId',
  'mobileAccessData',
  false,
);
```
