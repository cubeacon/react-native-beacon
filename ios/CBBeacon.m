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

@end

@implementation CBBeacon

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE()

#pragma mark Initialization
- (instancetype)init {
    if (self = [super init]) {
        _bluetoothManager = [[CBCentralManager alloc] initWithDelegate:self queue:dispatch_get_main_queue()];
        
        _locationManager = [[CLLocationManager alloc] init];
        _locationManager.delegate = self;
        
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
        @"centralManagerDidUpdateState",
        @"didChangeAuthorizationStatus",
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

RCT_EXPORT_METHOD(requestAlwaysAuthorization) {
    if ([self.locationManager respondsToSelector:@selector(requestAlwaysAuthorization)]) {
        [self.locationManager requestAlwaysAuthorization];
    }
}

RCT_EXPORT_METHOD(requestWhenInUseAuthorization) {
    if ([self.locationManager respondsToSelector:@selector(requestWhenInUseAuthorization)]) {
        [self.locationManager requestWhenInUseAuthorization];
    }
}

RCT_EXPORT_METHOD(openApplicationSettings) {
    [[UIApplication sharedApplication] openURL:[NSURL URLWithString:UIApplicationOpenSettingsURLString]];
}

#pragma mark Parameter Checker
RCT_EXPORT_METHOD(locationServicesEnabled:(RCTResponseSenderBlock) callback) {
    callback(@[@([CLLocationManager locationServicesEnabled])]);
}

RCT_EXPORT_METHOD(authorizationStatus:(RCTResponseSenderBlock) callback) {
    callback(@[[CBUtils stringFromAuthorizationStatus:[CLLocationManager authorizationStatus]]]);
}

#pragma mark Monitoring Beacons
RCT_EXPORT_METHOD(startMonitoringForRegion:(NSDictionary *) dict) {
    CLBeaconRegion *region = [CBUtils regionFromDictionary:dict];
    [self.regionMonitoring addObject:region];
    [self.locationManager startMonitoringForRegion:region];
}

RCT_EXPORT_METHOD(startMonitoringForRegions:(NSArray<NSDictionary *> *) array) {
    [array enumerateObjectsUsingBlock:^(NSDictionary * _Nonnull dict, NSUInteger idx, BOOL * _Nonnull stop) {
        [self startMonitoringForRegion:dict];
    }];
}

RCT_EXPORT_METHOD(stopMonitoringForRegion:(NSDictionary *) dict) {
    CLBeaconRegion *region = [CBUtils regionFromDictionary:dict];
    [self.regionRanging removeObject:region];
    [self.locationManager stopMonitoringForRegion:region];
}

#pragma mark Ranging Beacons
RCT_EXPORT_METHOD(startRangingBeaconsInRegion:(NSDictionary *) dict) {
    CLBeaconRegion *region = [CBUtils regionFromDictionary:dict];
    [self.regionRanging addObject:region];
    [self.locationManager startRangingBeaconsInRegion:region];
}

RCT_EXPORT_METHOD(startRangingBeaconsInRegions:(NSArray<NSDictionary *> *) array) {
    [array enumerateObjectsUsingBlock:^(NSDictionary * _Nonnull dict, NSUInteger idx, BOOL * _Nonnull stop) {
        [self startRangingBeaconsInRegion:dict];
    }];
}

RCT_EXPORT_METHOD(stopRangingBeaconsInRegion:(NSDictionary *) dict) {
    CLBeaconRegion *region = [CBUtils regionFromDictionary:dict];
    [self.regionRanging removeObject:region];
    [self.locationManager stopRangingBeaconsInRegion:region];
}

#pragma mark Central Manager Delegate
- (void)centralManagerDidUpdateState:(CBCentralManager *)central {
    if (self.bridge) {
        [self sendEventWithName:@"centralManagerDidUpdateState" body:[CBUtils stringFromManagerState:central.state]];
    }
}

#pragma mark Location Manager Delegate
- (void)locationManager:(CLLocationManager *)manager didChangeAuthorizationStatus:(CLAuthorizationStatus)status {
    if (self.bridge) {
        [self sendEventWithName:@"didChangeAuthorizationStatus" body:[CBUtils stringFromAuthorizationStatus:status]];
    }
}

- (void)locationManager:(CLLocationManager *)manager didRangeBeacons:(NSArray<CLBeacon *> *)beacons inRegion:(CLBeaconRegion *)region {
    if (self.bridge) {
        NSDictionary *dictRegion = [CBUtils dictionaryFromCLBeaconRegion:region];
        
        NSMutableArray *array = [NSMutableArray array];
        for (CLBeacon *beacon in beacons) {
            NSDictionary *dictBeacon = [CBUtils dictionaryFromCLBeacon:beacon];
            [array addObject:dictBeacon];
        }
        
        [self sendEventWithName:@"didRangeBeacons" body:@{
            @"region": dictRegion,
            @"beacons": array
        }];
    }
}

- (void)locationManager:(CLLocationManager *)manager didEnterRegion:(CLRegion *)region {
    if (self.bridge) {
        CLBeaconRegion *reg;
        for (CLBeaconRegion *r in self.regionMonitoring) {
            if ([region.identifier isEqualToString:r.identifier]) {
                reg = r;
                break;
            }
        }
        
        if (reg) {
            NSDictionary *dictRegion = [CBUtils dictionaryFromCLBeaconRegion:reg];
            [self sendEventWithName:@"didEnterRegion" body:@{
                @"region": dictRegion
            }];
        }
    }
}

- (void)locationManager:(CLLocationManager *)manager didExitRegion:(CLRegion *)region {
    if (self.bridge) {
        CLBeaconRegion *reg;
        for (CLBeaconRegion *r in self.regionMonitoring) {
            if ([region.identifier isEqualToString:r.identifier]) {
                reg = r;
                break;
            }
        }
        
        if (reg) {
            NSDictionary *dictRegion = [CBUtils dictionaryFromCLBeaconRegion:reg];
            [self sendEventWithName:@"didExitRegion" body:@{
                @"region": dictRegion
            }];
        }
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
        
        if (self.bridge) {
            [self sendEventWithName:@"didDetermineStateForRegion" body:@{
                @"region": dictRegion,
                @"state": stt
            }];
        }
    }
}

@end
