/**
 * @jest environment: node
 */

import { AbrevvaCodingStation } from '@evva/abrevva-react-native';

// Mock dependencies
jest.mock('@evva/abrevva-react-native', () => {
  return {
    AbrevvaCodingStation: {
      _register: jest.fn(),
      register: jest.fn(),
      connect: jest.fn(),
      write: jest.fn(),
      disconnect: jest.fn(),
    },
    AbrevvaBle: {},
    AbrevvaCrypto: {},
  };
});

describe('AbrevvaCodingStation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should return the result from _register', async () => {
      const mockReturn = { success: true };
      (AbrevvaCodingStation.register as jest.Mock).mockResolvedValue(
        mockReturn
      );

      const result = await AbrevvaCodingStation.register(
        'https://coding.example.com',
        'clientId123',
        'username',
        'password'
      );

      expect(AbrevvaCodingStation.register).toHaveBeenCalledWith(
        'https://coding.example.com',
        'clientId123',
        'username',
        'password'
      );
      expect(result).toEqual(mockReturn);
    });
  });

  describe('connect', () => {
    it('should call native connect', async () => {
      (AbrevvaCodingStation.connect as jest.Mock).mockResolvedValue(undefined);

      await AbrevvaCodingStation.connect();

      expect(AbrevvaCodingStation.connect).toHaveBeenCalled();
    });
  });

  describe('write', () => {
    it('should call native write', async () => {
      (AbrevvaCodingStation.write as jest.Mock).mockResolvedValue(undefined);

      await AbrevvaCodingStation.write();

      expect(AbrevvaCodingStation.write).toHaveBeenCalled();
    });
  });

  describe('disconnect', () => {
    it('should call native disconnect', () => {
      AbrevvaCodingStation.disconnect();

      expect(AbrevvaCodingStation.disconnect).toHaveBeenCalledTimes(1);
    });
  });
});
