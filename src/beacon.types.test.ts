/* eslint-disable */
import {
    AuthorizationStatus,
    BluetoothState,
    Region,
    Proximity,
    Beacon,
    RegionState,
} from './beacon.types';
/* eslint-enable */

test('all region parameter value is undefined or null', () => {
    const region: Region = {
        identifier: null,
        uuid: null
    };
    expect(region.identifier).toBe(null);
    expect(region.uuid).toBe(null);
    expect(region.major).toBe(undefined);
    expect(region.minor).toBe(undefined);
});

test('identifier and uuid are equals', () => {
    const region: Region = {
        identifier: 'Cubeacon',
        uuid: 'CB10023F-A318-3394-4199-A8730C7C1AEC'
    };
    expect(region.identifier).toBe('Cubeacon');
    expect(region.uuid).toBe('CB10023F-A318-3394-4199-A8730C7C1AEC');
    expect(region.major).toBe(undefined);
    expect(region.minor).toBe(undefined);
});

test('major is not null', () => {
    const region: Region = {
        identifier: 'Cubeacon',
        uuid: 'CB10023F-A318-3394-4199-A8730C7C1AEC',
        major: 123
    };
    expect(region.identifier).toBe('Cubeacon');
    expect(region.uuid).toBe('CB10023F-A318-3394-4199-A8730C7C1AEC');
    expect(region.major).toEqual(123);
    expect(region.minor).toEqual(undefined);
});

test('major is not null', () => {
    const region: Region = {
        identifier: 'Cubeacon',
        uuid: 'CB10023F-A318-3394-4199-A8730C7C1AEC',
        major: 123,
        minor: 456
    };
    expect(region.identifier).toBe('Cubeacon');
    expect(region.uuid).toBe('CB10023F-A318-3394-4199-A8730C7C1AEC');
    expect(region.major).toEqual(123);
    expect(region.minor).toEqual(456);
});

test('all beacon value from iOS is set', () => {
    const beacon: Beacon = {
        uuid: 'CB10023F-A318-3394-4199-A8730C7C1AEC',
        major: 123,
        minor: 456,
        accuracy: 1.2,
        proximity: "immediate",
        rssi: -57
    };
    expect(beacon.uuid).toBe('CB10023F-A318-3394-4199-A8730C7C1AEC');
    expect(beacon.major).toEqual(123);
    expect(beacon.minor).toEqual(456);
    expect(beacon.accuracy).toEqual(1.2);
    expect(beacon.proximity).toEqual("immediate");
    expect(beacon.rssi).toEqual(-57);
});

test('all beacon value from Android is set', () => {
    const beacon: Beacon = {
        uuid: 'CB10023F-A318-3394-4199-A8730C7C1AEC',
        major: 456,
        minor: 789,
        accuracy: 2.3,
        proximity: "near",
        rssi: -59,
        macAddress: "00:11:22:33:44:55",
        txPower: -58
    };
    expect(beacon.uuid).toBe('CB10023F-A318-3394-4199-A8730C7C1AEC');
    expect(beacon.major).toEqual(456);
    expect(beacon.minor).toEqual(789);
    expect(beacon.accuracy).toEqual(2.3);
    expect(beacon.proximity).toEqual("near");
    expect(beacon.rssi).toEqual(-59);
    expect(beacon.macAddress).toEqual("00:11:22:33:44:55");
    expect(beacon.txPower).toEqual(-58);
});

test('authorization status must be undefined', () => {
    var status: AuthorizationStatus;
    expect(status).toBe(undefined);
});

test('authorization status must be "authorizedAlways" and "notDetermined"', () => {
    var status: AuthorizationStatus = "authorizedAlways";
    expect(status).toBe("authorizedAlways");
    status = "notDetermined";
    expect(status).toBe("notDetermined");
});

test('bluetooth state must be undefined', () => {
    var status: BluetoothState;
    expect(status).toBe(undefined);
});

test('bluetooth state must be "powerOn"', () => {
    var status: BluetoothState = "powerOn";
    expect(status).toBe("powerOn");
});

test('proximity must be undefined', () => {
    var proximity: Proximity;
    expect(proximity).toBe(undefined);
});

test('proximity must be "immediate"', () => {
    var proximity: Proximity = "immediate";
    expect(proximity).toBe("immediate");
});

test('region state must be undefined', () => {
    var state: RegionState;
    expect(state).toBe(undefined);
});

test('region state must be "inside"', () => {
    var state: RegionState = "inside";
    expect(state).toBe("inside");
});