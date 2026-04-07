import { AbrevvaBle } from '@evva/abrevva-react-native';
import { useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { BleDevice } from '../../src/interfaces';

export const BleScreen = () => {
  const [statusCode, setStatusCode] = useState('None');

  return (
    <>
      <ScanResults
        props={{
          setStatus: setStatusCode,
        }}
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

  const scanRequestCallback = (data: BleDevice) => {
    setDeviceList((prevDeviceList) => {
      return [data, ...prevDeviceList];
    });
  };

  const onRefresh = async () => {
    setStatus('None');
    setRefreshing(true);
    setDeviceList([]);

    const timeout = setTimeout(() => {
      setRefreshing(false);
    }, 3_000);

    AbrevvaBle.stopScan();

    try {
      AbrevvaBle.startScan(
        scanRequestCallback,
        (err?: Error) => {
          console.log(`onScanStart: ${err}`);
        },
        (err?: Error) => {
          console.log(`onScanStop: ${err}`);
        },
        undefined,
        false,
        10_000
      );
    } catch (err) {
      console.log(err);
      clearTimeout(timeout);
    }
  };

  useEffect(() => {
    AbrevvaBle.initialize(true);
  }, []);

  return (
    <FlatList
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      style={scanViewStyle.flatListContainer}
      data={deviceList}
      ListEmptyComponent={
        <View style={scanViewStyle.emptyComponentView}>
          <Text>{refreshing ? 'Refreshing...' : 'Pull down to refresh'}</Text>
        </View>
      }
      renderItem={(listRenderItem) => (
        <View style={scanViewStyle.safeAreaItem}>
          <TouchableOpacity
            onPress={async () => {
              const result = await AbrevvaBle.disengage(
                listRenderItem.item.deviceId,
                'mobileId',
                'mobileDeviceKey',
                'mobileGroupId',
                'mobileAccessData',
                true
              );
              console.log(`Disengage Status: ${result}`);
            }}
          >
            <Text style={scanViewStyle.deviceText}>
              {
                listRenderItem.item.advertisementData?.manufacturerData
                  ?.identifier
              }
            </Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
};

const bleStyles = StyleSheet.create({
  status: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const scanViewStyle = StyleSheet.create({
  flatListContainer: {
    flex: 1,
  },
  safeAreaItem: {
    height: 50,
    width: '100%',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#cccccc',
    borderWidth: 1,
  },
  deviceText: {
    color: 'black',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyComponentView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 70,
  },
});
