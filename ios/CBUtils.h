//
//  CBUtils.h
//  CBBeacon
//
//  Created by Alann Maulana on 19/11/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CoreBluetooth/CoreBluetooth.h>
#import <CoreLocation/CoreLocation.h>

//#define VERBOSE

#ifdef VERBOSE
  #define CBLog(...) NSLog(@"%s %@", __PRETTY_FUNCTION__, [NSString stringWithFormat:__VA_ARGS__])
#else
  #define CBLog(...)
#endif

NS_ASSUME_NONNULL_BEGIN

@interface CBUtils : NSObject

+ (NSDictionary * _Nonnull) dictionaryFromCLBeacon:(CLBeacon*) beacon;
+ (NSDictionary * _Nonnull) dictionaryFromCLBeaconRegion:(CLBeaconRegion*) region;
+ (CLBeaconRegion * _Nullable) regionFromDictionary:(NSDictionary*) dict;
+ (NSString * _Nonnull) stringFromRegionState:(CLRegionState) state;
+ (NSString * _Nonnull) stringFromManagerState:(CBManagerState) state;
+ (NSString * _Nonnull) stringFromAuthorizationStatus:(CLAuthorizationStatus) authorizationStatus;

@end

NS_ASSUME_NONNULL_END
