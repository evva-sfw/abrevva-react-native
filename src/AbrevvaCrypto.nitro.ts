import type { HybridObject } from 'react-native-nitro-modules';
import type {
  Base64String,
  DecryptResult,
  EncryptResult,
  HexString,
  KeypairResult,
} from './interfaces';

export interface AbrevvaCryptoImpl extends HybridObject<{
  ios: 'swift';
  android: 'kotlin';
}> {
  encrypt(
    key: string,
    iv: string,
    adata: string,
    pt: string,
    tagLength?: number
  ): EncryptResult;
  decrypt(
    key: string,
    iv: string,
    adata: string,
    ct: string,
    tagLength?: number
  ): DecryptResult;
  generateKeyPair(): KeypairResult;
  computeSharedSecret(key: string, peerPublicKey: string): HexString;
  encryptFile(sharedSecret: string, ptPath: string, ctPath: string): boolean;
  decryptFile(sharedSecret: string, ptPath: string, ctPath: string): boolean;
  decryptFileFromURL(
    sharedSecret: string,
    ptPath: string,
    url: string
  ): boolean;
  random(numBytes: number): HexString;
  derive(key: string, salt: string, info: string, length: number): HexString;
  computeED25519PublicKey(privateKey: Base64String): Base64String;
  sign(privateKey: Base64String, data: string): Base64String;
  verify(
    publicKey: Base64String,
    data: string,
    signature: Base64String
  ): boolean;
}
