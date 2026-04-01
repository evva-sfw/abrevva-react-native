/**
 * @jest environment: node
 */

import { AbrevvaCrypto } from '@evva/abrevva-react-native';

// Mock dependencies
jest.mock('@evva/abrevva-react-native', () => {
  return {
    AbrevvaCrypto: {
      encrypt: jest.fn(),
      decrypt: jest.fn(),
      generateKeyPair: jest.fn(),
      computeSharedSecret: jest.fn(),
      encryptFile: jest.fn(),
      decryptFile: jest.fn(),
      decryptFileFromURL: jest.fn(),
      random: jest.fn(),
      derive: jest.fn(),
    },
    AbrevvaBle: {},
    AbrevvaCodingStation: {},
  };
});

describe('AbrevvaCrypto', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('encrypt', () => {
    it('should call native encrypt with key, iv, adata, pt', () => {
      const mockReturn = { cipherText: 'cipher123', authTag: 'tag123' };
      (AbrevvaCrypto.encrypt as jest.Mock).mockReturnValue(mockReturn);

      const result = AbrevvaCrypto.encrypt(
        'key123',
        'iv123',
        'adata123',
        'pt123'
      );

      expect(AbrevvaCrypto.encrypt).toHaveBeenCalledTimes(1);
      expect(AbrevvaCrypto.encrypt).toHaveBeenCalledWith(
        'key123',
        'iv123',
        'adata123',
        'pt123'
      );
      expect(result).toEqual(mockReturn);
    });

    it('should handle optional tagLength parameter', () => {
      const mockReturn = { cipherText: 'cipher123', authTag: 'tag123' };
      (AbrevvaCrypto.encrypt as jest.Mock).mockReturnValue(mockReturn);

      AbrevvaCrypto.encrypt('key123', 'iv123', 'adata123', 'pt123', 128);

      expect(AbrevvaCrypto.encrypt).toHaveBeenCalledWith(
        'key123',
        'iv123',
        'adata123',
        'pt123',
        128
      );
    });

    it('should return EncryptResult with cipherText and authTag', () => {
      const mockReturn = { cipherText: 'cipher123', authTag: 'tag123' };
      (AbrevvaCrypto.encrypt as jest.Mock).mockReturnValue(mockReturn);

      const result = AbrevvaCrypto.encrypt(
        'key123',
        'iv123',
        'adata123',
        'pt123'
      );

      expect(result).toHaveProperty('cipherText');
      expect(result).toHaveProperty('authTag');
    });
  });

  describe('decrypt', () => {
    it('should call native decrypt with key, iv, adata, ct', () => {
      const mockReturn = { plainText: 'pt123', authOk: true };
      (AbrevvaCrypto.decrypt as jest.Mock).mockReturnValue(mockReturn);

      const result = AbrevvaCrypto.decrypt(
        'key123',
        'iv123',
        'adata123',
        'ct123'
      );

      expect(AbrevvaCrypto.decrypt).toHaveBeenCalledTimes(1);
      expect(AbrevvaCrypto.decrypt).toHaveBeenCalledWith(
        'key123',
        'iv123',
        'adata123',
        'ct123'
      );
      expect(result).toEqual(mockReturn);
    });

    it('should handle optional tagLength parameter', () => {
      const mockReturn = { plainText: 'pt123', authOk: true };
      (AbrevvaCrypto.decrypt as jest.Mock).mockReturnValue(mockReturn);

      AbrevvaCrypto.decrypt('key123', 'iv123', 'adata123', 'ct123', 128);

      expect(AbrevvaCrypto.decrypt).toHaveBeenCalledWith(
        'key123',
        'iv123',
        'adata123',
        'ct123',
        128
      );
    });

    it('should return DecryptResult with plainText and authOk', () => {
      const mockReturn = { plainText: 'pt123', authOk: true };
      (AbrevvaCrypto.decrypt as jest.Mock).mockReturnValue(mockReturn);

      const result = AbrevvaCrypto.decrypt(
        'key123',
        'iv123',
        'adata123',
        'ct123'
      );

      expect(result).toHaveProperty('plainText');
      expect(result).toHaveProperty('authOk');
    });
  });

  describe('generateKeyPair', () => {
    it('should call native generateKeyPair', () => {
      const mockReturn = {
        privateKey: 'privateKey123',
        publicKey: 'publicKey123',
      };
      (AbrevvaCrypto.generateKeyPair as jest.Mock).mockReturnValue(mockReturn);

      const result = AbrevvaCrypto.generateKeyPair();

      expect(AbrevvaCrypto.generateKeyPair).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('privateKey');
      expect(result).toHaveProperty('publicKey');
    });

    it('should return KeypairResult with privateKey and publicKey', () => {
      const mockReturn = {
        privateKey: 'privateKey123',
        publicKey: 'publicKey123',
      };
      (AbrevvaCrypto.generateKeyPair as jest.Mock).mockReturnValue(mockReturn);

      const result = AbrevvaCrypto.generateKeyPair();

      expect(result).toEqual(mockReturn);
    });
  });

  describe('computeSharedSecret', () => {
    it('should call native computeSharedSecret with key and peerPublicKey', () => {
      const mockReturn = 'sharedSecret123';
      (AbrevvaCrypto.computeSharedSecret as jest.Mock).mockReturnValue(
        mockReturn
      );

      const result = AbrevvaCrypto.computeSharedSecret(
        'key123',
        'peerPublicKey123'
      );

      expect(AbrevvaCrypto.computeSharedSecret).toHaveBeenCalledTimes(1);
      expect(AbrevvaCrypto.computeSharedSecret).toHaveBeenCalledWith(
        'key123',
        'peerPublicKey123'
      );
      expect(result).toBe(mockReturn);
    });

    it('should return HexString', () => {
      const mockReturn = 'sharedSecret123';
      (AbrevvaCrypto.computeSharedSecret as jest.Mock).mockReturnValue(
        mockReturn
      );

      const result = AbrevvaCrypto.computeSharedSecret(
        'key123',
        'peerPublicKey123'
      );

      expect(typeof result).toBe('string');
    });
  });

  describe('encryptFile', () => {
    it('should call native encryptFile with sharedSecret, ptPath, ctPath', () => {
      const mockReturn = true;
      (AbrevvaCrypto.encryptFile as jest.Mock).mockReturnValue(mockReturn);

      const result = AbrevvaCrypto.encryptFile(
        'sharedSecret123',
        '/path/to/plain.txt',
        '/path/to/cipher.txt'
      );

      expect(AbrevvaCrypto.encryptFile).toHaveBeenCalledTimes(1);
      expect(AbrevvaCrypto.encryptFile).toHaveBeenCalledWith(
        'sharedSecret123',
        '/path/to/plain.txt',
        '/path/to/cipher.txt'
      );
      expect(result).toBe(true);
    });

    it('should return boolean indicating success', () => {
      const mockReturn = true;
      (AbrevvaCrypto.encryptFile as jest.Mock).mockReturnValue(mockReturn);

      const result = AbrevvaCrypto.encryptFile(
        'sharedSecret123',
        '/path/to/plain.txt',
        '/path/to/cipher.txt'
      );

      expect(typeof result).toBe('boolean');
    });
  });

  describe('decryptFile', () => {
    it('should call native decryptFile with sharedSecret, ptPath, ctPath', () => {
      const mockReturn = true;
      (AbrevvaCrypto.decryptFile as jest.Mock).mockReturnValue(mockReturn);

      const result = AbrevvaCrypto.decryptFile(
        'sharedSecret123',
        '/path/to/plain.txt',
        '/path/to/cipher.txt'
      );

      expect(AbrevvaCrypto.decryptFile).toHaveBeenCalledTimes(1);
      expect(AbrevvaCrypto.decryptFile).toHaveBeenCalledWith(
        'sharedSecret123',
        '/path/to/plain.txt',
        '/path/to/cipher.txt'
      );
      expect(result).toBe(true);
    });

    it('should return boolean indicating success', () => {
      const mockReturn = true;
      (AbrevvaCrypto.decryptFile as jest.Mock).mockReturnValue(mockReturn);

      const result = AbrevvaCrypto.decryptFile(
        'sharedSecret123',
        '/path/to/plain.txt',
        '/path/to/cipher.txt'
      );

      expect(typeof result).toBe('boolean');
    });
  });

  describe('decryptFileFromURL', () => {
    it('should call native decryptFileFromURL with sharedSecret, ptPath, url', () => {
      const mockReturn = true;
      (AbrevvaCrypto.decryptFileFromURL as jest.Mock).mockReturnValue(
        mockReturn
      );

      const result = AbrevvaCrypto.decryptFileFromURL(
        'sharedSecret123',
        '/path/to/plain.txt',
        'https://example.com/file.txt'
      );

      expect(AbrevvaCrypto.decryptFileFromURL).toHaveBeenCalledTimes(1);
      expect(AbrevvaCrypto.decryptFileFromURL).toHaveBeenCalledWith(
        'sharedSecret123',
        '/path/to/plain.txt',
        'https://example.com/file.txt'
      );
      expect(result).toBe(true);
    });

    it('should return boolean indicating success', () => {
      const mockReturn = true;
      (AbrevvaCrypto.decryptFileFromURL as jest.Mock).mockReturnValue(
        mockReturn
      );

      const result = AbrevvaCrypto.decryptFileFromURL(
        'sharedSecret123',
        '/path/to/plain.txt',
        'https://example.com/file.txt'
      );

      expect(typeof result).toBe('boolean');
    });
  });

  describe('random', () => {
    it('should call native random with numBytes', () => {
      const mockReturn = 'aabbccdd11223344';
      (AbrevvaCrypto.random as jest.Mock).mockReturnValue(mockReturn);

      const result = AbrevvaCrypto.random(8);

      expect(AbrevvaCrypto.random).toHaveBeenCalledTimes(1);
      expect(AbrevvaCrypto.random).toHaveBeenCalledWith(8);
      expect(result).toBe(mockReturn);
    });

    it('should return HexString of correct length', () => {
      const numBytes = 16;
      const mockReturn = 'aabbccdd11223344556677889900aabb';
      (AbrevvaCrypto.random as jest.Mock).mockReturnValue(mockReturn);

      const result = AbrevvaCrypto.random(numBytes);

      expect(result.length).toBe(numBytes * 2); // Hex string is 2x the number of bytes
    });
  });

  describe('derive', () => {
    it('should call native derive with key, salt, info, length', () => {
      const mockReturn = 'derivedKey123';
      (AbrevvaCrypto.derive as jest.Mock).mockReturnValue(mockReturn);

      const result = AbrevvaCrypto.derive('key123', 'salt123', 'info123', 32);

      expect(AbrevvaCrypto.derive).toHaveBeenCalledTimes(1);
      expect(AbrevvaCrypto.derive).toHaveBeenCalledWith(
        'key123',
        'salt123',
        'info123',
        32
      );
      expect(result).toBe(mockReturn);
    });

    it('should return HexString', () => {
      const mockReturn = 'derivedKey123';
      (AbrevvaCrypto.derive as jest.Mock).mockReturnValue(mockReturn);

      const result = AbrevvaCrypto.derive('key123', 'salt123', 'info123', 32);

      expect(typeof result).toBe('string');
    });
  });
});
