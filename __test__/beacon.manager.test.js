import CBBeacon from '../src/beacon.manager';

jest.mock('NativeEventEmitter');

describe('Class Function Test', () => {
    test('should return valid sampleMethod', () => {
        const valString = 'This is string';
        const valNumber = 123;
        const valResult = `STRING: ${valString}, NUMBER: ${valNumber}`;

        var promise = new Promise(function (resolve, reject) {
            CBBeacon.sampleMethod(valString, valNumber, (result) => {
                if (result === valResult) {
                    resolve();
                } else {
                    reject(Error("Response invalid"));
                }
            });
        });

        return promise;
    });

    test('should return initialized', () => {
        return CBBeacon.initialize();
    });

    test('should return disposed', () => {
        return CBBeacon.dispose();
    });

    test('should return openApplicationSettings', () => {
        return CBBeacon.openApplicationSettings();
    });
});

describe('Bluetooth Service Test', () => {
    test('check bluetooth state should return "unknown"', () => {
        var promise = new Promise(function (resolve, reject) {
            CBBeacon.BluetoothService.checkBluetoothState((result) => {
                if (result === 'unknown') {
                    resolve();
                } else {
                    reject(Error("Response invalid"));
                }
            });
        });

        return promise;
    });

    test('should return openBluetoothSettings', () => {
        return CBBeacon.BluetoothService.openBluetoothSettings();
    });
});

describe('Location Service Test', () => {
    test('check location service should return "false"', () => {
        var promise = new Promise(function (resolve, reject) {
            CBBeacon.LocationService.checkIfEnabled((result) => {
                if (result === false) {
                    resolve();
                } else {
                    reject(Error("Response invalid"));
                }
            });
        });

        return promise;
    });

    test('should return openLocationSettings', () => {
        return CBBeacon.LocationService.openLocationSettings();
    });
});

describe('Authorization Status Test', () => {
    test('check authorization status should return "notDetermined"', () => {
        var promise = new Promise(function (resolve, reject) {
            CBBeacon.Authorization.checkAuthorizationStatus((result) => {
                if (result === "notDetermined") {
                    resolve();
                } else {
                    reject(Error("Response invalid"));
                }
            });
        });

        return promise;
    });

    test('should return requestAlwaysAuthorization', () => {
        return CBBeacon.Authorization.requestAlwaysAuthorization();
    });

    test('should return requestWhenInUseAuthorization', () => {
        return CBBeacon.Authorization.requestWhenInUseAuthorization();
    });
});

describe('Monitoring Test', () => {
    test('should return startMonitoringForRegion', () => {
        return CBBeacon.Monitoring.startMonitoringForRegion();
    });

    test('should return startMonitoringForRegions', () => {
        return CBBeacon.Monitoring.startMonitoringForRegions();
    });

    test('should return stopMonitoringForRegion', () => {
        return CBBeacon.Monitoring.stopMonitoringForRegion();
    });
});

describe('Ranging Test', () => {
    test('should return startMonitoringForRegion', () => {
        return CBBeacon.Ranging.startRangingBeaconsInRegion();
    });

    test('should return startMonitoringForRegions', () => {
        return CBBeacon.Ranging.startRangingBeaconsInRegions();
    });

    test('should return stopRangingBeaconsInRegion', () => {
        return CBBeacon.Ranging.stopRangingBeaconsInRegion();
    });
});

describe('Listener Test', () => {
    test('should return didRangeBeacons', () => {
        return new Promise(function (resolve, reject) {
            var r = {
                identifier: 'identifier',
                uuid: 'uuid',
                minor: 0,
                major: 0,
            };
            var b = [{
                uuid: 'uuid',
                minor: 0,
                major: 0,
                proximity: 'unknown',
                rssi: 0,
                accuracy: -1,
            }];
            CBBeacon.Listener.didRangeBeacons((region, beacons) => {
                if (r.identifier === region.identifier && b.length === beacons.length) {
                    resolve();
                } else {
                    reject(Error("Response invalid"));
                }
            });
        });
    });

    test('should return didDetermineStateForRegion', () => {
        return new Promise(function (resolve, reject) {
            var r = {
                identifier: 'identifier',
                uuid: 'uuid',
                minor: 0,
                major: 0,
            };
            var s = 'unknown';
            CBBeacon.Listener.didDetermineStateForRegion((region, state) => {
                if (r.identifier === region.identifier && state === s) {
                    resolve();
                } else {
                    reject(Error("Response invalid"));
                }
            });
        });
    });

    test('should return didEnterRegion', () => {
        return new Promise(function (resolve, reject) {
            var r = {
                identifier: 'identifier',
                uuid: 'uuid',
                minor: 0,
                major: 0,
            };
            CBBeacon.Listener.didEnterRegion((region) => {
                if (r.identifier === region.identifier) {
                    resolve();
                } else {
                    reject(Error("Response invalid"));
                }
            });
        });
    });

    test('should return didExitRegion', () => {
        return new Promise(function (resolve, reject) {
            var r = {
                identifier: 'identifier',
                uuid: 'uuid',
                minor: 0,
                major: 0,
            };
            CBBeacon.Listener.didExitRegion((region) => {
                if (r.identifier === region.identifier) {
                    resolve();
                } else {
                    reject(Error("Response invalid"));
                }
            });
        });
    });

    test('should return didChangeAuthorizationStatus', () => {
        return new Promise(function (resolve, reject) {
            var s = 'notDetermined';
            CBBeacon.Listener.didChangeAuthorizationStatus((status) => {
                if (s === status) {
                    resolve();
                } else {
                    reject(Error("Response invalid"));
                }
            });
        });
    });

    test('should return bluetoothDidUpdateState', () => {
        return new Promise(function (resolve, reject) {
            var s = 'unknown';
            CBBeacon.Listener.bluetoothDidUpdateState((state) => {
                if (s === state) {
                    resolve();
                } else {
                    reject(Error("Response invalid"));
                }
            });
        });
    });

    test('should return onBeaconServiceConnect', () => {
        return new Promise(function (resolve) {
            CBBeacon.Listener.onBeaconServiceConnect(() => {
                resolve();
            });
        });
    });
});