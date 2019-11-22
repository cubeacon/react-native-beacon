// @flow

import {
    NativeModules,
    NativeEventEmitter,
    EmitterSubscription // eslint-disable-line no-unused-vars
} from 'react-native';
const BeaconManager = NativeModules.CBBeacon;
const EventEmitter = new NativeEventEmitter(BeaconManager);

/* eslint-disable */
import {
    AuthorizationStatus,
    BluetoothState,
    Region,
    AuthorizationStatusCallback,
    DidRangeBeaconsCallback,
    DidEnterRegionCallback,
    DidExitRegionCallback,
    DidDetermineStateCallback,
} from './beacon.types';
/* eslint-enable */

const sampleMethod = function (str: string, num: number, callback: (result: String) => void) {
    BeaconManager.sampleMethod(str, num, callback);
}

const initialize = function () {
    BeaconManager.setup();
}

const dispose = function () {
    BeaconManager.close();
}

const openApplicationSettings = function () {
    BeaconManager.openApplicationSettings();
}

class BluetoothService {
    static checkBluetoothState(callback: (status: BluetoothState) => void) {
        BeaconManager.bluetoothEnabled(callback);
    }

    static openBluetoothSettings() {
        BeaconManager.openBluetoothSettings();
    }
}

class LocationService {
    static openLocationSettings() {
        BeaconManager.openLocationSettings();
    }

    static checkIfEnabled(callback: (enabled: boolean) => void) {
        BeaconManager.locationServicesEnabled(callback);
    }
}

class Authorization {
    static checkAuthorizationStatus(callback: (status: AuthorizationStatus) => void) {
        BeaconManager.authorizationStatus(callback);
    }

    static requestAlwaysAuthorization() {
        BeaconManager.requestAlwaysAuthorization();
    }
    
    static requestWhenInUseAuthorization() {
        BeaconManager.requestWhenInUseAuthorization();
    }
}

class Monitoring {
    static startMonitoringForRegion(region: Region) {
        BeaconManager.startMonitoringForRegion(region);
    }
    
    static startMonitoringForRegions(regions: Array < Region > ) {
        BeaconManager.startMonitoringForRegions(regions);
    }
    
    static stopMonitoringForRegion(region: Region) {
        BeaconManager.stopMonitoringForRegion(region);
    }
}

class Ranging {
    static startRangingBeaconsInRegion(region: Region) {
        BeaconManager.startRangingBeaconsInRegion(region);
    }
    
    static startRangingBeaconsInRegions(regions: Array < Region > ) {
        BeaconManager.startRangingBeaconsInRegions(regions);
    }
    
    static stopRangingBeaconsInRegion(region: Region) {
        BeaconManager.stopRangingBeaconsInRegion(region);
    }
}

class Listener {
    static didRangeBeacons(callback: DidRangeBeaconsCallback): EmitterSubscription {
        return EventEmitter.addListener(
            'didRangeBeacons',
            (data) => callback(data.region, data.beacons),
        );
    }

    static didDetermineState(callback: DidDetermineStateCallback): EmitterSubscription {
        return EventEmitter.addListener(
            'didDetermineState',
            (data) => callback(data.region, data.state),
        );
    }

    static didEnterRegion(callback: DidEnterRegionCallback): EmitterSubscription {
        return EventEmitter.addListener(
            'didEnterRegion',
            (data) => callback(data.region),
        );
    }
    
    static didExitRegion(callback: DidExitRegionCallback): EmitterSubscription {
        return EventEmitter.addListener(
            'didExitRegion',
            (data) => callback(data.region),
        );
    }

    static didChangeAuthorizationStatus(callback: AuthorizationStatusCallback): EmitterSubscription {
        return EventEmitter.addListener(
            'didChangeAuthorizationStatus',
            data => callback(data),
        );
    }

    static bluetoothDidUpdateState(callback: (state: BluetoothState) => any): EmitterSubscription {
        return EventEmitter.addListener(
            'bluetoothDidUpdateState',
            callback,
        );
    }
    
    static onBeaconServiceConnect(callback: () => void): EmitterSubscription {
        return EventEmitter.addListener(
            'onBeaconServiceConnect',
            callback,
        );
    }
}

export default {
    sampleMethod,
    initialize,
    dispose,

    openApplicationSettings,
    
    BluetoothService,
    LocationService,
    Authorization,
    Listener,
    Monitoring,
    Ranging,
};