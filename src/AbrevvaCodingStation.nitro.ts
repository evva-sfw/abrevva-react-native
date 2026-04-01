import type { HybridObject } from 'react-native-nitro-modules';

export interface AbrevvaCodingStationImpl extends HybridObject<{
  ios: 'swift';
  android: 'kotlin';
}> {
  _register(
    url: string,
    clientId: string,
    username: string,
    password: string
  ): Promise<void>; // 'register' is a c++ Keyword and cannot be used as function name. see: https://en.cppreference.com/w/cpp/keyword/register.html
  connect(): Promise<void>;
  write(): Promise<void>;
  disconnect(): void;
}
