// @flow

import EmitterSubscription from 'react-native/Libraries/vendor/emitter/EmitterSubscription';
import {
    NativeModules,
    NativeEventEmitter
} from 'react-native';
const BeaconManager = NativeModules.CBBeacon;
const EventEmitter = new NativeEventEmitter(BeaconManager);

import {
    AuthorizationStatus,
    ManagerState,
    Region,
    AuthorizationStatusCallback,
    RangingDidRangeBeaconsCallback,
    MonitoringDidEnterRegionCallback,
    MonitoringDidExitRegionCallback,
    MonitoringDidDetermineStateCallback,
} from './beacon.types';

const sampleMethod = function (str: string, num: number, callback: (result: String) => void) {
    BeaconManager.sampleMethod(str, num, callback);
}

const initialize = function () {
    BeaconManager.setup();
}

const requestAlwaysAuthorization = function () {
    BeaconManager.requestAlwaysAuthorization();
}

const requestWhenInUseAuthorization = function () {
    BeaconManager.requestWhenInUseAuthorization();
}

const openApplicationSettings = function () {
    BeaconManager.openApplicationSettings();
}

const locationServicesEnabled = function (callback: (enabled: boolean) => any): any {
    return BeaconManager.locationServicesEnabled(callback);
}

const centralManagerDidUpdateState = function (callback: (state: ManagerState) => any): any {
    return EventEmitter.addListener(
        'centralManagerDidUpdateState',
        callback,
    );
}

// authorization
const authorizationStatus = function (callback: (status: AuthorizationStatus) => any): any {
    return BeaconManager.authorizationStatus(callback);
}

const didChangeAuthorizationStatus = function (callback: AuthorizationStatusCallback): EmitterSubscription {
    return EventEmitter.addListener(
        'didChangeAuthorizationStatus',
        data => callback(data),
    );
}

// monitoring
const didEnterRegion = function (callback: MonitoringDidEnterRegionCallback): EmitterSubscription {
    return EventEmitter.addListener(
        'didEnterRegion',
        (data) => callback(data.region),
    );
}

const didExitRegion = function (callback: MonitoringDidExitRegionCallback): EmitterSubscription {
    return EventEmitter.addListener(
        'didExitRegion',
        (data) => callback(data.region),
    );
}

const didDetermineState = function (callback: MonitoringDidDetermineStateCallback): EmitterSubscription {
    return EventEmitter.addListener(
        'didDetermineState',
        (data) => callback(data.region, data.state),
    );
}

const startMonitoringForRegion = function (region: Region) {
    BeaconManager.startMonitoringForRegion(region);
}

const startMonitoringForRegions = function (regions: Array < Region > ) {
    BeaconManager.startMonitoringForRegions(regions);
}

const stopMonitoringForRegion = function (region: Region) {
    BeaconManager.stopMonitoringForRegion(region);
}

// ranging
const didRangeBeacons = function (callback: RangingDidRangeBeaconsCallback): EmitterSubscription {
    return EventEmitter.addListener(
        'didRangeBeacons',
        (data) => callback(data.region, data.beacons),
    );
}

const startRangingBeaconsInRegion = function (region: Region) {
    BeaconManager.startRangingBeaconsInRegion(region);
}

const startRangingBeaconsInRegions = function (regions: Array < Region > ) {
    BeaconManager.startRangingBeaconsInRegions(regions);
}

const stopRangingBeaconsInRegion = function (region: Region) {
    BeaconManager.stopRangingBeaconsInRegion(region);
}

module.exports = {
    sampleMethod,
    initialize,
    requestAlwaysAuthorization,
    requestWhenInUseAuthorization,
    openApplicationSettings,
    locationServicesEnabled,
    
    centralManagerDidUpdateState,
    didChangeAuthorizationStatus,
    authorizationStatus,

    didEnterRegion,
    didExitRegion,
    didDetermineState,
    startMonitoringForRegion,
    startMonitoringForRegions,
    stopMonitoringForRegion,

    didRangeBeacons,
    startRangingBeaconsInRegion,
    startRangingBeaconsInRegions,
    stopRangingBeaconsInRegion
};