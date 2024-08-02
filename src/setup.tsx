jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => ({
  __esModule: true,
  default: class {
    addListener = () => jest.fn();
    removeListener = () => jest.fn();
    removeAllListeners = () => jest.fn();
  },
}));

jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn(() => null),
}));

jest.mock('react-native', () => {
  const originalModule = jest.requireActual('react-native');
  originalModule.NativeModules.AbrevvaNfc = {
    connect: jest.fn(),
    disconnect: jest.fn(),
    read: jest.fn(),
  };
  originalModule.NativeModules.AbrevvaBle = {
    setSupportedEvents: jest.fn(),
    initialize: jest.fn(),
    isEnabled: jest.fn(),
    isLocationEnabled: jest.fn(),
    startEnabledNotifications: jest.fn(),
    stopEnabledNotifications: jest.fn(),
    openLocationSettings: jest.fn(),
    openBluetoothSettings: jest.fn(),
    openAppSettings: jest.fn(),
    requestLEScan: jest.fn(),
    stopLEScan: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    read: jest.fn(),
    write: jest.fn(),
    signalize: jest.fn(),
    disengage: jest.fn(),
    stopNotifications: jest.fn(),
    addListener: jest.fn(),
    removeListeners: jest.fn(),
  };
  originalModule.NativeModules.AbrevvaCrypto = {
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
  return originalModule;
});
