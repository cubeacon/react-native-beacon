import {
    EmitterSubscription,
    NativeModules,
    NativeEventEmitter
} from 'react-native';
const BeaconManager = NativeModules.CBBeacon;
const EventEmitter = new NativeEventEmitter(BeaconManager);

import {
    type AuthorizationStatusCallback,
    type ManagerState,
    type RegionState,
    type Proximity,
    type Region,
    type Beacon,
    type AuthorizationCallback,
    type RangingDidRangeBeaconsCallback,
    type MonitoringDidEnterRegionCallback,
    type MonitoringDidExitRegionCallback,
    type MonitoringDidDetermineStateCallback,
} from './beacon.types';

const sampleMethod = function (str: string, num: number, callback: (result: String) => void) {
    BeaconManager.sampleMethod(str, num, callback);
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

const authorizationStatus = function (callback: (status: AuthorizationStatus) => any): any {
    return BeaconManager.authorizationStatus(callback);
}

const didChangeAuthorizationStatus = function (callback: AuthorizationStatusCallback): EmitterSubscription {
    return EventEmitter.addListener(
        'didChangeAuthorizationStatus',
        callback,
    );
}

// monitoring
const didEnterRegion = function (callback: MonitoringDidEnterRegionCallback): EmitterSubscription {
    return EventEmitter.addListener(
        'didEnterRegion',
        callback,
    );
}

const didExitRegion = function (callback: MonitoringDidExitRegionCallback): EmitterSubscription {
    return EventEmitter.addListener(
        'didExitRegion',
        callback,
    );
}

const didDetermineState = function (callback: MonitoringDidDetermineStateCallback): EmitterSubscription {
    return EventEmitter.addListener(
        'didDetermineState',
        callback,
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
        callback,
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
    requestAlwaysAuthorization,
    requestWhenInUseAuthorization,
    openApplicationSettings,
    locationServicesEnabled,
    
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