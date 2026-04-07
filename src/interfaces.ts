export type Data = DataView | string;

export interface InitializeOptions {
  androidNeverForLocation?: boolean;
}

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

export interface BleScannerOptions {
  macFilter?: string;
  allowDuplicates?: boolean;
  timeout?: number;
}

export interface BleDeviceAdvertisementData {
  rssi?: number;
  isConnectable?: boolean;
  manufacturerData?: BleDeviceManufacturerData;
}

export enum ComponentType {
  handle,
  escutcheon,
  cylinder,
  wallreader,
  emzy,
  iobox,
  unknown,
}

export enum BatteryStatus {
  batteryFull = 'battery-full',
  BatteryEmpty = 'battery-empty',
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

export interface BleDevice {
  deviceId: string;
  name?: string;
  advertisementData?: BleDeviceAdvertisementData;
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
  mediumAccessData: string;
  isPermanentRelease: boolean;
}

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

export type XvnResponse = {
  disengageStatusType: DisengageStatusType;
  xvnData?: HexString;
};

export type HexString = string;
export type Base64String = string;

export interface EncryptResult {
  cipherText: HexString;
  authTag: HexString;
}

export interface DecryptResult {
  plainText: HexString;
  authOk: boolean;
}

export interface KeypairResult {
  privateKey: HexString;
  publicKey: HexString;
}
