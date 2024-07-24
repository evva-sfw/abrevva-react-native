// https://stackoverflow.com/a/73382191
// TODO: Verify that this works as intended
import {
  NativeEventEmitter,
  NativeModules,
  DeviceEventEmitter,
  type EmitterSubscription,
} from 'react-native';

export type * from './interfaces';
export * from './conversion';

import type {
  InitializeOptions,
  BooleanResult,
  RequestBleDeviceOptions,
  ScanResultInternal,
  ScanResult,
  DeviceIdOptions,
  TimeoutOptions,
  ReadOptions,
  WriteOptions,
  DisengageOptions,
  SignalizeOptions,
  ReadResult,
  StringResult,
} from './interfaces';
import { Platform } from 'react-native';
import { convertObject, convertValue } from './conversion';

class BleClient {
  private abrevvaBle: any;

  private listeners: Map<String, EmitterSubscription | undefined>;
  private eventEmitter: NativeEventEmitter | undefined;

  constructor() {
    this.abrevvaBle = NativeModules.AbrevvaBle
      ? NativeModules.AbrevvaBle
      : new Proxy(
          {},
          {
            get() {
              throw new Error('Linking Error AbrevvaBle');
            },
          },
        );
    this.eventEmitter = Platform.select({
      ios: new NativeEventEmitter(this.abrevvaBle),
      android: DeviceEventEmitter,
    });

    this.listeners = new Map<String, EmitterSubscription | undefined>([
      ['onEnabledChanged', undefined],
      ['onScanResult', undefined],
    ]);

    this.abrevvaBle.setSupportedEvents({ events: [...this.listeners.keys()] });
  }

  async initialize(options: InitializeOptions): Promise<void> {
    return await this.abrevvaBle.initialize(options);
  }

  async isEnabled(): Promise<BooleanResult> {
    return await this.abrevvaBle.isEnabled();
  }

  async isLocationEnabled(options: InitializeOptions): Promise<void> {
    return await this.abrevvaBle.isLocationEnabled(options);
  }

  async startEnabledNotifications(callback: (result: BooleanResult) => void): Promise<void> {
    if (this.eventEmitter === undefined) {
      console.error('unsupported platform');
      return;
    }
    this.listeners.get('onEnabledChanged')?.remove();
    this.listeners.set(
      'onEnabledChanged',
      this.eventEmitter.addListener('onEnabledChanged', (event: any) => {
        callback(event.value);
      }),
    );
    return this.abrevvaBle.startEnabledNotifications();
  }

  async stopEnabledNotifications(): Promise<void> {
    if (this.listeners.get('onEnabledChanged') !== undefined) {
      this.listeners.get('onEnabledChanged')?.remove();
      this.listeners.set('onEnabledChanged', undefined);
    }
    return await this.abrevvaBle.stopEnabledNotifications();
  }

  async openLocationSettings(): Promise<void> {
    return await this.abrevvaBle.openLocationSettings();
  }

  async openBluetoothSettings(): Promise<void> {
    return await this.abrevvaBle.openBluetoothSettings();
  }

  async openAppSettings(): Promise<void> {
    return await this.abrevvaBle.openAppSettings();
  }

  async requestLEScan(
    options: RequestBleDeviceOptions,
    callback: (result: ScanResult) => void,
  ): Promise<void> {
    if (this.eventEmitter === undefined) {
      console.error('unsupported platform');
      return;
    }
    this.listeners.get('onScanResult')?.remove();

    const listener = this.eventEmitter.addListener(
      'onScanResult',
      (resultInternal: ScanResultInternal) => {
        const result: ScanResult = {
          ...resultInternal,
          manufacturerData: convertObject(resultInternal.manufacturerData),
          serviceData: convertObject(resultInternal.serviceData),
          rawAdvertisement: resultInternal.rawAdvertisement
            ? convertValue(resultInternal.rawAdvertisement)
            : undefined,
        };
        callback(result);
      },
    );

    this.listeners.set('onScanResult', listener);
    this.abrevvaBle.requestLEScan(options);
    const timeout = options.timeout ? options.timeout : 10000;
    setTimeout(() => {
      listener.remove();
      this.listeners.set('onScanResult', undefined);
      Promise.resolve();
    }, timeout + 500);
  }

  async stopLEScan(): Promise<void> {
    return await this.abrevvaBle.stopLEScan();
  }

  async connect(options: DeviceIdOptions & TimeoutOptions): Promise<void> {
    return await this.abrevvaBle.connect(options);
  }

  async disconnect(options: DeviceIdOptions): Promise<void> {
    this.listeners.forEach((listener) => listener?.remove());
    this.listeners = new Map<String, EmitterSubscription | undefined>([
      ['onEnabledChanged', undefined],
      ['onScanResult', undefined],
    ]);
    this.abrevvaBle.setSupportedEvents({ events: [...this.listeners.keys()] });
    return await this.abrevvaBle.disconnect(options);
  }

  async read(options: ReadOptions & TimeoutOptions): Promise<ReadResult> {
    return await this.abrevvaBle.read(options);
  }

  async write(options: WriteOptions & TimeoutOptions): Promise<void> {
    return await this.abrevvaBle.write(options);
  }

  async signalize(options: SignalizeOptions): Promise<void> {
    return await this.abrevvaBle.signalize(options);
  }

  async disengage(options: DisengageOptions): Promise<StringResult> {
    return await this.abrevvaBle.disengage(options);
  }

  async startNotifications(
    options: ReadOptions,
    callback: (event: ReadResult) => void,
  ): Promise<void> {
    if (this.eventEmitter === undefined) {
      console.error('unsupported platform');
      return;
    }
    const key =
      `notification|${options.deviceId}|${options.service}|${options.characteristic}`.toLowerCase();
    this.listeners.get(key)?.remove();
    this.listeners.set(key, undefined);
    this.abrevvaBle.setSupportedEvents({ events: [...this.listeners.keys()] });
    const listener = this.eventEmitter.addListener(key, (event: any) => {
      callback(event.value);
    });
    this.listeners.set(key, listener);
    return await this.abrevvaBle.startNotifications(options);
  }

  async stopNotifications(options: ReadOptions): Promise<void> {
    const key =
      `notification|${options.deviceId}|${options.service}|${options.characteristic}`.toLowerCase();
    if (key in this.listeners) {
      this.listeners.get(key)?.remove();
      this.listeners.delete(key);
      this.abrevvaBle.setSupportedEvents({
        events: [...this.listeners.keys()],
      });
    }
    return await this.abrevvaBle.stopNotifications(options);
  }
}

export const AbrevvaBle = new BleClient();

export const AbrevvaNfc = NativeModules.AbrevvaNfc
  ? NativeModules.AbrevvaNfc
  : new Proxy(
      {},
      {
        get() {
          throw new Error('Linking Error AbrevvaNfc');
        },
      },
    );

export const AbrevvaCrypto = NativeModules.AbrevvaCrypto
  ? NativeModules.AbrevvaCrypto
  : new Proxy(
      {},
      {
        get() {
          throw new Error('Linking Error AbrevvaNfc');
        },
      },
    );
