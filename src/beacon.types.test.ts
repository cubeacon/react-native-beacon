/* eslint-disable */
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