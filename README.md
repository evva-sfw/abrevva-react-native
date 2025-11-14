<p align="center">
  <h1 align="center">Abrevva React-Native Module</h1>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@evva/abrevva-react-native"><img alt="NPM Version" src="https://img.shields.io/npm/v/%40evva%2Fabrevva-react-native"></a>
  <a href="https://www.npmjs.com/package/@evva/abrevva-react-native"><img alt="NPM Downloads" src="https://img.shields.io/npm/dy/%40evva%2Fabrevva-react-native"></a>
  <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/evva-sfw/abrevva-react-native">
  <a href="https://github.com/evva-sfw/abrevva-react-native/actions"><img alt="GitHub branch check runs" src="https://img.shields.io/github/check-runs/evva-sfw/abrevva-react-native/main"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-EVVA_License-yellow.svg?color=fce500&logo=data:image/svg+xml;base64,PCEtLSBHZW5lcmF0ZWQgYnkgSWNvTW9vbi5pbyAtLT4KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjY0MCIgaGVpZ2h0PSIxMDI0IiB2aWV3Qm94PSIwIDAgNjQwIDEwMjQiPgo8ZyBpZD0iaWNvbW9vbi1pZ25vcmUiPgo8L2c+CjxwYXRoIGZpbGw9IiNmY2U1MDAiIGQ9Ik02MjIuNDIzIDUxMS40NDhsLTMzMS43NDYtNDY0LjU1MmgtMjg4LjE1N2wzMjkuODI1IDQ2NC41NTItMzI5LjgyNSA0NjYuNjY0aDI3NS42MTJ6Ij48L3BhdGg+Cjwvc3ZnPgo=" alt="EVVA License"></a>
</p>

> [!IMPORTANT]
> This package was renamed please use the new package name! __@evva/abrevva-react-native__
>
>This project is an open-source option to help developers kickstart their project with our SDK. It is not a fully-fledged product!
Feel free to use it, or create your own solution by utilizing our SDK directly. Any contributions to this project are highly appreciated.
>
> The Example App in this project still uses the old React Native architecture (React Native < 0.67) and is for demonstration purposes only.
> Please do not use an outdated React Native version in your app!
> Our package is compatible with newer React Native versions and will be available as a Turbo Module in the foreseeable future.

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

- react-native <= 0.74.3
- Java 17+ (Android)
- Android SDK (Android)
- Android 10+ (API level 29+) (Android)
- iOS 15.0+ (iOS)

## Installation

Set up an app with a matching ReactNative version:
```
$ npx @react-native-community/cli init MyApp --version 0.74.3
```

Add Abrevva to your project:
```
$ npm i @evva/abrevva-react-native
```

### Android

Set the minimum SDK version to 29 in your module's build gradle:
```groovy
minSdkVersion = 29
compileSdkVersion = 35
targetSdkVersion = 35
```

Depending on the used ReactNative version you might need to adjust the AGP version in your module-level `build.gradle` based on potential warnings:
```groovy
dependencies {
    classpath("com.android.tools.build:gradle:8.3.0")
    ...
```

In your app's Manifest file add any needed install-time permissions:
```xml
<!-- Scan and connect to BLE components -->
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT"/>
<uses-permission android:name="android.permission.BLUETOOTH_SCAN"
                 android:usesPermissionFlags="neverForLocation"
                 tools:targetApi="s"/>
<uses-permission android:maxSdkVersion="30"
                 android:name="android.permission.BLUETOOTH"/>
<uses-permission android:maxSdkVersion="30"
                 android:name="android.permission.BLUETOOTH_ADMIN"/>
<uses-permission android:maxSdkVersion="30"
                 android:name="android.permission.ACCESS_COARSE_LOCATION"/>
<uses-permission android:maxSdkVersion="30"
                 android:name="android.permission.ACCESS_FINE_LOCATION"/>

<!-- Use coding station to write media -->
<uses-permission android:name="android.permission.NFC" />
```

In your app-level `build.gradle` you might want to exclude META-INF files to avoid gradle build issues:
```groovy
packagingOptions {
    resources.excludes.add("META-INF/*")
}
```

Finally perform a gradle sync.

### iOS
In your app's Podfile add a `post_install` hook to resolve a nasty [CocoaPods limitation with XCFrameworks](https://github.com/CocoaPods/CocoaPods/issues/11079).

```ruby
post_install do |installer|
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false
    )
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['BUILD_LIBRARY_FOR_DISTRIBUTION'] = 'YES'
      end
    end
  end
```
Execute `bundle exec pod install` inside of your projects `ios/` folder.

## Examples

### Initialize and scan for EVVA components

