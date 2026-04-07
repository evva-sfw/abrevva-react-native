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
> This project is an open-source option to help developers kickstart their project with our SDK. It is not a fully-fledged product!
> Feel free to use it as is, or create your own solution by utilizing our SDK directly.
> If you decide to use this plugin, we highly encourage you to create issues/PRs if you run into any challenges someone might also face in the future.
> The Example App is for demonstration purpose only and we might be slow on updates.
> Please always use the latest React Native version in your own app! - There are CVEs in older versions. See: [CVE-2025-11953](https://nvd.nist.gov/vuln/detail/CVE-2025-11953)
>
> With Version 6.0.0+ we fully migrated to the new React Native Architecture using [Nitro Modules](https://github.com/mrousavy/nitro). ( Turbo Module under the hood.)
> React Native stopped supporting their Legacy Architecture in 0.82, therefore we'll also no longer support it.

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

- react-native >= 0.84.1
- Java 17+ (Android)
- Android SDK (Android)
- Android 10+ (API level 30+) (Android)
- iOS 16.0+ (iOS)

## Installation

Set up an app with a matching ReactNative version:

```
$ npx @react-native-community/cli init MyApp --version 0.84.1
```

Add Abrevva & Nitro Modules to your project:

```
$ yarn add @evva/abrevva-react-native react-native-nitro-modules
```

If you insist on using the Legacy react-native Architecture:
```
$ yarn add @evva/abrevva-react-native@5.1.7
```


### Android

Set the minimum SDK version to 29 in your module's build gradle:

```groovy
minSdkVersion = 30
compileSdkVersion = 36
targetSdkVersion = 36
```

Depending on the used ReactNative version you might need to adjust the AGP version in your module-level `build.gradle` based on potential warnings:

```groovy
dependencies {
    classpath("com.android.tools.build:gradle:8.7.2")
    ...
```

In your app's Manifest file add any needed install-time permissions:

```xml
<!-- Scan and connect to BLE components -->
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT"/>
<uses-permission android:name="android.permission.BLUETOOTH_SCAN"
                 android:usesPermissionFlags="neverForLocation"/>
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

In your app's Podfile add these 4 lines at the top of your target before the react native configuration to ensures, that all AbrevvaSDK dependencies will be dynamically linked.

```ruby
target 'AbrevvaReactNativeExample' do
  use_frameworks!
  pod 'CocoaMQTT'
  pod 'MqttCocoaAsyncSocket'
  pod 'CryptoSwift'
  ...
end
```

Ensure you've added the 'Bluetooth' & 'NFC' Capabilities to your app.

Execute `bundle exec pod install` inside of your projects `ios/` folder.

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
      },
      (error?: Error) => {
        console.log(`Scan started, error: ${error ? 'yes' : 'no'}`);
      },
      (error?: Error) => {
        console.log(`Scan stopped, success: ${error ? 'yes' : 'no'}`);
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
  companyIdentifier?: number;
  version?: number;
  componentType?: ComponentType;
  mainFirmwareVersionMajor?: number;
  mainFirmwareVersionMinor?: number;
  mainFirmwareVersionPatch?: number;
  componentHAL?: string;
  batteryStatus?: BatteryStatus;
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
const success = await AbrevvaBle.signalize('deviceId');
```

### Perform disengage on EVVA components

For the component disengage you have to provide access credentials to the EVVA component. Those are generally acquired in the form of access media metadata from the Xesar software.

```typescript
const xvnResponse = await AbrevvaBle.disengageWithXvnResponse(
  device.deviceId,
  'mobileId', // sha256-hashed hex-encoded version of `xsMobileId` found in blob data.
  'mobileDeviceKey', // mobile device key string from `xsMOBDK` found in blob data.
  'mobileGroupId', // mobile group id string from `xsMOBGID` found in blob data.
  'mobileAccessData', // access data string from `mediumDataFrame` found in blob data.
  false
);

console.log(`DisengageStatus=${xvnResponse.disengageStatusType}`);
console.log(`XvnData?=${xvnResponse.xvnData}`);
```

There are several access status types upon attempting the component disengage.

```typescript
export type DisengageStatusType =
  /// Component
  | 'AUTHORIZED'
  | 'AUTHORIZED_PERMANENT_ENGAGE'
  | 'AUTHORIZED_PERMANENT_DISENGAGE'
  | 'AUTHORIZED_BATTERY_LOW'
  | 'AUTHORIZED_OFFLINE'
  | 'UNAUTHORIZED'
  | 'UNAUTHORIZED_OFFLINE'
  | 'SIGNAL_LOCALIZATION'
  | 'MEDIUM_DEFECT_ONLINE'
  | 'MEDIUM_BLACKLISTED'
  | 'ERROR'

  /// Interface
  | 'UNABLE_TO_CONNECT'
  | 'UNABLE_TO_SET_NOTIFICATIONS'
  | 'UNABLE_TO_READ_CHALLENGE'
  | 'UNABLE_TO_WRITE_MDF'
  | 'ACCESS_CIPHER_ERROR'
  | 'BLE_ADAPTER_DISABLED'
  | 'UNKNOWN_DEVICE'
  | 'UNKNOWN_STATUS_CODE'
  | 'TIMEOUT';
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
      AbrevvaCodingStation.disconnect();
    } catch (e) {
      console.log(`Error: $e`);
    }
  }
}
```
