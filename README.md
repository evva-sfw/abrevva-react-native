# EVVA React-Native Module

[![NPM Version](https://img.shields.io/npm/v/%40evva-sfw%2Fabrevva-react-native)](https://www.npmjs.com/package/@evva/abrevva-react-native)
[![NPM Downloads](https://img.shields.io/npm/dy/%40evva-sfw%2Fabrevva-react-native)](https://www.npmjs.com/package/@evva/abrevva-react-native)
![GitHub package.json dynamic](https://img.shields.io/github/package-json/packageManager/evva-sfw/abrevva-react-native)
![NPM Unpacked Size (with version)](https://img.shields.io/npm/unpacked-size/%40evva-sfw%2Fabrevva-react-native/latest)
![GitHub last commit](https://img.shields.io/github/last-commit/evva-sfw/abrevva-react-native)
[![GitHub branch check runs](https://img.shields.io/github/check-runs/evva-sfw/abrevva-react-native/main)]([URL](https://github.com/evva-sfw/abrevva-react-native/actions))
[![EVVA License](https://img.shields.io/badge/license-EVVA_License-yellow.svg?color=fce500&logo=data:image/svg+xml;base64,PCEtLSBHZW5lcmF0ZWQgYnkgSWNvTW9vbi5pbyAtLT4KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjY0MCIgaGVpZ2h0PSIxMDI0IiB2aWV3Qm94PSIwIDAgNjQwIDEwMjQiPgo8ZyBpZD0iaWNvbW9vbi1pZ25vcmUiPgo8L2c+CjxwYXRoIGZpbGw9IiNmY2U1MDAiIGQ9Ik02MjIuNDIzIDUxMS40NDhsLTMzMS43NDYtNDY0LjU1MmgtMjg4LjE1N2wzMjkuODI1IDQ2NC41NTItMzI5LjgyNSA0NjYuNjY0aDI3NS42MTJ6Ij48L3BhdGg+Cjwvc3ZnPgo=)](LICENSE)

> [!IMPORTANT]
> This package was renamed please use the new package name! __@evva/abrevva-react-native__

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
yarn add @evva/abrevva-react-native
```

### iOS

Execute `bundle exec pod install` inside of your projects ios/ folder.

### Android

Perform a gradle sync.

## Examples

### Initialize and scan for EVVA components

To start off first import `AbrevvaBle` from this module

```typescript
import { AbrevvaBle } from '@evva/abrevva-react-native';

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
