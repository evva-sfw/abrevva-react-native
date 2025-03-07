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
  rawData?: [string: any];
}

export interface BleDeviceManufacturerData {
  companyIdentifier?: number;
  version?: number;
  componentType?:
    | 'handle'
    | 'escutcheon'
    | 'cylinder'
    | 'wallreader'
    | 'emzy'
    | 'iobox'
    | 'unknown';
  mainFirmwareVersionMajor?: number;
  mainFirmwareVersionMinor?: number;
  mainFirmwareVersionPatch?: number;
  componentHAL?: string;
  batteryStatus?: 'battery-full' | 'battery-empty';
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

export enum DisengageStatusType {
  /// Component
  Authorized = 'AUTHORIZED',
  AuthorizedPermanentEngage = 'AUTHORIZED_PERMANENT_ENGAGE',
  AuthorizedPermanentDisengage = 'AUTHORIZED_PERMANENT_DISENGAGE',
  AuthorizedBatteryLow = 'AUTHORIZED_BATTERY_LOW',
  AuthorizedOffline = 'AUTHORIZED_OFFLINE',
  Unauthorized = 'UNAUTHORIZED',
  UnauthorizedOffline = 'UNAUTHORIZED_OFFLINE',
  SignalLocalization = 'SIGNAL_LOCALIZATION',
  MediumDefectOnline = 'MEDIUM_DEFECT_ONLINE',
  MediumBlacklisted = 'MEDIUM_BLACKLISTED',
  Error = 'ERROR',

  /// Interface
  UnableToConnect = 'UNABLE_TO_CONNECT',
  UnableToSetNotifications = 'UNABLE_TO_SET_NOTIFICATIONS',
  UnableToReadChallenge = 'UNABLE_TO_READ_CHALLENGE',
  UnableToWriteMDF = 'UNABLE_TO_WRITE_MDF',
  AccessCipherError = 'ACCESS_CIPHER_ERROR',
  BleAdapterDisabled = 'BLE_ADAPTER_DISABLED',
  UnknownDevice = 'UNKNOWN_DEVICE',
  UnknownStatusCode = 'UNKNOWN_STATUS_CODE',
  Timeout = 'TIMEOUT',
}

export interface AbrevvaCodingStationInterface {
  register: (url: string, clientId: string, username: string, password: string) => Promise<void>;
  connect: () => Promise<void>;
  write: () => Promise<void>;
  disconnect: () => Promise<void>;
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
  isEnabled(): Promise<BooleanResult>;
  isLocationEnabled(): Promise<BooleanResult>;
  startEnabledNotifications(callback: (result: BooleanResult) => void): Promise<void>;
  stopEnabledNotifications(): Promise<void>;
  openLocationSettings(): Promise<void>;
  openBluetoothSettings(): Promise<void>;
  openAppSettings(): Promise<void>;
  startScan(
    onScanResult: (result: BleDevice) => void,
    onScanStart?: (success: BooleanResult) => void,
    onScanStop?: (success: BooleanResult) => void,
    macFilter?: string,
    allowDuplicates?: boolean,
    timeout?: number,
  ): Promise<void>;
  stopScan(): Promise<void>;
  connect(
    deviceId: string,
    onDisconnect: (address: string) => void,
    timeout?: number,
  ): Promise<void>;
  disconnect(deviceId: string): Promise<void>;
  read(
    deviceId: string,
    service: string,
    characteristic: string,
    timeout?: number,
  ): Promise<StringResult>;
  write(
    deviceId: string,
    service: string,
    characteristic: string,
    value: string,
    timeout?: number,
  ): Promise<void>;
  signalize(deviceId: string): Promise<BooleanResult>;
  disengage(
    deviceId: string,
    mobileId: string,
    mobileDeviceKey: string,
    mobileGroupId: string,
    mobileAccessData: string,
    isPermanentRelease: boolean,
  ): Promise<DisengageStatusType>;
  startNotifications(
    deviceId: string,
    service: string,
    characteristic: string,
    timeout: number,
    callback: (event: StringResult) => void,
  ): Promise<void>;
  stopNotifications(deviceId: string, service: string, characteristic: string): Promise<void>;
}
