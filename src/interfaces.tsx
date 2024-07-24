export interface InitializeOptions {
  androidNeverForLocation?: boolean;
}

export enum ScanMode {
  SCAN_MODE_LOW_POWER = 0,
  SCAN_MODE_BALANCED = 1,
  SCAN_MODE_LOW_LATENCY = 2,
}
export interface RequestBleDeviceOptions {
  services?: string[];
  name?: string;
  namePrefix?: string;
  optionalServices?: string[];
  allowDuplicates?: boolean;
  scanMode?: ScanMode;
  timeout?: number;
}

export type Data = DataView | string;

export interface BooleanResult {
  value: boolean;
}

export interface StringResult {
  value: string;
}

export interface DeviceIdOptions {
  deviceId: string;
}

export interface TimeoutOptions {
  timeout?: number;
}

export interface BleDevice {
  deviceId: string;
  name?: string;
  uuids?: string[];
}

export interface ScanResult {
  device: BleDevice;
  localName?: string;
  rssi?: number;
  txPower?: number;
  manufacturerData?: { [key: string]: DataView };
  serviceData?: { [key: string]: DataView };
  uuids?: string[];
  rawAdvertisement?: DataView;
}

export interface ScanResultInternal<T = Data> {
  device: BleDevice;
  localName?: string;
  rssi?: number;
  txPower?: number;
  manufacturerData?: { [key: string]: T };
  serviceData?: { [key: string]: T };
  uuids?: string[];
  rawAdvertisement?: T;
}

export interface ReadOptions {
  deviceId: string;
  service: string;
  characteristic: string;
}

export interface ReadResult {
  value?: string;
}

export interface WriteOptions {
  deviceId: string;
  service: string;
  characteristic: string;
  value: string;
}

export interface SignalizeOptions {
  deviceId: string;
}

export interface DisengageOptions {
  deviceId: string;
  mobileId: string;
  mobileDeviceKey: string;
  mobileGroupId: string;
  mobileAccessData: string;
  isPermanentRelease: boolean;
}
