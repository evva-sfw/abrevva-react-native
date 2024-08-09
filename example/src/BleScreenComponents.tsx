import { hex } from '@scure/base';
import { Parser } from 'binary-parser-encoder';
import { useEffect } from 'react';
import { useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import {
  AbrevvaBle,
  AbrevvaCrypto,
  dataViewToHexString,
  dataViewToNumbers,
  hexStringToDataView,
  numbersToDataView,
  type ReadResult,
  type ScanResult,
} from 'react-native-example-app';

global.Buffer = require('buffer').Buffer;

const SCAN_TIMEOUT = 3000; // ms
const SERVICE = '9DB2CA57-D890-46D5-A142-59F3C1164B10';

enum CHARACTERISTICS {
  MOBILE_ACCESS_DATA = '9DB2CA5A-D890-46D5-A142-59F3C1164B10',
  ACCESS_STATUS = '9DB2CA5B-D890-46D5-A142-59F3C1164B10',
  CHALLENGE = '9DB2CA59-D890-46D5-A142-59F3C1164B10',
}

const xsMobileGroupId = 'a862cbdc89129de7b3c246b38f8db7c854b0d3b86cf35acd9379485729ee0277';
const xsMobileIdHash = '864a01c043eb4e9424ce2c220d9b17e11845273edb3ef5660395b88489259c06';
const xsMobileDerivedKey = '55ab87e38a2e7309448368de3316eb1757e0da5552c5aaa9049a9e5e8fe6239c';
const mediumDataFrame =
  'bc550d7342c49999c8cb8053aa6c9f9e812f8b8db42ac2a07c8c29369e464d87ad07de3d5defb36b91a48e28968ad61f2d7b86acc5ecea14354eb1b7320b52ee2648c3094c9ac806e32cc07844f44dd9c4cbca45373198f3530d73cedd87d887981a94ddaac5316e9df3981b866c155f342eb18b29aa0ff6346f10d8a275f55ee1c2dcd41dd2720d63ee77958476b5db88775d168c1828d9eb8a78ef26f25a275e16a27b441fb76e32eea88a770cd1d4258cec6757adf8c3bab39a9889c3e4a8facaae94eec35202cc9889236a2f55244ccdf9893835fb59e0ed6d115fb6178a16e24ca4a3eba508ece9f196e0221fe7e110035777f956cec538f0cd65a156e3ec02cddb4b10d9995897316ec79f342c1dc1192dd57373ab9779a6c4feba1ec1af0f5cbdaac3d8ece27b7dd406c51ec58e4e0cbf349548acf6e4e7657dbf4a2ca80ecb293cbf1d1f5f95e5ec5da602dd0210ed09e3d4823ae8ccd2bf93f5cf64303e6368f43bf5a65d03e57f7f319f232dc2882c444f4ca8a9d495a1d56d50f1c1c6039cbe36a76f6a59220df70e393b0a60501bdb963a526f5281e1cc08e32232b718b6014f1882eb16f0f7e295d9cfd17c51fc419c9fc73da1f7d45bad1e5b259444d9830d27125bfa982f52d3ddf7d7ce6e18a75bb37876725c4737a49e8094e24c8673c0467566b694815eada9ec00310abc304f7be386db63245f138dfe22d879013d377f41faa6c5d5df3a84534739e491817886ffc3505f3cf75719358d16e39f6414878b170f275d8128b088a17449827bb9198f50d2c707bb96d1074a228763af68f0987e59d681eb00053d6a8be2ad273939e69721db5861';

const advParseDone = new Parser();
const advParseSub = new Parser()
  .endianess('big')
  .uint8('subFirmwareVersionMajor')
  .uint8('subFirmwareVersionMinor')
  .uint16('subFirmwareVersionPatch');
const advParseSubWithBle = new Parser()
  .endianess('big')
  .uint8('subFirmwareVersionMajor')
  .uint8('subFirmwareVersionMinor')
  .uint16('subFirmwareVersionPatch')
  .buffer('mainIdentifier', { length: 6 });
const advManufacturerDataParser = new Parser()
  .endianess('big')
  .uint8('version')
  .uint8('componentType')
  .uint8('mainFirmwareVersionMajor')
  .uint8('mainFirmwareVersionMinor')
  .uint16('mainFirmwareVersionPatch')
  .bit6('componentHAL')
  .bit1('batteryStatus')
  .bit1('mainConstructionMode')
  .bit1('subConstructionMode')
  .bit1('isOnline')
  .bit1('officeModeEnabled')
  .bit1('twoFactorRequired')
  .bit4('reservedBits')
  .buffer('identifier', { length: 6 })
  .choice('', {
    tag: 'componentType',
    choices: {
      122: advParseSub,
      105: advParseSubWithBle,
      119: advParseSubWithBle,
    },
    defaultChoice: advParseDone,
  });

export const BleScreen = () => {
  const [statusCode, setStatusCode] = useState('none');

  return (
    <>
      <ScanResults setStatus={setStatusCode} />
      <SafeAreaView style={bleStyles.status}>
        <Text>Last received Statuscode '{statusCode}'</Text>
      </SafeAreaView>
    </>
  );
};

const ScanResults = ({ setStatus }) => {
  const [deviceList, setdeviceList] = useState<ScanResult[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const scanRequestCallback = (data: ScanResult) => {
    if (data.manufacturerData !== undefined && '2153' in data.manufacturerData) {
      const md = new Uint8Array(data.manufacturerData!['2153'].buffer);
      const mfData = advManufacturerDataParser.parse(md);
      if (mfData.identifier) {
        const deviceId = mfData.identifier.reduce((t: any, x: any): string => {
          return t + x.toString(16).padStart(2, '0').toLowerCase();
        }, '');
        if (deviceId === '5464de1ac537') {
          setdeviceList((prevDeviceList) => {
            return [data, ...prevDeviceList];
          });
        }
      }
    }
  };

  const onRefresh = () => {
    setStatus('none');
    setRefreshing(true);
    setdeviceList([]);

    const timeout: NodeJS.Timeout = setTimeout(() => {
      setRefreshing(false);
    }, SCAN_TIMEOUT);
    AbrevvaBle.stopLEScan()
      .then(() => {
        void AbrevvaBle.requestLEScan(
          scanRequestCallback,
          (address: string) => {
            console.log(`connected to Device =${address}`);
          },
          (address: string) => {
            console.log(`disconnected from Device =${address}`);
          },
        );
      })
      .catch((e) => {
        console.log(e);
        clearTimeout(timeout);
      });
  };

  useEffect(() => {
    AbrevvaBle.initialize(true).then(() => {
      void AbrevvaBle.requestLEScan(
        scanRequestCallback,
        (address: string) => {
          console.log(`connected to Device =${address}`);
        },
        (address: string) => {
          console.log(`disconnected from Device =${address}`);
        },
      );
    });
  }, []);

  return (
    <FlatList
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      style={bleStyles.row}
      data={deviceList}
      renderItem={(item) => (
        <SafeAreaView style={bleStyles.BleScanResult}>
          <TouchableOpacity
            onPress={() => {
              void mobileIdentificationMediumService(item.item, setStatus);
            }}
          >
            <Text>{item.item.device.deviceId}</Text>
            <Text>{item.item.device.name}</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}
    />
  );
};

let serviceIsActive = false;

async function mobileIdentificationMediumService(data: ScanResult, setStatus: any) {
  if (serviceIsActive) {
    return;
  }
  serviceIsActive = true;

  let newStatus: String | null = null;

  try {
    await AbrevvaBle.stopLEScan();
    await AbrevvaBle.connect({
      deviceId: data.device.deviceId,
      timeout: 10000,
    });

    await AbrevvaBle.startNotifications(
      data.device.deviceId,
      SERVICE,
      CHARACTERISTICS.ACCESS_STATUS,
      (event: ReadResult) => {
        newStatus = event.value!;
      },
    );

    const challenge = await AbrevvaBle.read({
      deviceId: data.device.deviceId,
      service: SERVICE,
      characteristic: CHARACTERISTICS.CHALLENGE,
      timeout: 10000,
    });

    const challengeDataView = hexStringToDataView(challenge.value!);
    const challengeBuffer = Buffer.from(dataViewToNumbers(challengeDataView));
    const challengeHex = challengeBuffer.toString('hex');

    const outerADataSchema = new Parser()
      .uint8('majorVersion')
      .uint8('minorVersion')
      .uint16be('patch')
      .bit1('officeModeFlag')
      .bit31('flagsRFU')
      .buffer('mobid', { length: 32 })
      .buffer('mobgid', { length: 32 });

    const outerAData = outerADataSchema.encode({
      majorVersion: 2,
      minorVersion: 0,
      patch: 0,
      officeModeFlag: 1,
      mobid: Buffer.from(xsMobileIdHash, 'hex'),
      mobgid: Buffer.from(xsMobileGroupId, 'hex'),
    });

    const outerADataHex = hex.encode(outerAData);

    const outerCT = await AbrevvaCrypto.encrypt(
      xsMobileDerivedKey,
      challengeHex,
      mediumDataFrame,
      outerADataHex,
      16,
    );

    const mdfSchema = new Parser()
      .buffer('outerIV', { length: 13 })
      .buffer('outerAData', { length: 72 })
      .buffer('cipherText', { length: 605 })
      .buffer('authTag', { length: 16 });

    const cipherTextBuffer = Buffer.from(outerCT.cipherText, 'hex');
    const authTagBuffer = Buffer.from(outerCT.authTag, 'hex');

    const mdf = mdfSchema.encode({
      outerIV: challengeBuffer,
      outerAData,
      cipherText: cipherTextBuffer,
      authTag: authTagBuffer,
    });

    void AbrevvaBle.write({
      deviceId: data.device.deviceId,
      service: SERVICE,
      characteristic: CHARACTERISTICS.MOBILE_ACCESS_DATA,
      value: dataViewToHexString(numbersToDataView(mdf)),
      timeout: 1000,
    });
  } catch (error: any) {
    void AbrevvaBle.disconnect({ deviceId: data.device.deviceId });
    serviceIsActive = false;
    Alert.alert('Error', error.code, [
      {
        text: 'Ok',
      },
    ]);
    return;
  }

  let interval: any;
  let timeout: any;
  await Promise.race([
    new Promise<void>((resolve) => {
      interval = setInterval(() => {
        if (newStatus !== null) {
          clearInterval(interval);
          clearInterval(timeout);
          setStatus(() => {
            return newStatus;
          });
          AbrevvaBle.disconnect({ deviceId: data.device.deviceId });
          serviceIsActive = false;
          resolve();
        }
      }, 100);
    }),
    new Promise<void>((resolve) => {
      timeout = setTimeout(() => {
        if (interval) {
          clearInterval(interval);
        }
        Alert.alert('Error', 'Timeout', [
          {
            text: 'Ok',
          },
        ]);
        AbrevvaBle.disconnect({ deviceId: data.device.deviceId });
        serviceIsActive = false;
        resolve();
      }, 20000);
    }),
  ]);
}

const bleStyles = StyleSheet.create({
  BleScanResult: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    height: 60,
    borderColor: 'thistle',
    borderWidth: 1,
    width: Dimensions.get('window').width,
  },
  row: {},
  status: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
