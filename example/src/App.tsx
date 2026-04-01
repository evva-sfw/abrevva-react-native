import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  AbrevvaCodingStation,
  AbrevvaCrypto,
} from '@evva/abrevva-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BleScreen } from './BleScreenComponents';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="home" component={HomeScreen} />
        <Stack.Screen name="crypto" component={CryptoScreen} />
        <Stack.Screen name="ble" component={BleScreen} />
        <Stack.Screen name="CodingStation" component={CodingStationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const HomeScreen = ({ navigation }) => {
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('crypto')}
        >
          <Text style={styles.buttonText}>Crypto Test</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('ble')}
        >
          <Text style={styles.buttonText}>Ble Test</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('CodingStation')}
        >
          <Text style={styles.buttonText}>Coding Station Test</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaProvider>
  );
};

const CryptoScreen = () => {
  const [result, setResult] = useState('');
  return (
    <View style={styles.cryptoContainer}>
      <View style={styles.cryptoView}>
        <Text style={styles.cryptoText}>{result}</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        <Button
          text="generateKeyPair"
          onPressFunction={() => {
            const ret = AbrevvaCrypto.generateKeyPair();
            setResult(
              `Private Key:\n${ret.privateKey}\n\nPublic Key:\n${ret.publicKey}`
            );
          }}
        />
        <Button
          text="random"
          onPressFunction={() => {
            const ret = AbrevvaCrypto.random(4);
            setResult(`Random:\n${ret}\n\n`);
          }}
        />
      </ScrollView>
    </View>
  );
};

const CodingStationScreen = () => {
  const url = '';
  const clientId = '';
  const username = '';
  const password = '';

  const [result, setResult] = useState('');
  return (
    <View style={styles.cryptoContainer}>
      <View style={styles.cryptoView}>
        <Text style={styles.cryptoText}>{result}</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        <Button
          text="register"
          onPressFunction={async () => {
            try {
              await AbrevvaCodingStation.register(
                url,
                clientId,
                username,
                password
              );
              setResult(`register:\nsuccess\n\n`);
            } catch (e) {
              setResult(`register:\n${e}\n\n`);
            }
          }}
        />
        <Button
          text="connect"
          onPressFunction={async () => {
            try {
              await AbrevvaCodingStation.connect();
              setResult(`connect:\nsuccess\n\n`);
            } catch (e) {
              setResult(`connect:\n${e}\n\n`);
            }
          }}
        />
        <Button
          text="write"
          onPressFunction={async () => {
            try {
              await AbrevvaCodingStation.write();
              setResult(`write:\nsuccess\n\n`);
            } catch (e) {
              setResult(`write:\n${e}\n\n`);
            }
          }}
        />
        <Button
          text="disconnect"
          onPressFunction={() => {
            AbrevvaCodingStation.disconnect();
            setResult(`disconnect:\nsuccess\n\n`);
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
  cryptoText: {
    color: 'black',
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
