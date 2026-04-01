/**
 * Jest setup file
 * Mocks must be set up here to ensure they're loaded before any module imports
 */

// Mock react-native first
jest.mock('react-native', () => {
  return {
    Platform: {
      OS: 'android',
      select: jest.fn(),
    },
    PermissionsAndroid: {
      requestMultiple: jest.fn(),
      PERMISSIONS: {
        BLUETOOTH_SCAN: 'android.permission.BLUETOOTH_SCAN',
        BLUETOOTH_CONNECT: 'android.permission.BLUETOOTH_CONNECT',
        ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
      },
    },
  };
});

// Mock react-native-nitro-modules - return empty object first
jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {
    createHybridObject: jest.fn(),
  },
}));

// Configure createHybridObject mock to return appropriate mocks
const mockCreateHybridObject = jest.requireMock('react-native-nitro-modules')
  .NitroModules.createHybridObject as jest.Mock;

// Create mock implementations for all hybrid objects
export const mockAbrevvaBle = {
  initialize: jest.fn(),
  isEnabled: jest.fn(),
  isLocationEnabled: jest.fn(),
  startEnabledNotifications: jest.fn(),
  stopEnabledNotifications: jest.fn(),
  openLocationSettings: jest.fn(),
  openBluetoothSettings: jest.fn(),
  openAppSettings: jest.fn(),
  startScan: jest.fn(),
  stopScan: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  read: jest.fn(),
  write: jest.fn(),
  signalize: jest.fn(),
  disengage: jest.fn(),
  disengageWithXvnResponse: jest.fn(),
  startNotifications: jest.fn(),
  stopNotifications: jest.fn(),
};

export const mockAbrevvaCrypto = {
  encrypt: jest.fn(),
  decrypt: jest.fn(),
  generateKeyPair: jest.fn(),
  computeSharedSecret: jest.fn(),
  encryptFile: jest.fn(),
  decryptFile: jest.fn(),
  decryptFileFromURL: jest.fn(),
  random: jest.fn(),
  derive: jest.fn(),
};

export const mockAbrevvaCodingStation = {
  _register: jest.fn(),
  connect: jest.fn(),
  write: jest.fn(),
  disconnect: jest.fn(),
};

mockCreateHybridObject.mockImplementation((name: string) => {
  if (name === 'AbrevvaBleImpl') {
    return mockAbrevvaBle;
  }
  if (name === 'AbrevvaCryptoImpl') {
    return mockAbrevvaCrypto;
  }
  if (name === 'AbrevvaCodingStationImpl') {
    return mockAbrevvaCodingStation;
  }
  return {};
});
