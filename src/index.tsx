import { NitroModules } from 'react-native-nitro-modules';

import { PermissionsAndroid, Platform, type Permission } from 'react-native';
import type { AbrevvaBleImpl } from './AbrevvaBle.nitro';
import type { AbrevvaCodingStationImpl } from './AbrevvaCodingStation.nitro';
import type { AbrevvaCryptoImpl } from './AbrevvaCrypto.nitro';
import type { BleDevice, DisengageStatusType, XvnResponse } from './interfaces';

const AbrevvaBleHybridObject =
  NitroModules.createHybridObject<AbrevvaBleImpl>('AbrevvaBleImpl');
const AbrevvaCryptoHybridObject =
  NitroModules.createHybridObject<AbrevvaCryptoImpl>('AbrevvaCryptoImpl');
const AbrevvaCodingStationHybridObject =
  NitroModules.createHybridObject<AbrevvaCodingStationImpl>(
    'AbrevvaCodingStationImpl'
  );

class _AbrevvaBle {
  async initialize(androidNeverForLocation?: boolean): Promise<void> {
    if (Platform.OS === 'android') {
      var permissions: Permission[] = [];

      permissions.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);
      permissions.push(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
      if (androidNeverForLocation) {
        permissions.push(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      }
      await PermissionsAndroid.requestMultiple(permissions);
    } else {
      await AbrevvaBleHybridObject.initialize();
    }
  }

  isEnabled(): boolean {
    return AbrevvaBleHybridObject.isEnabled();
  }

  isLocationEnabled(): boolean {
    return AbrevvaBleHybridObject.isLocationEnabled();
  }

  startEnabledNotifications(callback: (result: boolean) => void): void {
    AbrevvaBleHybridObject.startEnabledNotifications(callback);
  }

  stopEnabledNotifications(): void {
    AbrevvaBleHybridObject.stopEnabledNotifications();
  }

  openLocationSettings(): void {
    AbrevvaBleHybridObject.openLocationSettings();
  }

  openBluetoothSettings(): void {
    AbrevvaBleHybridObject.openBluetoothSettings();
  }

  openAppSettings(): void {
    AbrevvaBleHybridObject.openAppSettings();
  }

  startScan(
    onScanResult: (result: BleDevice) => void,
    onScanStart: (error?: Error) => void,
    onScanStop: (error?: Error) => void,
    macFilter?: string,
    allowDuplicates?: boolean,
    timeout?: number
  ): void {
    AbrevvaBleHybridObject.startScan(
      onScanResult,
      onScanStart,
      onScanStop,
      macFilter,
      allowDuplicates,
      timeout
    );
  }

  stopScan(): void {
    AbrevvaBleHybridObject.stopScan();
  }

  async connect(
    deviceId: string,
    onDisconnect?: (address: string) => void,
    timeout?: number
  ): Promise<void> {
    await AbrevvaBleHybridObject.connect(
      deviceId,
      onDisconnect ?? function () {},
      timeout
    );
  }

  async disconnect(deviceId: string): Promise<boolean> {
    return await AbrevvaBleHybridObject.disconnect(deviceId);
  }

  async read(
    deviceId: string,
    service: string,
    characteristic: string,
    timeout?: number
  ): Promise<string> {
    return await AbrevvaBleHybridObject.read(
      deviceId,
      service,
      characteristic,
      timeout
    );
  }

  async write(
    deviceId: string,
    service: string,
    characteristic: string,
    value: string,
    timeout?: number
  ): Promise<boolean> {
    return await AbrevvaBleHybridObject.write(
      deviceId,
      service,
      characteristic,
      value,
      timeout
    );
  }

  async signalize(deviceId: string): Promise<boolean> {
    return await AbrevvaBleHybridObject.signalize(deviceId);
  }
  /**
   * @deprecated Use disengageWithXvnResponse() instead.
   */
  async disengage(
    deviceId: string,
    mobileId: string,
    mobileDeviceKey: string,
    mobileGroupId: string,
    mobileAccessData: string,
    isPermanentRelease: boolean
  ): Promise<DisengageStatusType> {
    return await AbrevvaBleHybridObject.disengage(
      deviceId,
      mobileId,
      mobileDeviceKey,
      mobileGroupId,
      mobileAccessData,
      isPermanentRelease
    );
  }

  async disengageWithXvnResponse(
    deviceId: string,
    mobileId: string,
    mobileDeviceKey: string,
    mobileGroupId: string,
    mobileAccessData: string,
    isPermanentRelease: boolean
  ): Promise<XvnResponse> {
    return await AbrevvaBleHybridObject.disengageWithXvnResponse(
      deviceId,
      mobileId,
      mobileDeviceKey,
      mobileGroupId,
      mobileAccessData,
      isPermanentRelease
    );
  }

  async startNotifications(
    deviceId: string,
    service: string,
    characteristic: string,
    timeout: number,
    callback: (event: string) => void
  ): Promise<boolean> {
    return await AbrevvaBleHybridObject.startNotifications(
      deviceId,
      service,
      characteristic,
      timeout,
      callback
    );
  }

  async stopNotifications(
    deviceId: string,
    service: string,
    characteristic: string
  ): Promise<boolean> {
    return await AbrevvaBleHybridObject.stopNotifications(
      deviceId,
      service,
      characteristic
    );
  }
}

class _AbrevvaCodingStation {
  async register(
    url: string,
    clientId: string,
    username: string,
    password: string
  ) {
    return await AbrevvaCodingStationHybridObject._register(
      url,
      clientId,
      username,
      password
    );
  }

  async connect(): Promise<void> {
    return await AbrevvaCodingStationHybridObject.connect();
  }
  async write(): Promise<void> {
    return await AbrevvaCodingStationHybridObject.write();
  }
  disconnect(): void {
    AbrevvaCodingStationHybridObject.disconnect();
  }
}

class _AbrevvaCrypto {
  encrypt(
    key: string,
    iv: string,
    adata: string,
    pt: string,
    tagLength?: number
  ) {
    return AbrevvaCryptoHybridObject.encrypt(key, iv, adata, pt, tagLength);
  }
  decrypt(
    key: string,
    iv: string,
    adata: string,
    ct: string,
    tagLength?: number
  ) {
    return AbrevvaCryptoHybridObject.decrypt(key, iv, adata, ct, tagLength);
  }
  generateKeyPair() {
    return AbrevvaCryptoHybridObject.generateKeyPair();
  }

  computeSharedSecret(key: string, peerPublicKey: string) {
    return AbrevvaCryptoHybridObject.computeSharedSecret(key, peerPublicKey);
  }

  encryptFile(sharedSecret: string, ptPath: string, ctPath: string) {
    return AbrevvaCryptoHybridObject.encryptFile(sharedSecret, ptPath, ctPath);
  }

  decryptFile(sharedSecret: string, ptPath: string, ctPath: string) {
    return AbrevvaCryptoHybridObject.decryptFile(sharedSecret, ptPath, ctPath);
  }

  decryptFileFromURL(sharedSecret: string, ptPath: string, url: string) {
    return AbrevvaCryptoHybridObject.decryptFileFromURL(
      sharedSecret,
      ptPath,
      url
    );
  }

  random(numBytes: number) {
    return AbrevvaCryptoHybridObject.random(numBytes);
  }

  derive(key: string, salt: string, info: string, length: number) {
    return AbrevvaCryptoHybridObject.derive(key, salt, info, length);
  }
}

export const AbrevvaCrypto = new _AbrevvaCrypto();
export const AbrevvaBle = new _AbrevvaBle();
export const AbrevvaCodingStation = new _AbrevvaCodingStation();