```typescript
import { AbrevvaBle } from '@evva/abrevva-react-native';

class ExampleClass {
  private devices: BleDevice[];
  
  async startScan(event: any) {
    this.devices = [];
   
    await AbrevvaBle.initialize();
    await AbrevvaBle.startScan(
      (device: BleDevice) => {
        this.devices.push(device);
      }, (success: boolean) => {
        console.log(`Scan started, success: ${success}`);
      }, (success: boolean) => {
        console.log(`Scan stopped, success: ${success}`);
      }
    );
  }
}
```

### Read EVVA component advertisement

Get the EVVA advertisement data from a scanned EVVA component.

```typescript
const ad = device.advertisementData;
console.log(ad?.rssi);
console.log(ad?.isConnectable);

const md = ad?.manufacturerData;
console.log(md?.batteryStatus);
console.log(md?.isOnline);
console.log(md?.officeModeEnabled);
console.log(md?.officeModeActive);
// ...
```

There are several properties that can be accessed from the advertisement.

```typescript
export interface BleDeviceAdvertisementData {
  rssi?: number;
  isConnectable?: boolean;
  manufacturerData?: BleDeviceManufacturerData;
}

export interface BleDeviceManufacturerData {
  companyIdentifier?: string;
  version?: number;
  componentType?: "handle" | "escutcheon" | "cylinder" | "wallreader" | "emzy" | "iobox" | "unknown";
  mainFirmwareVersionMajor?: number;
  mainFirmwareVersionMinor?: number;
  mainFirmwareVersionPatch?: number;
  componentHAL?: string;
  batteryStatus?: "battery-full" | "battery-empty";
  mainConstructionMode?: boolean;
  subConstructionMode?: boolean;
  isOnline?: boolean;
  officeModeEnabled?: boolean;
  twoFactorRequired?: boolean;
  officeModeActive?: boolean;
  identifier?: string;
  subFirmwareVersionMajor?: number;
  subFirmwareVersionMinor?: number;
  subFirmwareVersionPatch?: number;
  subComponentIdentifier?: string;
}
```

### Localize EVVA component

With the signalize method you can localize EVVA components. On a successful signalization the component will emit a melody indicating its location.

```typescript
const success = (await AbrevvaBle.signalize('deviceId')).value;
```

### Perform disengage on EVVA components

For the component disengage you have to provide access credentials to the EVVA component. Those are generally acquired in the form of access media metadata from the Xesar software.

```typescript
const status = await AbrevvaBle.disengage(
  device.deviceId,
  'mobileId',         // sha256-hashed hex-encoded version of `xsMobileId` found in blob data.
  'mobileDeviceKey',  // mobile device key string from `xsMOBDK` found in blob data.
  'mobileGroupId',    // mobile group id string from `xsMOBGID` found in blob data.
  'mobileAccessData', // access data string from `mediumDataFrame` found in blob data.
  false,
);
```

There are several access status types upon attempting the component disengage.

```typescript
export enum DisengageStatusType {
  /// Component
  Authorized = "AUTHORIZED",
  AuthorizedPermanentEngage = "AUTHORIZED_PERMANENT_ENGAGE",
  AuthorizedPermanentDisengage = "AUTHORIZED_PERMANENT_DISENGAGE",
  AuthorizedBatteryLow = "AUTHORIZED_BATTERY_LOW",
  AuthorizedOffline = "AUTHORIZED_OFFLINE",
  Unauthorized = "UNAUTHORIZED",
  UnauthorizedOffline = "UNAUTHORIZED_OFFLINE",
  SignalLocalization = "SIGNAL_LOCALIZATION",
  MediumDefectOnline = "MEDIUM_DEFECT_ONLINE",
  MediumBlacklisted = "MEDIUM_BLACKLISTED",
  Error = "ERROR",

  /// Interface
  UnableToConnect = "UNABLE_TO_CONNECT",
  UnableToSetNotifications = "UNABLE_TO_SET_NOTIFICATIONS",
  UnableToReadChallenge = "UNABLE_TO_READ_CHALLENGE",
  UnableToWriteMDF = "UNABLE_TO_WRITE_MDF",
  AccessCipherError = "ACCESS_CIPHER_ERROR",
  BleAdapterDisabled = "BLE_ADAPTER_DISABLED",
  UnknownDevice = "UNKNOWN_DEVICE",
  UnknownStatusCode = "UNKNOWN_STATUS_CODE",
  Timeout = "TIMEOUT",
}
```

### Coding Identification Media

Use the CodingStation to write or update access data onto an EVVA identification medium.

```typescript
import { AbrevvaCodingStation } from '@evva/abrevva-react-native';

class ExampleClass {
    final url = '';
    final clientId = '';
    final username = '';
    final password = '';

  async writeMedium() {
    try {
      await AbrevvaCodingStation.register(url, clientId, username, password);
      await AbrevvaCodingStation.connect();
      await AbrevvaCodingStation.write();
      await AbrevvaCodingStation.disconnect();
    } catch (e) {
      console.log(`Error: $e`);
    }
  }
}
```
