import {
  DeviceEventEmitter,
  type EmitterSubscription,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';

export * from './conversion';
export type * from './interfaces';

import { Platform } from 'react-native';

import {
  type AbrevvaBLEInterface,
  type AbrevvaCryptoInterface,
  type BleDevice,
  type BooleanResult,
  DisengageStatusType,
  type StringResult,
} from './interfaces';

const NativeModuleCrypto = NativeModules.AbrevvaCrypto
  ? NativeModules.AbrevvaCrypto
  : new Proxy(
      {},
      {
        get() {
          throw new Error('Linking Error AbrevvaCrypto');
        },
      },
    );

const NativeModuleBle = NativeModules.AbrevvaBle
  ? NativeModules.AbrevvaBle
  : new Proxy(
      {},
      {
        get() {
          throw new Error('Linking Error AbrevvaBle');
        },
      },
    );

export class AbrevvaBleModule implements AbrevvaBLEInterface {
  private eventListeners = new Map<string, EmitterSubscription>();
  private readonly eventEmitter: NativeEventEmitter | undefined;

  constructor() {
    this.eventEmitter = Platform.select({
      ios: new NativeEventEmitter(NativeModuleBle),
      android: DeviceEventEmitter,
    });
    if (this.eventEmitter === undefined) {
      throw new Error('this platform is not supported');
    }
  }

  private removeUndefinedField(obj: any) {
    for (let propName in obj) {
      obj[propName] ?? delete obj[propName];
    }
    return obj;
  }

  private async registerListener(key: string, callback: any) {
    this.eventListeners.get(key)?.remove();
    await NativeModuleBle.setSupportedEvents({ events: [...this.eventListeners.keys(), key] });
    const listener = this.eventEmitter!.addListener(key, (data) => {
      callback(data);
    });
    this.eventListeners.set(key, listener);
  }

  private removeListener(key: string) {
    if (this.eventListeners.get(key)) {
      this.eventListeners.get(key)?.remove();
      NativeModuleBle.setSupportedEvents({ events: [...this.eventListeners.keys()] });
    }
  }

  async initialize(androidNeverForLocation?: boolean): Promise<void> {
    await NativeModuleBle.initialize(
      this.removeUndefinedField({ androidNeverForLocation: androidNeverForLocation }),
    );
  }

  async isEnabled(): Promise<BooleanResult> {
    return await NativeModuleBle.isEnabled();
  }

  async isLocationEnabled(): Promise<BooleanResult> {
    return await NativeModuleBle.isLocationEnabled();
  }

  async startEnabledNotifications(callback: (result: BooleanResult) => void): Promise<void> {
    await this.registerListener('onEnabledChanged', callback);
    await NativeModuleBle.startEnabledNotifications();
  }

  async stopEnabledNotifications(): Promise<void> {
    this.removeListener('onEnabledChanges');
    await NativeModuleBle.stopEnabledNotifications();
  }

  async openLocationSettings(): Promise<void> {
    await NativeModuleBle.openLocationSettings();
  }

  async openBluetoothSettings(): Promise<void> {
    await NativeModuleBle.openBluetoothSettings();
  }

  async openAppSettings(): Promise<void> {
    await NativeModuleBle.openAppSettings();
  }

  async startScan(
    onScanResult: (result: BleDevice) => void,
    onScanStart: (success: BooleanResult) => void,
    onScanStop: (success: BooleanResult) => void,
    macFilter?: string,
    allowDuplicates?: boolean,
    timeout?: number,
  ): Promise<void> {
    if (onScanResult) {
      await this.registerListener('onScanResult', onScanResult);
    }

    if (onScanStart) {
      await this.registerListener('onScanStart', onScanStart);
    }

    if (onScanStop) {
      await NativeModuleBle.setSupportedEvents({
        events: [...this.eventListeners.keys(), 'onScanStop'],
      });
      await this.registerListener('onScanStop', (success: BooleanResult) => {
        ['onScanResult', 'onScanStart', 'onScanStop'].forEach((key) => {
          this.eventListeners.get(key)?.remove();
        });
        onScanStop(success);
      });
    }

    await NativeModuleBle.startScan(
      this.removeUndefinedField({
        macFilter: macFilter,
        allowDuplicates: allowDuplicates,
        timeout: timeout,
      }),
    );
  }

  async stopScan(): Promise<void> {
    await NativeModuleBle.stopScan();
  }

  async connect(
    deviceId: string,
    onDisconnect: (address: string) => void,
    timeout?: number,
  ): Promise<void> {
    if (onDisconnect) {
      const key = `onDisconnect|${deviceId}`;
      this.eventListeners.get(key)?.remove();
      const listener = this.eventEmitter!.addListener(key, (address) => {
        onDisconnect(address.value);
      });
      this.eventListeners.set(key, listener);
    }

    await NativeModuleBle.connect({
      deviceId: deviceId,
      timeout: timeout,
    });
  }

  async disconnect(deviceId: string): Promise<void> {
    await NativeModuleBle.disconnect({ deviceId: deviceId });
  }

  async read(
    deviceId: string,
    service: string,
    characteristic: string,
    timeout?: number,
  ): Promise<StringResult> {
    return await NativeModuleBle.read({
      deviceId: deviceId,
      service: service,
      characteristic: characteristic,
      timeout: timeout,
    });
  }

  async write(
    deviceId: string,
    service: string,
    characteristic: string,
    value: string,
    timeout?: number,
  ): Promise<void> {
    return await NativeModuleBle.write({
      deviceId: deviceId,
      service: service,
      characteristic: characteristic,
      value: value,
      timeout: timeout,
    });
  }

  async signalize(deviceId: string): Promise<BooleanResult> {
    return await NativeModuleBle.signalize({ deviceId: deviceId });
  }

  async disengage(
    deviceId: string,
    mobileId: string,
    mobileDeviceKey: string,
    mobileGroupId: string,
    mobileAccessData: string,
    isPermanentRelease: boolean,
  ): Promise<DisengageStatusType> {
    const status = (
      await NativeModuleBle.disengage({
        deviceId: deviceId,
        mobileId: mobileId,
        mobileDeviceKey: mobileDeviceKey,
        mobileGroupId: mobileGroupId,
        mobileAccessData: mobileAccessData,
        isPermanentRelease: isPermanentRelease,
      })
    ).value;

    let result: DisengageStatusType;
    if (Object.values(DisengageStatusType).some((val: string) => val === status)) {
      result = status as DisengageStatusType;
    } else {
      result = DisengageStatusType.Error;
    }
    return result;
  }

  async startNotifications(
    deviceId: string,
    service: string,
    characteristic: string,
    callback: (event: StringResult) => void,
  ): Promise<void> {
    const key = `notification|${deviceId}|${service}|${characteristic}`.toLowerCase();
    await this.registerListener(key, callback);
    return await NativeModuleBle.startNotifications(
      this.removeUndefinedField({
        deviceId: deviceId,
        service: service,
        characteristic: characteristic,
      }),
    );
  }

  async stopNotifications(
    deviceId: string,
    service: string,
    characteristic: string,
  ): Promise<void> {
    const key = `notification|${deviceId}|${service}|${characteristic}`.toLowerCase();
    this.removeListener(key);
    return NativeModuleBle.stopNotifications({
      deviceId: deviceId,
      service: service,
      characteristic: characteristic,
    });
  }
}

class AbrevvaCryptoModule implements AbrevvaCryptoInterface {
  encrypt(key: string, iv: string, adata: string, pt: string, tagLength?: number) {
    return NativeModuleCrypto.encrypt({
      key: key,
      iv: iv,
      adata: adata,
      pt: pt,
      tagLength: tagLength,
    });
  }
  decrypt(key: string, iv: string, adata: string, ct: string, tagLength?: number) {
    return NativeModuleCrypto.decrypt({
      key: key,
      iv: iv,
      adata: adata,
      ct: ct,
      tagLength: tagLength,
    });
  }
  generateKeyPair() {
    return NativeModuleCrypto.generateKeyPair();
  }

  computeSharedSecret(key: string, peerPublicKey: string) {
    return NativeModuleCrypto.computeSharedSecret({ key: key, peerPublicKey: peerPublicKey });
  }

  encryptFile(sharedSecret: string, ptPath: string, ctPath: string) {
    return NativeModuleCrypto.encryptFile({
      sharedSecret: sharedSecret,
      ptPath: ptPath,
      ctPath: ctPath,
    });
  }

  decryptFile(sharedSecret: string, ptPath: string, ctPath: string) {
    return NativeModuleCrypto.decryptFile({
      sharedSecret: sharedSecret,
      ptPath: ptPath,
      ctPath: ctPath,
    });
  }

  decryptFileFromURL(sharedSecret: string, ptPath: string, url: string) {
    return NativeModuleCrypto.decryptFileFromURL({
      sharedSecret: sharedSecret,
      ptPath: ptPath,
      url: url,
    });
  }

  random(numBytes: number) {
    return NativeModuleCrypto.random({ numBytes: numBytes });
  }

  derive(key: string, salt: string, info: string, length: number) {
    return NativeModuleCrypto.derive({ key: key, salt: salt, info: info, length: length });
  }
}

export const AbrevvaBle = new AbrevvaBleModule();
export const AbrevvaCrypto = new AbrevvaCryptoModule();

export function createAbrevvaBleInstance() {
  return new AbrevvaBleModule();
}
