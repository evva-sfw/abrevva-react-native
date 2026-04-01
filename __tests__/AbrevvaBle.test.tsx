/**
 * @jest environment: node
 */

// Import mocks from setup file (loaded before test file)
import { mockAbrevvaBle } from '../jest.setup';

// Import Platform for tests
import { Platform } from 'react-native';

// Import the module under test (must be after mocks)
import { AbrevvaBle } from '@evva/abrevva-react-native';

describe('AbrevvaBle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'android';
  });

  describe('initialize', () => {
    it('should request Android permissions without location permission', async () => {
      Platform.OS = 'android' as any;

      await AbrevvaBle.initialize(false);

      const permissions = require('react-native').PermissionsAndroid;
      expect(permissions.requestMultiple).toHaveBeenCalledTimes(1);
      expect(permissions.requestMultiple).toHaveBeenCalledWith([
        'android.permission.BLUETOOTH_SCAN',
        'android.permission.BLUETOOTH_CONNECT',
      ]);
    });

    it('should request Android permissions when called on Android with location', async () => {
      Platform.OS = 'android' as any;

      await AbrevvaBle.initialize(true);

      const permissions = require('react-native').PermissionsAndroid;
      expect(permissions.requestMultiple).toHaveBeenCalledTimes(1);
      expect(permissions.requestMultiple).toHaveBeenCalledWith([
        'android.permission.BLUETOOTH_SCAN',
        'android.permission.BLUETOOTH_CONNECT',
        'android.permission.ACCESS_FINE_LOCATION',
      ]);
    });

    it('should request only BLUETOOTH_SCAN and BLUETOOTH_CONNECT without location permission', async () => {
      Platform.OS = 'android' as any;

      await AbrevvaBle.initialize(false);

      const permissions = require('react-native').PermissionsAndroid;
      expect(permissions.requestMultiple).toHaveBeenCalledTimes(1);
      expect(permissions.requestMultiple).toHaveBeenCalledWith([
        'android.permission.BLUETOOTH_SCAN',
        'android.permission.BLUETOOTH_CONNECT',
      ]);
    });

    it('should call native initialize on iOS', async () => {
      Platform.OS = 'ios' as any;

      await AbrevvaBle.initialize();

      expect(mockAbrevvaBle.initialize).toHaveBeenCalledTimes(1);
    });
  });

  describe('isEnabled', () => {
    it('should call native isEnabled', () => {
      AbrevvaBle.isEnabled();

      expect(mockAbrevvaBle.isEnabled).toHaveBeenCalledTimes(1);
    });
  });

  describe('isLocationEnabled', () => {
    it('should call native isLocationEnabled', () => {
      AbrevvaBle.isLocationEnabled();

      expect(mockAbrevvaBle.isLocationEnabled).toHaveBeenCalledTimes(1);
    });
  });

  describe('startEnabledNotifications', () => {
    it('should call native startEnabledNotifications with callback', () => {
      const callback = jest.fn();
      AbrevvaBle.startEnabledNotifications(callback);

      expect(mockAbrevvaBle.startEnabledNotifications).toHaveBeenCalledTimes(1);
      expect(mockAbrevvaBle.startEnabledNotifications).toHaveBeenCalledWith(
        callback
      );
    });
  });

  describe('stopEnabledNotifications', () => {
    it('should call native stopEnabledNotifications', () => {
      AbrevvaBle.stopEnabledNotifications();

      expect(mockAbrevvaBle.stopEnabledNotifications).toHaveBeenCalledTimes(1);
    });
  });

  describe('openLocationSettings', () => {
    it('should call native openLocationSettings', () => {
      AbrevvaBle.openLocationSettings();

      expect(mockAbrevvaBle.openLocationSettings).toHaveBeenCalledTimes(1);
    });
  });

  describe('openBluetoothSettings', () => {
    it('should call native openBluetoothSettings', () => {
      AbrevvaBle.openBluetoothSettings();

      expect(mockAbrevvaBle.openBluetoothSettings).toHaveBeenCalledTimes(1);
    });
  });

  describe('openAppSettings', () => {
    it('should call native openAppSettings', () => {
      AbrevvaBle.openAppSettings();

      expect(mockAbrevvaBle.openAppSettings).toHaveBeenCalledTimes(1);
    });
  });

  describe('startScan', () => {
    it('should call native startScan with all parameters', () => {
      const onScanResult = jest.fn();
      const onScanStart = jest.fn();
      const onScanStop = jest.fn();

      AbrevvaBle.startScan(
        onScanResult,
        onScanStart,
        onScanStop,
        'macFilter',
        true,
        10000
      );

      expect(mockAbrevvaBle.startScan).toHaveBeenCalledTimes(1);
      expect(mockAbrevvaBle.startScan).toHaveBeenCalledWith(
        onScanResult,
        onScanStart,
        onScanStop,
        'macFilter',
        true,
        10000
      );
    });

    it('should call native startScan with default parameters', () => {
      const onScanResult = jest.fn();
      const onScanStart = jest.fn();
      const onScanStop = jest.fn();

      AbrevvaBle.startScan(onScanResult, onScanStart, onScanStop);

      expect(mockAbrevvaBle.startScan).toHaveBeenCalledTimes(1);
      expect(mockAbrevvaBle.startScan).toHaveBeenCalledWith(
        onScanResult,
        onScanStart,
        onScanStop,
        undefined,
        undefined,
        undefined
      );
    });
  });

  describe('stopScan', () => {
    it('should call native stopScan', () => {
      AbrevvaBle.stopScan();

      expect(mockAbrevvaBle.stopScan).toHaveBeenCalledTimes(1);
    });
  });

  describe('connect', () => {
    it('should call native connect with deviceId and default timeout', async () => {
      await AbrevvaBle.connect('deviceId123');

      expect(mockAbrevvaBle.connect).toHaveBeenCalledTimes(1);
      expect(mockAbrevvaBle.connect).toHaveBeenCalledWith(
        'deviceId123',
        expect.any(Function),
        undefined
      );
    });

    it('should call native connect with deviceId and custom timeout', async () => {
      await AbrevvaBle.connect('deviceId123', undefined, 30000);

      expect(mockAbrevvaBle.connect).toHaveBeenCalledTimes(1);
      expect(mockAbrevvaBle.connect).toHaveBeenCalledWith(
        'deviceId123',
        expect.any(Function),
        30000
      );
    });

    it('should use default empty callback when onDisconnect is not provided', async () => {
      await AbrevvaBle.connect('deviceId123');

      const onDisconnectCallback = mockAbrevvaBle.connect.mock.calls[0][1];
      expect(typeof onDisconnectCallback).toBe('function');
    });
  });

  describe('disconnect', () => {
    it('should call native disconnect with provided deviceId', async () => {
      (mockAbrevvaBle.disconnect as jest.Mock).mockResolvedValue(true);

      const result = await AbrevvaBle.disconnect('deviceId123');

      expect(mockAbrevvaBle.disconnect).toHaveBeenCalledTimes(1);
      expect(mockAbrevvaBle.disconnect).toHaveBeenCalledWith('deviceId123');
      expect(result).toBe(true);
    });
  });

  describe('read', () => {
    it('should call native read with provided parameters', async () => {
      (mockAbrevvaBle.read as jest.Mock).mockResolvedValue('result');

      await AbrevvaBle.read('deviceId123', 'service123', 'characteristic123');

      expect(mockAbrevvaBle.read).toHaveBeenCalledTimes(1);
      expect(mockAbrevvaBle.read).toHaveBeenCalledWith(
        'deviceId123',
        'service123',
        'characteristic123',
        undefined
      );
    });

    it('should handle missing timeout parameter', async () => {
      (mockAbrevvaBle.read as jest.Mock).mockResolvedValue('result');

      await AbrevvaBle.read('deviceId123', 'service123', 'characteristic123');

      expect(mockAbrevvaBle.read).toHaveBeenCalledWith(
        'deviceId123',
        'service123',
        'characteristic123',
        undefined
      );
    });

    it('should call native read with timeout parameter', async () => {
      (mockAbrevvaBle.read as jest.Mock).mockResolvedValue('result');

      await AbrevvaBle.read(
        'deviceId123',
        'service123',
        'characteristic123',
        5000
      );

      expect(mockAbrevvaBle.read).toHaveBeenCalledWith(
        'deviceId123',
        'service123',
        'characteristic123',
        5000
      );
    });
  });

  describe('write', () => {
    it('should call native write with provided parameters', async () => {
      (mockAbrevvaBle.write as jest.Mock).mockResolvedValue(true);

      await AbrevvaBle.write(
        'deviceId123',
        'service123',
        'characteristic123',
        'value123'
      );

      expect(mockAbrevvaBle.write).toHaveBeenCalledTimes(1);
      expect(mockAbrevvaBle.write).toHaveBeenCalledWith(
        'deviceId123',
        'service123',
        'characteristic123',
        'value123',
        undefined
      );
    });

    it('should handle missing timeout parameter', async () => {
      (mockAbrevvaBle.write as jest.Mock).mockResolvedValue(true);

      await AbrevvaBle.write(
        'deviceId123',
        'service123',
        'characteristic123',
        'value123'
      );

      expect(mockAbrevvaBle.write).toHaveBeenCalledWith(
        'deviceId123',
        'service123',
        'characteristic123',
        'value123',
        undefined
      );
    });

    it('should call native write with timeout parameter', async () => {
      (mockAbrevvaBle.write as jest.Mock).mockResolvedValue(true);

      await AbrevvaBle.write(
        'deviceId123',
        'service123',
        'characteristic123',
        'value123',
        5000
      );

      expect(mockAbrevvaBle.write).toHaveBeenCalledWith(
        'deviceId123',
        'service123',
        'characteristic123',
        'value123',
        5000
      );
    });
  });

  describe('signalize', () => {
    it('should call native signalize with provided deviceId', async () => {
      (mockAbrevvaBle.signalize as jest.Mock).mockResolvedValue(true);

      await AbrevvaBle.signalize('deviceId123');

      expect(mockAbrevvaBle.signalize).toHaveBeenCalledTimes(1);
      expect(mockAbrevvaBle.signalize).toHaveBeenCalledWith('deviceId123');
    });
  });

  describe('disengage', () => {
    it('should call native disengage with all required parameters', async () => {
      (mockAbrevvaBle.disengage as jest.Mock).mockResolvedValue('AUTHORIZED');

      await AbrevvaBle.disengage(
        'deviceId123',
        'mobileId',
        'mobileDeviceKey',
        'mobileGroupId',
        'mobileAccessData',
        true
      );

      expect(mockAbrevvaBle.disengage).toHaveBeenCalledTimes(1);
      expect(mockAbrevvaBle.disengage).toHaveBeenCalledWith(
        'deviceId123',
        'mobileId',
        'mobileDeviceKey',
        'mobileGroupId',
        'mobileAccessData',
        true
      );
    });

    it('should pass isPermanentRelease flag correctly', async () => {
      (mockAbrevvaBle.disengage as jest.Mock).mockResolvedValue('AUTHORIZED');

      await AbrevvaBle.disengage(
        'deviceId123',
        'mobileId',
        'mobileDeviceKey',
        'mobileGroupId',
        'mobileAccessData',
        false
      );

      expect(mockAbrevvaBle.disengage).toHaveBeenCalledWith(
        'deviceId123',
        'mobileId',
        'mobileDeviceKey',
        'mobileGroupId',
        'mobileAccessData',
        false
      );
    });
  });

  describe('disengageWithXvnResponse', () => {
    it('should call native disengageWithXvnResponse with all required parameters', async () => {
      const mockResponse = {
        disengageStatusType: 'AUTHORIZED',
        xvnData: 'someData',
      };
      (mockAbrevvaBle.disengageWithXvnResponse as jest.Mock).mockResolvedValue(
        mockResponse
      );

      await AbrevvaBle.disengageWithXvnResponse(
        'deviceId123',
        'mobileId',
        'mobileDeviceKey',
        'mobileGroupId',
        'mobileAccessData',
        true
      );

      expect(mockAbrevvaBle.disengageWithXvnResponse).toHaveBeenCalledTimes(1);
      expect(mockAbrevvaBle.disengageWithXvnResponse).toHaveBeenCalledWith(
        'deviceId123',
        'mobileId',
        'mobileDeviceKey',
        'mobileGroupId',
        'mobileAccessData',
        true
      );
    });

    it('should return XvnResponse object with disengageStatusType', async () => {
      const mockResponse = {
        disengageStatusType: 'AUTHORIZED',
        xvnData: 'someData',
      };
      (mockAbrevvaBle.disengageWithXvnResponse as jest.Mock).mockResolvedValue(
        mockResponse
      );

      const result = await AbrevvaBle.disengageWithXvnResponse(
        'deviceId123',
        'mobileId',
        'mobileDeviceKey',
        'mobileGroupId',
        'mobileAccessData',
        true
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('startNotifications', () => {
    it('should call native startNotifications with provided parameters', async () => {
      const callback = jest.fn();
      (mockAbrevvaBle.startNotifications as jest.Mock).mockResolvedValue(true);

      await AbrevvaBle.startNotifications(
        'deviceId123',
        'service123',
        'characteristic123',
        1000,
        callback
      );

      expect(mockAbrevvaBle.startNotifications).toHaveBeenCalledTimes(1);
      expect(mockAbrevvaBle.startNotifications).toHaveBeenCalledWith(
        'deviceId123',
        'service123',
        'characteristic123',
        1000,
        callback
      );
    });
  });

  describe('stopNotifications', () => {
    it('should call native stopNotifications with provided parameters', async () => {
      (mockAbrevvaBle.stopNotifications as jest.Mock).mockResolvedValue(true);

      await AbrevvaBle.stopNotifications(
        'deviceId123',
        'service123',
        'characteristic123'
      );

      expect(mockAbrevvaBle.stopNotifications).toHaveBeenCalledTimes(1);
      expect(mockAbrevvaBle.stopNotifications).toHaveBeenCalledWith(
        'deviceId123',
        'service123',
        'characteristic123'
      );
    });
  });
});
