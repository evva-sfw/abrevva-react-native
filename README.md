<p align="center">
  <h1 align="center">EVVA React-Native Module</h1>
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
- Java 17+  (Android)
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
        10_000, 
        (data: ScanResult) => {
            console.log(`Found device: ${data.name}`);
        },
        (address: string) => {
            console.log(`Connected to device: ${address}`);
        },
        (address: string) => {
            console.log(`Disconnected to device: ${address}`);
        }
    );
}
```

### Localize EVVA component

With the signalize method you can localize EVVA components. On a successful signalization the component will emit a melody indicating its location.

```typescript
AbrevvaBle.signalize({ deviceId: 'deviceId' }) => {
    console.log(`Signalized /w success=${it}`)
}
);
```
### Perform disengage on EVVA components

For the component disengage you have to provide access credentials to the EVVA component. Those are generally acquired in the form of access media metadata from the Xesar software.

```typescript
AbrevvaBle.disengage({
    deviceId: 'deviceId',
    mobileId: 'mobileId',
    mobileDeviceKey: 'mobileDeviceKey',
    mobileGroupId: 'mobileGroupId',
    mobileAccessData: 'mobileAccessData',
    isPermanentRelease: false,
});
```
