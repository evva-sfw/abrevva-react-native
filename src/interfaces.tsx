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

export interface AbrevvaNfcInterface {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  read: () => Promise<void>;
}
export interface AbrevvaCryptoInterface {
  encrypt: (
    key: string,
    iv: string,
    adata: string,
    pt: string,
    tagLength?: number,
  ) => Promise<Object>;
  decrypt: (
    key: string,
    iv: string,
    adata: string,
    ct: string,
    tagLength?: number,
  ) => Promise<Object>;
  generateKeyPair: () => Promise<Object>;
  computeSharedSecret: (key: string, peerPublicKey: string) => Promise<Object>;
  encryptFile: (sharedSecret: string, ptPath: string, ctPath: string) => Promise<Object>;
  decryptFile: (sharedSecret: string, ptPath: string, ctPath: string) => Promise<Object>;
  decryptFileFromURL: (sharedSecret: string, ptPath: string, url: string) => Promise<Object>;
  random: (numBytes: number) => Promise<Object>;
  derive: (key: string, salt: string, info: string, length: number) => Promise<Object>;
}
export interface AbrevvaBLEInterface {
  initialize(androidNeverForLocation?: boolean): Promise<void>;
  isEnabled(): Promise<boolean>;
  isLocationEnabled(): Promise<boolean>;
  startEnabledNotifications(callback: (result: boolean) => void): Promise<void>;
  stopEnabledNotifications(): Promise<void>;
  openLocationSettings(): Promise<void>;
  openBluetoothSettings(): Promise<void>;
  openAppSettings(): Promise<void>;
  requestLEScan(
    onScanResultCallback: (result: ScanResult) => void,
    onConnectCallback: (address: string) => void,
    onDisconnectCallback: (address: string) => void,
    timeout?: number,
    services?: string[],
    name?: string,
    namePrefix?: string,
    optionalServices?: string[],
    allowDuplicates?: boolean,
    scanMode?: ScanMode,
  ): Promise<void>;
  stopLEScan(): Promise<void>;
  connect(deviceId: string, timeout?: number): Promise<void>;
  disconnect(deviceId: string): Promise<void>;
  read(
    deviceId: string,
    service: string,
    characteristic: string,
    timeout?: number,
  ): Promise<ReadResult>;
  write(
    deviceId: string,
    service: string,
    characteristic: string,
    value: string,
    timeout?: number,
  ): Promise<void>;
  signalize(deviceId: string): Promise<void>;
  disengage(
    deviceId: string,
    mobileId: string,
    mobileDeviceKey: string,
    mobileGroupId: string,
    mobileAccessData: string,
    isPermanentRelease: boolean,
  ): Promise<StringResult>;
  startNotifications(
    deviceId: string,
    service: string,
    characteristic: string,
    callback: (event: ReadResult) => void,
  ): Promise<void>;
  stopNotifications(deviceId: string, service: string, characteristic: string): Promise<void>;
}
