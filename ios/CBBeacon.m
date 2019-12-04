#import "CBBeacon.h"
#import <CoreBluetooth/CoreBluetooth.h>
#import <CoreLocation/CoreLocation.h>
#import "CBUtils.h"

#import <React/RCTConvert.h>
#import <React/RCTEventDispatcher.h>

@interface CBBeacon() <CLLocationManagerDelegate, CBCentralManagerDelegate>

@property (strong, nonatomic) CLLocationManager *locationManager;
@property (strong, nonatomic) CBCentralManager *bluetoothManager;
@property (strong, nonatomic) NSMutableArray<CLBeaconRegion*> *regionRanging;
@property (strong, nonatomic) NSMutableArray<CLBeaconRegion*> *regionMonitoring;

@property CBManagerState state;

@end

@implementation CBBeacon

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE()

#pragma mark Initialization
- (instancetype)init {
    if (self = [super init]) {
        _regionRanging = [NSMutableArray array];
        _regionMonitoring = [NSMutableArray array];
    }
    return self;
}

+ (instancetype)sharedInstance {
    static CBBeacon *sharedInstance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedInstance = [[CBBeacon alloc] init];
    });
    return sharedInstance;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[
        @"bluetoothDidUpdateState",
        @"didChangeAuthorizationStatus",
        @"onBeaconServiceConnect",
        @"didRangeBeacons",
        @"didEnterRegion",
        @"didExitRegion",
        @"didDetermineStateForRegion"
    ];
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

RCT_EXPORT_METHOD(sampleMethod:(NSString *)stringArgument numberParameter:(nonnull NSNumber *)numberArgument callback:(RCTResponseSenderBlock)callback) {
    // TODO: Implement some actually useful functionality
    callback(@[[NSString stringWithFormat: @"numberArgument: %@ stringArgument: %@", numberArgument, stringArgument]]);
}

RCT_EXPORT_METHOD(setup) {
    dispatch_sync(dispatch_get_main_queue(),^ {
        _bluetoothManager = [[CBCentralManager alloc] initWithDelegate:self queue:dispatch_get_main_queue()];
        
        _locationManager = [[CLLocationManager alloc] init];
        _locationManager.delegate = self;
        
        [self sendEventWithName:@"onBeaconServiceConnect" body:nil];
        
        CBLog(@"BEACON: initialized");
    });
}

RCT_EXPORT_METHOD(close) {
    if (self.regionMonitoring.count > 0) {
        [self.regionMonitoring enumerateObjectsUsingBlock:^(CLBeaconRegion * _Nonnull region, NSUInteger idx, BOOL * _Nonnull stop) {
            [self.locationManager stopMonitoringForRegion:region];
        }];
    }
    
    if (self.regionRanging.count > 0) {
        [self.regionRanging enumerateObjectsUsingBlock:^(CLBeaconRegion * _Nonnull region, NSUInteger idx, BOOL * _Nonnull stop) {
            [self.locationManager stopRangingBeaconsInRegion:region];
        }];
    }
    
    self.locationManager.delegate = nil;
    self.bluetoothManager.delegate = nil;
}

RCT_EXPORT_METHOD(requestAlwaysAuthorization) {
    CBLog(@"BEACON: requestAlwaysAuthorization");
    if ([self.locationManager respondsToSelector:@selector(requestAlwaysAuthorization)]) {
        [self.locationManager requestAlwaysAuthorization];
    }
}

RCT_EXPORT_METHOD(requestWhenInUseAuthorization) {
    CBLog(@"BEACON: requestWhenInUseAuthorization");
    if ([self.locationManager respondsToSelector:@selector(requestWhenInUseAuthorization)]) {
        [self.locationManager requestWhenInUseAuthorization];
    }
}

RCT_EXPORT_METHOD(openApplicationSettings) {
    CBLog(@"BEACON: openApplicationSettings");
    [[UIApplication sharedApplication] openURL:[NSURL URLWithString:UIApplicationOpenSettingsURLString]];
}

