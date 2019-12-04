import React, {
  Component
} from 'react';
import {
  EmitterSubscription,
  ActivityIndicator,
  Navigator,
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';
import BeaconManager from 'react-native-beacon';
import 'react-native-gesture-handler';

var region: Region = {
  identifier: 'Cubeacon',
  uuid: 'CB10023F-A318-3394-4199-A8730C7C1AEC',
  major: 123,
  minor: 456
};

export default class MonitoringBeacons extends Component {
  static navigationOptions = {
    title: 'Monitoring Beacons',
  };

  state = {
    region: region,
    state: 'unknown'
  };

  eventDetermine: EmitterSubscription;
  mounted = false;

  componentDidMount() {
    this.mounted = true;
    this.eventDetermine = BeaconManager.Listener.didDetermineStateForRegion((region, state) => {
      console.log(`STATE: ${state}, REGION: ${region.identifier}`);
      if (this.mounted) {
        this.setState({
          region: region,
          state: state
        });
      }
    });

    BeaconManager.Monitoring.startMonitoringForRegion(region);
  }

  componentWillUnmount() {
    this.eventDetermine.remove();
    this.mounted = false;
  }

  render() {
    return ( 
      <View style={styles.container}>
        <ActivityIndicator size = "large" />
        <Text style={styles.label}>Determining beacon state</Text>
        <Text style={styles.label}>------------------------------------</Text>
        <Text style={styles.label}>UUID: {this.state.region.uuid}</Text>
        <Text style={styles.label}>Major: {this.state.region.major}</Text> 
        <Text style={styles.label}>Minor: {this.state.region.minor}</Text>
        <Text style={styles.label}>------------------------------------</Text>
        <Text style={styles.label}>State: {this.state.state.toUpperCase()}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  label: {
    fontSize: 16,
    textAlign: "center"
  },
});