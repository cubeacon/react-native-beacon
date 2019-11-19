//
//  CBUtils.m
//  CBBeacon
//
//  Created by Alann Maulana on 19/11/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import "CBUtils.h"

@implementation CBUtils

+ (NSDictionary * _Nonnull) dictionaryFromCLBeacon:(CLBeacon*) beacon {
    NSString *proximity;
    switch (beacon.proximity) {
        case CLProximityUnknown:
            proximity = @"unknown";
            break;
        case CLProximityImmediate:
            proximity = @"immediate";
            break;
        case CLProximityNear:
            proximity = @"near";
            break;
        case CLProximityFar:
            proximity = @"far";
            break;
    }
    
    NSNumber *rssi = [NSNumber numberWithInteger:beacon.rssi];
    return @{
        @"proximityUUID": [beacon.proximityUUID UUIDString],
        @"major": beacon.major,
        @"minor": beacon.minor,
        @"rssi": rssi,
        @"accuracy": @(beacon.accuracy),
        @"proximity": proximity
    };
}

+ (NSDictionary * _Nonnull) dictionaryFromCLBeaconRegion:(CLBeaconRegion*) region {
    id major = region.major;
    if (!major) {
        major = [NSNull null];
    }
    id minor = region.minor;
    if (!minor) {
        minor = [NSNull null];
    }
    
    return @{
        @"identifier": region.identifier,
        @"uuid": [region.proximityUUID UUIDString],
        @"major": major,
        @"minor": minor,
    };
}

+ (CLBeaconRegion * _Nullable) regionFromDictionary:(NSDictionary*) dict {
    NSString *identifier = dict[@"identifier"];
    NSString *proximityUUID = dict[@"uuid"];
    NSNumber *major = dict[@"major"];
    NSNumber *minor = dict[@"minor"];
    
    CLBeaconRegion *region = nil;
    if (proximityUUID && major && minor) {
        if (@available(iOS 13.0, *)) {
            region = [[CLBeaconRegion alloc] initWithUUID:[[NSUUID alloc] initWithUUIDString:proximityUUID] major:[major intValue] minor:[minor intValue] identifier:identifier];
        } else {
            region = [[CLBeaconRegion alloc] initWithProximityUUID:[[NSUUID alloc] initWithUUIDString:proximityUUID] major:[major intValue] minor:[minor intValue] identifier:identifier];
        }
    } else if (proximityUUID && major) {
        if (@available(iOS 13.0, *)) {
            region = [[CLBeaconRegion alloc] initWithUUID:[[NSUUID alloc] initWithUUIDString:proximityUUID] major:[major intValue] identifier:identifier];
        } else {
            region = [[CLBeaconRegion alloc] initWithProximityUUID:[[NSUUID alloc] initWithUUIDString:proximityUUID] major:[major intValue] identifier:identifier];
        }
    } else if (proximityUUID) {
        if (@available(iOS 13.0, *)) {
            region = [[CLBeaconRegion alloc] initWithUUID:[[NSUUID alloc] initWithUUIDString:proximityUUID] identifier:identifier];
        } else {
            region = [[CLBeaconRegion alloc] initWithProximityUUID:[[NSUUID alloc] initWithUUIDString:proximityUUID] identifier:identifier];
        }
    }
    
    if (!region) {
        return nil;
    }
    
    region.notifyEntryStateOnDisplay = YES;
    
    return region;
}

+ (NSString * _Nonnull) stringFromRegionState:(CLRegionState) state {
    switch (state) {
        case CLRegionStateInside:
            return @"inside";
        case CLRegionStateOutside:
            return @"outside";
        case CLRegionStateUnknown:
            return @"unknown";
    }
}

+ (NSString * _Nonnull) stringFromManagerState:(CBManagerState) state {
    switch(state) {
        case CBManagerStateUnknown:
            return @"unknown";
        case CBManagerStateResetting:
            return @"resetting";
        case CBManagerStateUnsupported:
            return @"unsupported";
        case CBManagerStateUnauthorized:
            return @"unauthorized";
        case CBManagerStatePoweredOff:
            return @"powerOff";
        case CBManagerStatePoweredOn:
            return @"powerOn";
    }
}

+ (NSString * _Nonnull) stringFromAuthorizationStatus:(CLAuthorizationStatus) authorizationStatus {
    switch (authorizationStatus) {
        case kCLAuthorizationStatusDenied:
            return @"denied";
        case kCLAuthorizationStatusRestricted:
            return @"restricted";
        case kCLAuthorizationStatusNotDetermined:
            return @"notDetermined";
        case kCLAuthorizationStatusAuthorizedAlways:
            return @"authorizedAlways";
        case kCLAuthorizationStatusAuthorizedWhenInUse:
            return @"authorizedWhenInUse";
    }
}

@end
