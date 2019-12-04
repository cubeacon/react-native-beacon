import React, {
  Component
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Button,
  Navigator,
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';
import BeaconManager from 'react-native-beacon';
import 'react-native-gesture-handler';

export default class RangingBeacons extends Component {
  static navigationOptions = ({
    navigation
  }) => {
    return {
      title: 'Ranging',
      headerRight: () => ( 
        <Button 
          onPress = {() => navigation.push('Monitoring')}
          title = "Monitoring" 
        />
      ),
    }
  };

  state = {
    beacons: undefined,
  };

  eventRanging: EmitterSubscription;
  mounted = false;

  componentDidMount() {
    this.mounted = true;
    BeaconManager.Listener.onBeaconServiceConnect(() => {
      console.log('BeaconServiceConnected');

      BeaconManager.Ranging.startRangingBeaconsInRegion({
        identifier: 'Cubeacon',
        uuid: 'CB10023F-A318-3394-4199-A8730C7C1AEC'
      });
    });
    BeaconManager.Listener.bluetoothDidUpdateState((state) => {
      console.log('BluetoothState: ' + state);

      if (state === 'powerOff') {
        BeaconManager.BluetoothService.openBluetoothSettings();
      }
    });
    BeaconManager.Listener.didChangeAuthorizationStatus((status) => {
      console.log('AuthorizationStatus: ' + status);

      if (status === 'authorizedAlways') {
        console.log('OK, start ranging beacons');
      }
    });
    this.eventRanging = BeaconManager.Listener.didRangeBeacons((region, beacons) => {
      console.log(region.identifier + ' : ' + beacons.length);

      if (this.mounted) {
        this.setState({
          beacons: beacons
        });
      }
    });

    BeaconManager.LocationService.checkIfEnabled((flag) => {
      console.log('LocationServices: ' + flag);
      if (!flag) {
        BeaconManager.LocationService.openLocationSettings();
      } else {
        BeaconManager.Authorization.requestAlwaysAuthorization();
      }
    });

    BeaconManager.initialize();
  }

  componentWillUnmount() {
    this.eventRanging.remove();
    this.mounted = false;
  }

  render() {
    if (!this.state.beacons) {
      return (
        <View style={{flex: 1, justifyContent: 'center'}}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.beacons}
          renderItem={({item}) => 
            <View>
              <Text style={styles.label}>{item.uuid}</Text>
              <View style={{flex: 1, flexDirection: 'row'}}>
                <Text style={styles.detail}>Major: {item.major}</Text>
                <Text style={styles.col3}>RSSI: {item.rssi}</Text>
                <Text style={Platform.OS == 'android' ? styles.col3 : undefined}>{Platform.OS == 'android' ? `Tx Power: ${item.txPower}` : ''}</Text>
              </View>
              <View style={{flex: 1, flexDirection: 'row'}}>
                <Text style={styles.detail}>Minor: {item.minor}</Text>
                <Text style={styles.col3}>Accuracy: {item.accuracy.toFixed(2)}m</Text>
                <Text style={Platform.OS == 'android' ? styles.col3 : undefined}>{Platform.OS == 'android' ? `${item.macAddress}` : ''}</Text>
              </View>
            </View>
          } 
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    paddingTop: 8,
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 8,
    fontSize: 16,
  },
  detail: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 8,
    color: '#333333',
    flex: 2,
  },
  col3: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 8,
    color: '#333333',
    flex: 3,
  },
});