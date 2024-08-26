import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

import {
  type AbrevvaBLEInterface,
  AbrevvaCrypto,
  AbrevvaNfc,
  createAbrevvaBleInstance,
} from './index';

describe('AbrevvaBleModule', () => {
  let AbrevvaBleMock = NativeModules.AbrevvaBle;
  let AbrevvaBle: AbrevvaBLEInterface;
  let mockEmitter: NativeEventEmitter;

  beforeEach(() => {
    jest.useFakeTimers();

    Platform.OS = 'ios';
    // @ts-ignore
    Platform.select.mockImplementation(() => {
      return mockEmitter;
    });

    mockEmitter = new NativeEventEmitter();
    AbrevvaBle = createAbrevvaBleInstance();
    jest.clearAllMocks();
  });

  it('constructor should throw if Platform is not Supported', () => {
    // @ts-ignore
    Platform.select.mockImplementation(() => {
      return undefined;
    });
    expect(createAbrevvaBleInstance).toThrow();
  });
  it('should run initialize()', async () => {
    await AbrevvaBle.initialize();
    expect(AbrevvaBleMock.initialize).toHaveBeenCalledTimes(1);
  });
  it('should run isEnabled()', async () => {
    await AbrevvaBle.isEnabled();
    expect(AbrevvaBleMock.isEnabled).toHaveBeenCalledTimes(1);
  });
  it('should run isLocationEnabled()', async () => {
    await AbrevvaBle.isLocationEnabled();
    expect(AbrevvaBleMock.isLocationEnabled).toHaveBeenCalledTimes(1);
  });

  describe('startEnableNotification', () => {
    it('should add the correct eventlistener and call startEnableNotification', async () => {
      const spy = jest.spyOn(mockEmitter, 'addListener');
      const spyNativeModule = jest.spyOn(AbrevvaBle, 'startEnabledNotifications');
      const mockFn = jest.fn();
      await AbrevvaBle.startEnabledNotifications(mockFn);

      expect(spy).toHaveBeenCalledWith('onEnabledChanged', expect.any(Function));
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spyNativeModule).toHaveBeenCalledTimes(1);
    });
  });

  it('should run stopEnabledNotifications()', async () => {
    await AbrevvaBle.stopEnabledNotifications();
    expect(AbrevvaBleMock.stopEnabledNotifications).toHaveBeenCalledTimes(1);
  });
  it('should run openLocationSettings()', async () => {
    await AbrevvaBle.openLocationSettings();
    expect(AbrevvaBleMock.openLocationSettings).toHaveBeenCalledTimes(1);
  });
  it('should run openBluetoothSettings()', async () => {
    await AbrevvaBle.openBluetoothSettings();
    expect(AbrevvaBleMock.openBluetoothSettings).toHaveBeenCalledTimes(1);
  });
  it('should run openAppSettings()', async () => {
    await AbrevvaBle.openAppSettings();
    expect(AbrevvaBleMock.openAppSettings).toHaveBeenCalledTimes(1);
  });

  describe('requestLEScan()', () => {
    it('should reject if a scan is already in progress', async () => {
      void AbrevvaBle.requestLEScan(
        () => {},
        () => {},
        () => {},
      );
      await expect(AbrevvaBle.requestLEScan).rejects.toThrow();
    });
    it('should add the expected eventlisteners and discard them after the timeout', async () => {
      const addListenerSpy = jest.spyOn(mockEmitter, 'addListener');

      const emitterSubscriptionMock = { remove: jest.fn() };
      // @ts-ignore
      mockEmitter.addListener.mockImplementation(() => {
        return emitterSubscriptionMock;
      });

      void AbrevvaBle.requestLEScan(jest.fn(), jest.fn(), jest.fn());

      jest.advanceTimersByTime(20000);

      expect(addListenerSpy).toHaveBeenCalledWith('onScanResult', expect.any(Function));
      expect(addListenerSpy).toHaveBeenCalledWith('onConnect', expect.any(Function));
      expect(addListenerSpy).toHaveBeenCalledWith('onDisconnect', expect.any(Function));
      expect(addListenerSpy).toHaveBeenCalledTimes(3);
      expect(AbrevvaBleMock.requestLEScan).toHaveBeenCalledTimes(1);
      expect(emitterSubscriptionMock.remove).toHaveBeenCalledTimes(3);
    });
  });
  it('should run stopLEScan()', async () => {
    await AbrevvaBle.stopLEScan();
    expect(AbrevvaBleMock.stopLEScan).toHaveBeenCalledTimes(1);
  });
  it('should run connect()', async () => {
    await AbrevvaBle.connect('deviceId');
    expect(AbrevvaBleMock.connect).toHaveBeenCalledTimes(1);
  });
  it('should run disconnect()', async () => {
    await AbrevvaBle.disconnect('deviceId');
    expect(AbrevvaBleMock.disconnect).toHaveBeenCalledTimes(1);
    expect(AbrevvaBleMock.setSupportedEvents).toHaveBeenCalledTimes(1);
  });
  it('should run read()', async () => {
    await AbrevvaBle.read('deviceId', 'service', 'characteristic');
    expect(AbrevvaBleMock.read).toHaveBeenCalledTimes(1);
  });
  it('should run write()', async () => {
    await AbrevvaBle.write('deviceId', 'service', 'characteristic', 'value');
    expect(AbrevvaBleMock.write).toHaveBeenCalledTimes(1);
  });
  it('should run signalize()', async () => {
    await AbrevvaBle.signalize('deviceId');
    expect(AbrevvaBleMock.signalize).toHaveBeenCalledTimes(1);
  });
  it('should run disengage()', async () => {
    await AbrevvaBle.disengage(
      'deviceId',
      'mobileId',
      'mobileDeviceKey',
      'mobileGroupId',
      'mobileAccessData',
      false,
    );
    expect(AbrevvaBleMock.disengage).toHaveBeenCalledTimes(1);
  });
  describe('startNotifications()', () => {});
  describe('stopNotifications()', () => {
    const deviceId = 'deviceId';
    const service = 'service';
    const characteristic = 'characteristic';

    let emitterSubscriptionMock: any;
    beforeEach(() => {
      emitterSubscriptionMock = { remove: jest.fn() };
      void jest.spyOn(mockEmitter, 'addListener').mockImplementation(() => {
        return emitterSubscriptionMock;
      });
    });
    it('should delete the Eventlistener if it was previously added', async () => {
      await AbrevvaBle.startNotifications(deviceId, service, characteristic, () => {});
      expect(emitterSubscriptionMock.remove).toHaveBeenCalledTimes(0);
      expect(AbrevvaBleMock.stopNotifications).toHaveBeenCalledTimes(0);
      expect(AbrevvaBleMock.startNotifications).toHaveBeenCalledTimes(1);
      await AbrevvaBle.stopNotifications(deviceId, service, characteristic);
      expect(emitterSubscriptionMock.remove).toHaveBeenCalledTimes(1);
      expect(AbrevvaBleMock.stopNotifications).toHaveBeenCalledTimes(1);
    });
    it("shouldn't remove any key if it wasn't previously added", async () => {
      await AbrevvaBle.stopNotifications(deviceId, service, characteristic);
      expect(emitterSubscriptionMock.remove).toHaveBeenCalledTimes(0);
      expect(AbrevvaBleMock.stopNotifications).toHaveBeenCalledTimes(1);
    });
  });
});

