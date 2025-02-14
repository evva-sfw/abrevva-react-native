import { AbrevvaBle, type BleDevice, type BooleanResult } from '@evva/abrevva-react-native';
import { useEffect } from 'react';
import { useState } from 'react';
import {
  Dimensions,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

global.Buffer = require('buffer').Buffer;

export const BleScreen = () => {
  const [statusCode, setStatusCode] = useState('None');
  const [startScanNotification, setStartScanNotification] = useState('Pull down to start scanning');

  return (
    <>
      <Text style={bleStyles.scanNotification}>{startScanNotification}</Text>
      <ScanResults
        props={{ setStatus: setStatusCode, setScanNotification: setStartScanNotification }}
      />
      <SafeAreaView style={bleStyles.status}>
        <Text>Last received status code '{statusCode}'</Text>
      </SafeAreaView>
    </>
  );
};

const ScanResults = ({ props }) => {
  const [deviceList, setDeviceList] = useState<BleDevice[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const setStatus = props.setStatus;
  const setScanNotification = props.setScanNotification;

  const scanRequestCallback = (data: BleDevice) => {
    setDeviceList((prevDeviceList) => {
      return [data, ...prevDeviceList];
    });
  };

  const onRefresh = async () => {
    setStatus('None');
    setScanNotification('Scanning ...');
    setRefreshing(true);
    setDeviceList([]);

    const timeout: NodeJS.Timeout = setTimeout(() => {
      setRefreshing(false);
      setScanNotification('');
    }, 3_000);

    await AbrevvaBle.stopScan();

    try {
      await AbrevvaBle.startScan(
        scanRequestCallback,
        (result: BooleanResult) => {
          console.log(`onScanStart: ${result.value}`);
        },
        (result: BooleanResult) => {
          console.log(`onScanStop: ${result.value}`);
        },
        undefined,
        false,
        10_000,
      );
    } catch (err) {
      console.log(err);
      clearTimeout(timeout);
    }
  };

  useEffect(() => {
    void AbrevvaBle.initialize(true);
  }, []);

  return (
    <FlatList
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      style={bleStyles.row}
      data={deviceList}
      renderItem={(listRenderItem) => (
        <SafeAreaView style={bleStyles.BleScanResult}>
          <TouchableOpacity
            onPress={async () => {
              const result = await AbrevvaBle.disengage(
                listRenderItem.item.deviceId,
                'mobileId',
                'mobileDeviceKey',
                'mobileGroupId',
                'mobileAccessData',
                true,
              );
              console.log(`Disengage Status: ${result}`);
            }}
          >
            <Text>{listRenderItem.item.advertisementData?.manufacturerData?.identifier}</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}
    />
  );
};

const bleStyles = StyleSheet.create({
  scanNotification: {
    margin: 'auto',
    color: 'black',
    marginVertical: 10,
  },
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
