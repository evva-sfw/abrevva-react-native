import type { HybridObject } from 'react-native-nitro-modules';
import type { BleDevice, DisengageStatusType, XvnResponse } from './interfaces';

export interface AbrevvaBleImpl extends HybridObject<{
  ios: 'swift';
  android: 'kotlin';
}> {
  initialize(androidNeverForLocation?: boolean): Promise<void>;
  isEnabled(): boolean;
  isLocationEnabled(): boolean;
  startEnabledNotifications(callback: (result: boolean) => void): void;
  stopEnabledNotifications(): void;
  openLocationSettings(): void;
  openBluetoothSettings(): void;
  openAppSettings(): void;
  startScan(
    onScanResult: (result: BleDevice) => void,
    onScanStart?: (error?: Error) => void,
    onScanStop?: (error?: Error) => void,
    macFilter?: string,
    allowDuplicates?: boolean,
    timeout?: number
  ): void;
  stopScan(): void;
  connect(
    deviceId: string,
    onDisconnect: (address: string) => void,
    timeout?: number
  ): Promise<boolean>;
  disconnect(deviceId: string): Promise<boolean>;
  read(
    deviceId: string,
    service: string,
    characteristic: string,
    timeout?: number
  ): Promise<string>;
  write(
    deviceId: string,
    service: string,
    characteristic: string,
    value: string,
    timeout?: number
  ): Promise<boolean>;
  signalize(deviceId: string): Promise<boolean>;
  /**
   * @deprecated Use disengageWithXvnResponse() instead.
   */
  disengage(
    deviceId: string,
    mobileId: string,
    mobileDeviceKey: string,
    mobileGroupId: string,
    mobileAccessData: string,
    isPermanentRelease: boolean
  ): Promise<DisengageStatusType>;
  disengageWithXvnResponse(
    deviceId: string,
    mobileId: string,
    mobileDeviceKey: string,
    mobileGroupId: string,
    mobileAccessData: string,
    isPermanentRelease: boolean
  ): Promise<XvnResponse>;
  startNotifications(
    deviceId: string,
    service: string,
    characteristic: string,
    timeout: number,
    callback: (event: string) => void
  ): Promise<boolean>;
  stopNotifications(
    deviceId: string,
    service: string,
    characteristic: string
  ): Promise<boolean>;
}