describe('AbrevvaNfcModule', () => {
  const AbrevvaNfcMock = NativeModules.AbrevvaNfc;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should run connect()', async () => {
    await AbrevvaNfc.connect();
    expect(AbrevvaNfcMock.connect).toHaveBeenCalledTimes(1);
  });
  it('should run disconnect()', async () => {
    await AbrevvaNfc.disconnect();
    expect(AbrevvaNfcMock.disconnect).toHaveBeenCalledTimes(1);
  });
  it('should run read()', async () => {
    await AbrevvaNfc.read();
    expect(AbrevvaNfcMock.read).toHaveBeenCalledTimes(1);
  });
});

describe('AbrevvaCryptoModule', () => {
  const AbrevvaCryptoMock = NativeModules.AbrevvaCrypto;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should run encrypt()', async () => {
    await AbrevvaCrypto.encrypt('', '', '', '');
    expect(AbrevvaCryptoMock.encrypt).toHaveBeenCalledTimes(1);
  });
  it('should run decrypt()', async () => {
    await AbrevvaCrypto.decrypt('', '', '', '');
    expect(AbrevvaCryptoMock.decrypt).toHaveBeenCalledTimes(1);
  });
  it('should run generateKeyPair()', async () => {
    await AbrevvaCrypto.generateKeyPair();
    expect(AbrevvaCryptoMock.generateKeyPair).toHaveBeenCalledTimes(1);
  });
  it('should run computeSharedSecret()', async () => {
    await AbrevvaCrypto.computeSharedSecret('', '');
    expect(AbrevvaCryptoMock.computeSharedSecret).toHaveBeenCalledTimes(1);
  });
  it('should run encryptFile()', async () => {
    await AbrevvaCrypto.encryptFile('', '', '');
    expect(AbrevvaCryptoMock.encryptFile).toHaveBeenCalledTimes(1);
  });
  it('should run decryptFile()', async () => {
    await AbrevvaCrypto.decryptFile('', '', '');
    expect(AbrevvaCryptoMock.decryptFile).toHaveBeenCalledTimes(1);
  });
  it('should run decryptFileFromURL()', async () => {
    await AbrevvaCrypto.decryptFileFromURL('', '', '');
    expect(AbrevvaCryptoMock.decryptFileFromURL).toHaveBeenCalledTimes(1);
  });
  it('should run random()', async () => {
    await AbrevvaCrypto.random(0);
    expect(AbrevvaCryptoMock.random).toHaveBeenCalledTimes(1);
  });
  it('should run derive()', async () => {
    await AbrevvaCrypto.derive('', '', '', 0);
    expect(AbrevvaCryptoMock.derive).toHaveBeenCalledTimes(1);
  });
});
