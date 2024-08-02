import {
  DeviceEventEmitter,
  type EmitterSubscription,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';

export * from './conversion';
export type * from './interfaces';

import { Platform } from 'react-native';

import { convertObject, convertValue } from './conversion';
import type {
  AbrevvaBLEInterface,
  AbrevvaCryptoInterface,
  AbrevvaNfcInterface,
  DeviceIdOptions,
  DisengageOptions,
  ReadOptions,
  ReadResult,
  ScanMode,
  ScanResult,
  ScanResultInternal,
  SignalizeOptions,
  StringResult,
  TimeoutOptions,
  WriteOptions,
} from './interfaces';

const NativeModuleNfc = NativeModules.AbrevvaNfc
  ? NativeModules.AbrevvaNfc
  : new Proxy(
      {},
      {
        get() {
          throw new Error('Linking Error AbrevvaNfc');
        },
      },
    );

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

class AbrevvaBleModule implements AbrevvaBLEInterface {
  private listeners: Map<String, EmitterSubscription | undefined>;
  private eventEmitter: NativeEventEmitter | undefined;

  constructor() {
    this.eventEmitter = Platform.select({
      ios: new NativeEventEmitter(NativeModuleBle),
      android: DeviceEventEmitter,
    });
    if (this.eventEmitter === undefined) {
      throw new Error('this platform is not supported');
    }

    this.listeners = new Map<String, EmitterSubscription | undefined>([
      ['onEnabledChanged', undefined],
      ['onScanResult', undefined],
      ['onConnect', undefined],
      ['onDisconnect', undefined],
    ]);

    NativeModuleBle?.setSupportedEvents({ events: [...this.listeners.keys()] });
  }

  async initialize(androidNeverForLocation?: boolean): Promise<void> {
    return NativeModuleBle.initialize(
      this.removeUndefinedField({ androidNeverForLocation: androidNeverForLocation }),
    );
  }

  async isEnabled(): Promise<boolean> {
    return NativeModuleBle.isEnabled();
  }

  async isLocationEnabled(): Promise<boolean> {
    return NativeModuleBle.isLocationEnabled();
  }

  async startEnabledNotifications(callback: (result: boolean) => void): Promise<void> {
    this.listeners.set(
      'onEnabledChanged',
      this.eventEmitter!.addListener('onEnabledChanged', (event: any) => {
        callback(event.value);
      }),
    );
    return NativeModuleBle.startEnabledNotifications();
  }

  async stopEnabledNotifications(): Promise<void> {
    this.listeners.set('onEnabledChanged', undefined);
    return await NativeModuleBle.stopEnabledNotifications();
  }

  async openLocationSettings(): Promise<void> {
    return await NativeModuleBle.openLocationSettings();
  }

  async openBluetoothSettings(): Promise<void> {
    return await NativeModuleBle.openBluetoothSettings();
  }

  async openAppSettings(): Promise<void> {
    return await NativeModuleBle.openAppSettings();
  }

  private removeUndefinedField(obj: any) {
    for (let propName in obj) {
      obj[propName] ?? delete obj[propName];
    }
    return obj;
  }

  async requestLEScan(
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
  ): Promise<void> {
    if (this.listeners.get('onScanResult') !== undefined) {
      return Promise.reject('scan already in progress');
    }

    const onScanResultHelper = (resultInternal: ScanResultInternal) => {
      const result: ScanResult = {
        ...resultInternal,
        manufacturerData: convertObject(resultInternal.manufacturerData),
        serviceData: convertObject(resultInternal.serviceData),
        rawAdvertisement: resultInternal.rawAdvertisement
          ? convertValue(resultInternal.rawAdvertisement)
          : undefined,
      };
      onScanResultCallback(result);
    };

    const listeners = new Map<string, any>([
      ['onScanResult', { callback: onScanResultHelper, listener: undefined }],
      ['onConnect', { callback: onConnectCallback, listener: undefined }],
      ['onDisconnect', { callback: onDisconnectCallback, listener: undefined }],
    ]);

    listeners.forEach((callbackObj: any, listenerName: string) => {
      callbackObj.listener = this.eventEmitter!.addListener(listenerName, callbackObj.callback);
      this.listeners.set(listenerName, callbackObj.listener);
    });

    NativeModuleBle.requestLEScan(
      this.removeUndefinedField({
        services: services,
        name: name,
        namePrefix: namePrefix,
        optionalServices: optionalServices,
        allowDuplicates: allowDuplicates,
        scanMode: scanMode,
        timeout: timeout,
      }),
    );

    setTimeout(
      () => {
        listeners.forEach((callbackObj: any, listenerName: string) => {
          this.listeners.set(listenerName, undefined);
          callbackObj.listener.remove();
        });
        Promise.resolve();
      },
      (timeout ? timeout : 10000) + 500,
    );
  }

  async stopLEScan(): Promise<void> {
    return await NativeModuleBle.stopLEScan();
  }

  async connect(options: DeviceIdOptions & TimeoutOptions): Promise<void> {
    return await NativeModuleBle.connect(options);
  }

  async disconnect(options: DeviceIdOptions): Promise<void> {
    this.listeners.forEach((listener) => listener?.remove);
    this.listeners = new Map<String, EmitterSubscription | undefined>([
      ['onEnabledChanged', undefined],
      ['onScanResult', undefined],
      ['onConnect', undefined],
      ['onDisconnect', undefined],
    ]);
    NativeModuleBle.setSupportedEvents({ events: [...this.listeners.keys()] });
    return NativeModuleBle.disconnect(options);
  }

  async read(options: ReadOptions & TimeoutOptions): Promise<ReadResult> {
    return NativeModuleBle.read(options);
  }

  async write(options: WriteOptions & TimeoutOptions): Promise<void> {
    return NativeModuleBle.write(options);
  }

  async signalize(options: SignalizeOptions): Promise<void> {
    return NativeModuleBle.signalize(options);
  }

  async disengage(options: DisengageOptions): Promise<StringResult> {
    return NativeModuleBle.disengage(options);
  }

  async startNotifications(
    deviceId: string,
    service: string,
    characteristic: string,
    callback: (event: ReadResult) => void,
  ): Promise<void> {
    const key = `notification|${deviceId}|${service}|${characteristic}`.toLowerCase();
    const listener = this.eventEmitter!.addListener(key, callback);
    this.listeners.set(key, listener);
    await NativeModuleBle.setSupportedEvents({ events: [...this.listeners.keys()] });
    return NativeModuleBle.startNotifications(
      this.removeUndefinedField({
        deviceId: deviceId,
        service: service,
        characteristic: characteristic,
      }),
    );
  }

  async stopNotifications(options: ReadOptions): Promise<void> {
    const key =
      `notification|${options.deviceId}|${options.service}|${options.characteristic}`.toLowerCase();
    if (key in this.listeners) {
      this.listeners.delete(key);
      NativeModuleBle.setSupportedEvents({
        events: [...this.listeners.keys()],
      });
    }
    return NativeModuleBle.stopNotifications(options);
  }
}

class AbrevvaNfcModule implements AbrevvaNfcInterface {
  connect() {
    return NativeModuleNfc.connect();
  }
  disconnect() {
    return NativeModuleNfc.disconnect();
  }
  read() {
    return NativeModuleNfc.read();
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
export const AbrevvaNfc = new AbrevvaNfcModule();

export function createAbrevvaBleInstance() {
  return new AbrevvaBleModule();
}
