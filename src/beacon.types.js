// @flow

export type AuthorizationStatus = |
    'authorizedAlways' |
    'authorizedWhenInUse' |
    'denied' |
    'notDetermined' |
    'restricted';

export type ManagerState = |
    'unknown' |
    'resetting' |
    'unsupported' |
    'unauthorized' |
    'powerOff' |
    'powerOn';

export type RegionState = |
    'unknown' |
    'inside' |
    'outside';

export type Proximity = |
    'unknown' |
    'immediate' |
    'near' |
    'far';

export type Region = {
    identifier: string,
    uuid: string,
    minor ? : number,
    major ? : number,
};

export type Beacon = {
    uuid: string,
    minor: number,
    major: number,
    proximity: Proximity,
    rssi: number,
    txPower: number, // android only
    accuracy: number,
    macAddress ? : string, // android only
};

export type AuthorizationStatusCallback = (status: AuthorizationStatus) => void;
export type RangingDidRangeBeaconsCallback = (region: Region, beacons: Array < Beacon > ) => void;
export type MonitoringDidEnterRegionCallback = (region: Region) => void;
export type MonitoringDidExitRegionCallback = (region: Region) => void;
export type MonitoringDidDetermineStateCallback = (region: Region, state: RegionState) => void;