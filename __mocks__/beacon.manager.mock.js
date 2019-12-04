const MockNativeEventEmitter = () => {
    return () => {
        const EventEmitter = require('EventEmitter')
        const RCTDeviceEventEmitter = require('RCTDeviceEventEmitter')

        /**
         * Mock the NativeEventEmitter as a normal JS EventEmitter.
         */
        class NativeEventEmitter extends EventEmitter {
            constructor() {
                super(RCTDeviceEventEmitter.sharedSubscriber)
            }

            addListener(eventType: string, listener: (...args: any[]) => any, context ? : any): EmitterSubscription {
                super.addListener(eventType, listener, context);
                if (eventType === 'didRangeBeacons') {
                    super.emit(eventType, {
                        region: {
                            identifier: 'identifier',
                            uuid: 'uuid',
                            minor: 0,
                            major: 0,
                        },
                        beacons: [{
                            uuid: 'uuid',
                            minor: 0,
                            major: 0,
                            proximity: 'unknown',
                            rssi: 0,
                            accuracy: -1,
                        }]
                    });
                } else if (eventType === 'didDetermineStateForRegion') {
                    super.emit(eventType, {
                        region: {
                            identifier: 'identifier',
                            uuid: 'uuid',
                            minor: 0,
                            major: 0,
                        },
                        state: 'unknown'
                    });
                } else if (eventType === 'didEnterRegion') {
                    super.emit(eventType, {
                        region: {
                            identifier: 'identifier',
                            uuid: 'uuid',
                            minor: 0,
                            major: 0,
                        }
                    });
                } else if (eventType === 'didExitRegion') {
                    super.emit(eventType, {
                        region: {
                            identifier: 'identifier',
                            uuid: 'uuid',
                            minor: 0,
                            major: 0,
                        }
                    });
                } else if (eventType === 'didChangeAuthorizationStatus') {
                    super.emit(eventType, 'notDetermined');
                } else if (eventType === 'bluetoothDidUpdateState') {
                    super.emit(eventType, 'unknown');
                } else if (eventType === 'onBeaconServiceConnect') {
                    super.emit(eventType);
                }
            }
        }

        return NativeEventEmitter
    }
}

jest.doMock('NativeEventEmitter', MockNativeEventEmitter(), {
    virtual: true
});

const NativeModules = {
    CBBeacon: {
        sampleMethod: jest.fn((str, num, callback) => callback(`STRING: ${str}, NUMBER: ${num}`)),
        setup: jest.fn(() => Promise.resolve()),
        close: jest.fn(() => Promise.resolve()),
        openApplicationSettings: jest.fn(() => Promise.resolve()),

        bluetoothEnabled: jest.fn((callback) => callback('unknown')),
        openBluetoothSettings: jest.fn(() => Promise.resolve()),

        locationServicesEnabled: jest.fn((callback) => callback(false)),
        openLocationSettings: jest.fn(() => Promise.resolve()),

        authorizationStatus: jest.fn((callback) => callback('notDetermined')),
        requestAlwaysAuthorization: jest.fn(() => Promise.resolve()),
        requestWhenInUseAuthorization: jest.fn(() => Promise.resolve()),

        startMonitoringForRegion: jest.fn(() => Promise.resolve()),
        startMonitoringForRegions: jest.fn(() => Promise.resolve()),
        stopMonitoringForRegion: jest.fn(() => Promise.resolve()),

        startRangingBeaconsInRegion: jest.fn(() => Promise.resolve()),
        startRangingBeaconsInRegions: jest.fn(() => Promise.resolve()),
        stopRangingBeaconsInRegion: jest.fn(() => Promise.resolve()),
    }
}

Object.keys(NativeModules).forEach((name) => {
    mockReactNativeModule(name, NativeModules[name])
})

function mockReactNativeModule(name, shape) {
    jest.doMock(name, () => shape, {
        virtual: true
    })
    require('react-native').NativeModules[name] = shape
}