RCT_EXPORT_METHOD(openLocationSettings) {
    // do nothing
    
    // Beware, this is considered as a private API and Apple will rejecte your application
    // Uncomment these codes below if your want to publish this app privately
    /*
    dispatch_sync(dispatch_get_main_queue(),^ {
        NSString *settingsUrl= @"App-Prefs:root=Privacy&path=LOCATION";
        if ([[UIApplication sharedApplication] respondsToSelector:@selector(openURL:options:completionHandler:)]) {
            [[UIApplication sharedApplication] openURL:[NSURL URLWithString:settingsUrl] options:@{} completionHandler:^(BOOL success) {
                NSLog(@"Location settings opened");
            }];
        }
    });
    */
}

RCT_EXPORT_METHOD(openBluetoothSettings) {
    // do nothing
    
    // Beware, this is considered as a private API and Apple will rejecte your application
    // Uncomment these codes below if your want to publish this app privately
    /*
    dispatch_sync(dispatch_get_main_queue(),^ {
        NSString *settingsUrl= @"App-Prefs:root=Bluetooth";
        if ([[UIApplication sharedApplication] respondsToSelector:@selector(openURL:options:completionHandler:)]) {
            [[UIApplication sharedApplication] openURL:[NSURL URLWithString:settingsUrl] options:@{} completionHandler:^(BOOL success) {
                NSLog(@"Bluetooth settings opened");
            }];
        }
    });
    */
}

#pragma mark Parameter Checker
RCT_EXPORT_METHOD(bluetoothEnabled:(RCTResponseSenderBlock) callback) {
    CBLog(@"BEACON: bluetoothEnabled");
    if (!self.state) {
        self.state = self.bluetoothManager.state;
    }
    callback(@[[CBUtils stringFromManagerState:self.state]]);
}

RCT_EXPORT_METHOD(locationServicesEnabled:(RCTResponseSenderBlock) callback) {
    CBLog(@"BEACON: locationServicesEnabled");
    callback(@[@([CLLocationManager locationServicesEnabled])]);
}

RCT_EXPORT_METHOD(authorizationStatus:(RCTResponseSenderBlock) callback) {
    CBLog(@"BEACON: authorizationStatus");
    callback(@[[CBUtils stringFromAuthorizationStatus:[CLLocationManager authorizationStatus]]]);
}

#pragma mark Monitoring Beacons
RCT_EXPORT_METHOD(startMonitoringForRegion:(NSDictionary *) dict) {
    CBLog(@"BEACON: startMonitoringForRegion %@", dict);
    CLBeaconRegion *region = [CBUtils regionFromDictionary:dict];
    [self.regionMonitoring addObject:region];
    [self.locationManager startMonitoringForRegion:region];
}

RCT_EXPORT_METHOD(startMonitoringForRegions:(NSArray<NSDictionary *> *) array) {
    CBLog(@"BEACON: startMonitoringForRegions %@", array);
    [array enumerateObjectsUsingBlock:^(NSDictionary * _Nonnull dict, NSUInteger idx, BOOL * _Nonnull stop) {
        [self startMonitoringForRegion:dict];
    }];
}

RCT_EXPORT_METHOD(stopMonitoringForRegion:(NSDictionary *) dict) {
    CBLog(@"BEACON: stopMonitoringForRegion %@", dict);
    CLBeaconRegion *region = [CBUtils regionFromDictionary:dict];
    [self.regionRanging removeObject:region];
    [self.locationManager stopMonitoringForRegion:region];
}

#pragma mark Ranging Beacons
RCT_EXPORT_METHOD(startRangingBeaconsInRegion:(NSDictionary *) dict) {
    CBLog(@"BEACON: startRangingBeaconsInRegion %@", dict);
    CLBeaconRegion *region = [CBUtils regionFromDictionary:dict];
    [self.regionRanging addObject:region];
    [self.locationManager startRangingBeaconsInRegion:region];
}

RCT_EXPORT_METHOD(startRangingBeaconsInRegions:(NSArray<NSDictionary *> *) array) {
    CBLog(@"BEACON: startRangingBeaconsInRegions %@", array);
    [array enumerateObjectsUsingBlock:^(NSDictionary * _Nonnull dict, NSUInteger idx, BOOL * _Nonnull stop) {
        [self startRangingBeaconsInRegion:dict];
    }];
}

