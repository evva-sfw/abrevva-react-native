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
    services?: string[],
    name?: string,
    namePrefix?: string,
    optionalServices?: string[],
    allowDuplicates?: boolean,
    scanMode?: ScanMode,
    timeout?: number,
  ): Promise<void>;
  stopLEScan(): Promise<void>;
  connect(options: DeviceIdOptions & TimeoutOptions): Promise<void>;
  disconnect(options: DeviceIdOptions): Promise<void>;
  read(options: ReadOptions & TimeoutOptions): Promise<ReadResult>;
  write(options: WriteOptions & TimeoutOptions): Promise<void>;
  signalize(options: SignalizeOptions): Promise<void>;
  disengage(options: DisengageOptions): Promise<StringResult>;
  startNotifications(
    deviceId: string,
    service: string,
    characteristic: string,
    callback: (event: ReadResult) => void,
  ): Promise<void>;
  stopNotifications(options: ReadOptions): Promise<void>;
}
