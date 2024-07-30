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

    Java 17+
    Android SDK
    xCode
    react-native < 0.74.3
    iOS 15.0+ 
    Android 10+ (API level 29) 

## Installation
```
yarn add <git remote url>
```

### Setup Github auth to load package

Create a copy of [local.properties.template](example/android/local.properties.template) and rename it to local.properties in the same directory. Paste your github username and [classic PAT](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)

### IOS

Add the following to your Podfile:

```ruby
source 'https://github.com/evva-sfw/abrevva-sdk-ios-pod-specs.git'
source 'https://cdn.cocoapods.org/'
```

then execute `pod install` inside of your projects ios/ folder.

### Android

Add this to your `build.gradle` file:

```ruby
repositories {
    maven {
        url = uri("https://maven.pkg.github.com/evva-sfw/abrevva-sdk-android")
    }
}
...
dependencies {
  implementation group: "com.evva.xesar", name: "abrevva-sdk-android", version: "1.0.19" <-- change to latest version. 
}
```

Add Permissions to your `Manifest.xml` file as needed.

```ruby
    <uses-permission android:name="android.permission.BLUETOOTH_SCAN"/>
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT"/>
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
```

## Examples

### Initialize and scan for EVVA components

To start off first import `AbrevvaBle` from this module

```typescript
import {AbrevvaBle} from 'react-natice-example-app';

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
AbrevvaBle.signalize(
    deviceID,
    () => {
    console.log(`Signalized /w success=${it}`)
    }    
);
```
### Perform disengage for EVVA components

For the component disengage you have to provide access credentials to the EVVA component. Those are generally acquired in the form of access media metadata from the Xesar software.

```typescript
AbrevvaBle.disengage(
    mobileId: '',
    mobileDeviceKey:: '',
    mobileGroupId: '',
    mobileAccessData: '',
    isPermanentRelease: '',
    timeout: 10_000
);
```