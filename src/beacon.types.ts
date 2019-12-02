// @flow

export type AuthorizationStatus = |
    'authorizedAlways' |
    'authorizedWhenInUse' | // ios only
    'denied' |
    'notDetermined' | // ios only
    'restricted';

export type BluetoothState = |
    'unknown' |
    'resetting' | // ios only
    'unsupported' |
    'unauthorized' | // ios only
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
    minor?: number,
    major?: number,
};

export type Beacon = {
    uuid: string,
    minor: number,
    major: number,
    proximity: Proximity,
    rssi: number,
    txPower?: number, // android only
    accuracy: number,
    macAddress?: string, // android only
};

export type AuthorizationStatusCallback = (status: AuthorizationStatus) => void;
export type DidRangeBeaconsCallback = (region: Region, beacons: Array<Beacon>) => void;
export type DidEnterRegionCallback = (region: Region) => void;
export type DidExitRegionCallback = (region: Region) => void;
export type DidDetermineStateCallback = (region: Region, state: RegionState) => void;