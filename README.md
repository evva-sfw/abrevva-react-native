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
- Xcode 15+ (iOS)
- iOS 15.0+ (iOS)

## Installation
```
yarn add <git remote url>
```

### IOS

Add the following to your Podfile:

```ruby
source 'https://cdn.cocoapods.org/'
```

then execute `pod install` inside of your projects ios/ folder.

### Android

Add this to your `build.gradle` file:

[![Maven Central Version](https://img.shields.io/maven-central/v/com.evva.xesar/abrevva-sdk-android)](https://central.sonatype.com/artifact/com.evva.xesar/abrevva-sdk-android)


```ruby
...
dependencies {
  implementation group: "com.evva.xesar", name: "abrevva-sdk-android", version: "1.0.19" <-- change to latest version. 
}
```

Add Permissions to your `Manifest.xml` file as needed.

```xml
    <uses-permission android:name="android.permission.BLUETOOTH_SCAN"/>
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT"/>
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
```

## Examples

### Initialize and scan for EVVA components

To start off first import `AbrevvaBle` from this module

```typescript
import {AbrevvaBle} from '@evva-sfw/abrevva-react-native';

async function scanForBleDevices(androidNeverForLocation: Boolean, timeout: Number){
    const androidNeverForLocation = true;
    await AbrevvaBle.initialize(androidNeverForLocation);

    const timeout = 10_000
    AbrevvaBle.requestLEScan(
        timeout, 
        (data: ScanResult) => {
            console.log(`found device: ${data.name}`);
        },
        (data: Object) => {
            console.log(`Connected to device /w address=${data.address}`);
        },
        (data: Object) => {
            console.log(`Disconnected to device /w address=${data.address}`);
        }
    );
}
```

### Localize EVVA component

With the signalize method you can localize EVVA components. On a successful signalization the component will emit a melody indicating its location.

```typescript
AbrevvaBle.signalize({ deviceId: 'deviceId' }() => {
    console.log(`Signalized /w success=${it}`)
}
);
```
### Perform disengage for EVVA components

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