RCT_EXPORT_METHOD(stopRangingBeaconsInRegion:(NSDictionary *) dict) {
    CBLog(@"BEACON: stopRangingBeaconsInRegion %@", dict);
    CLBeaconRegion *region = [CBUtils regionFromDictionary:dict];
    [self.regionRanging removeObject:region];
    [self.locationManager stopRangingBeaconsInRegion:region];
}

#pragma mark Central Manager Delegate
- (void)centralManagerDidUpdateState:(CBCentralManager *)central {
    self.state = central.state;
    NSString *stateDesc = [CBUtils stringFromManagerState:central.state];
    CBLog(@"BEACON: bluetoothDidUpdateState %@", stateDesc);
    [self sendEventWithName:@"bluetoothDidUpdateState" body:stateDesc];
}

#pragma mark Location Manager Delegate
- (void)locationManager:(CLLocationManager *)manager didChangeAuthorizationStatus:(CLAuthorizationStatus)status {
    NSString *statusDesc = [CBUtils stringFromAuthorizationStatus:status];
    CBLog(@"BEACON: didChangeAuthorizationStatus %@", statusDesc);
    [self sendEventWithName:@"didChangeAuthorizationStatus" body:statusDesc];
}

- (void)locationManager:(CLLocationManager *)manager didRangeBeacons:(NSArray<CLBeacon *> *)beacons inRegion:(CLBeaconRegion *)region {
    NSDictionary *dictRegion = [CBUtils dictionaryFromCLBeaconRegion:region];
    
    NSMutableArray *array = [NSMutableArray array];
    for (CLBeacon *beacon in beacons) {
        NSDictionary *dictBeacon = [CBUtils dictionaryFromCLBeacon:beacon];
        [array addObject:dictBeacon];
    }
    
    
    CBLog(@"BEACON: didRangeBeacons %@:%@", dictRegion, array);
    [self sendEventWithName:@"didRangeBeacons" body:@{
        @"region": dictRegion,
        @"beacons": array
    }];
}

- (void)locationManager:(CLLocationManager *)manager didEnterRegion:(CLRegion *)region {
    CLBeaconRegion *reg;
    for (CLBeaconRegion *r in self.regionMonitoring) {
        if ([region.identifier isEqualToString:r.identifier]) {
            reg = r;
            break;
        }
    }
    
    if (reg) {
        NSDictionary *dictRegion = [CBUtils dictionaryFromCLBeaconRegion:reg];
        CBLog(@"BEACON: didEnterRegion %@", dictRegion);
        [self sendEventWithName:@"didEnterRegion" body:@{
            @"region": dictRegion
        }];
    }
}

- (void)locationManager:(CLLocationManager *)manager didExitRegion:(CLRegion *)region {
    CLBeaconRegion *reg;
    for (CLBeaconRegion *r in self.regionMonitoring) {
        if ([region.identifier isEqualToString:r.identifier]) {
            reg = r;
            break;
        }
    }
    
    if (reg) {
        NSDictionary *dictRegion = [CBUtils dictionaryFromCLBeaconRegion:reg];
        CBLog(@"BEACON: didExitRegion %@", dictRegion);
        [self sendEventWithName:@"didExitRegion" body:@{
            @"region": dictRegion
        }];
    }
}

- (void)locationManager:(CLLocationManager *)manager didDetermineState:(CLRegionState)state forRegion:(CLRegion *)region {
    CLBeaconRegion *reg;
    for (CLBeaconRegion *r in self.regionMonitoring) {
        if ([region.identifier isEqualToString:r.identifier]) {
            reg = r;
            break;
        }
    }
    
    if (reg) {
        NSDictionary *dictRegion = [CBUtils dictionaryFromCLBeaconRegion:reg];
        NSString *stt = [CBUtils stringFromRegionState:state];
        CBLog(@"BEACON: didDetermineState %@:%ld", dictRegion, (long)stt);
        
        [self sendEventWithName:@"didDetermineStateForRegion" body:@{
            @"region": dictRegion,
            @"state": stt
        }];
    }
}

@end
