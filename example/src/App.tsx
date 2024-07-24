/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import RNFS from 'react-native-fs';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';

import { AbrevvaCrypto, AbrevvaNfc } from 'react-native-example-app';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useState } from 'react';
import { BleScreen } from './BleScreenComponents';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="home" component={HomeScreen} />
        <Stack.Screen name="nfc" component={NfcScreen} />
        <Stack.Screen name="crypto" component={CryptoScreen} />
        <Stack.Screen name="ble" component={BleScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('nfc')}
      >
        <Text style={styles.buttonText}>NFC Test</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('crypto')}
      >
        <Text style={styles.buttonText}>Crpto Test</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ble')}
      >
        <Text style={styles.buttonText}>Ble Test</Text>
      </TouchableOpacity>
    </View>
  );
};

const NfcScreen = ({ navigation }) => {
  useEffect(() => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      RNFS.exists(
        `${RNFS.DocumentDirectoryPath}/client-${Platform.OS}.p12`
      ).then((exists) => {
        if (!exists) {
          RNFS.copyFile(
            RNFS.MainBundlePath + `/client-${Platform.OS}.p12`,
            `${RNFS.DocumentDirectoryPath}/client-${Platform.OS}.p12`
          );
        }
      });
    }
  }, []);
  return (
    <View style={styles.container}>
      <Button text="connect" onPressFunction={() => AbrevvaNfc.connect()} />
      <Button text="read" onPressFunction={() => AbrevvaNfc.read()} />
      <Button
        text="disconnect"
        onPressFunction={() => AbrevvaNfc.disconnect()}
      />
    </View>
  );
};

const CryptoScreen = ({ navigation }) => {
  const [result, setResult] = useState('');
  return (
    <View style={styles.cryptoContainer}>
      <View style={styles.cryptoView}>
        <Text>{result}</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        <Button
          text="generateKeyPair"
          onPressFunction={() => {
            AbrevvaCrypto.generateKeyPair().then((ret) => {
              setResult(
                `Privat Key:\n${ret.privateKey}\n\nPublic Key\n:${ret.publicKey}`
              );
            });
          }}
        />
        <Button
          text="random"
          onPressFunction={() => {
            AbrevvaCrypto.random({ numBytes: 4 }).then((ret) => {
              setResult(`random:\n${ret.value}\n\n`);
            });
          }}
        />
      </ScrollView>
    </View>
  );
};

const Button = ({ text, onPressFunction }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPressFunction}>
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  );
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#3498db',
    marginVertical: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {},
  cryptoView: {
    marginTop: 20,
    height: 150,
  },
  cryptoContainer: {
    alignItems: 'center',
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
});

export default App;
