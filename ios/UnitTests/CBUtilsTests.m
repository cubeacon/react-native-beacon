//
//  CBUtilsTests.m
//  CBUtilsTests
//
//  Created by Alann Maulana on 02/12/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

#import <XCTest/XCTest.h>
#import "CBUtils.h"

@interface CBUtilsTests : XCTestCase

@end

@implementation CBUtilsTests

- (void)setUp {
    // Put setup code here. This method is called before the invocation of each test method in the class.
}

- (void)tearDown {
    // Put teardown code here. This method is called after the invocation of each test method in the class.
}

- (void)testDictionaryFromCLBeacon {
//    TODO: Mock CLBeacon
//    CLBeacon *beacon = [[CLBeacon alloc] init];
//    [beacon setValue:@(123) forKey:@"major"];
//    [beacon setValue:@(456) forKey:@"minor"];
//    [beacon setValue:@(-57) forKey:@"rssi"];
//    [beacon setValue:@(1.2) forKey:@"accuracy"];
//    [beacon setValue:@(CLProximityImmediate) forKey:@"proximity"];
//    [beacon setValue:[[NSUUID alloc] initWithUUIDString:@"CB10023F-A318-3394-4199-A8730C7C1AEC"] forKey:@"proximityUUID"];
    
//    NSDictionary *dict = [CBUtils dictionaryFromCLBeacon:beacon];
//    NSLog(@"@%", dict);
//    XCTAssertEqualObjects(dict[@"uuid"], @"CB10023F-A318-3394-4199-A8730C7C1AEC", @"Beacon UUID failed");
//    XCTAssertEqualObjects(dict[@"major"], @(123), @"Beacon major failed");
//    XCTAssertEqualObjects(dict[@"minor"], @(456), @"Beacon minor failed");
//    XCTAssertEqualObjects(dict[@"rssi"], @(-57), @"Beacon rssi failed");
//    XCTAssertEqualObjects(dict[@"accuracy"], @(1.2), @"Beacon accuracy failed");
//    XCTAssertEqualObjects(dict[@"proximity"], @"immediate", @"Beacon proximity failed");
}

- (void)testDictionaryFromCLBeaconRegion {
    CLBeaconRegion *region = [[CLBeaconRegion alloc] initWithUUID:[[NSUUID alloc] initWithUUIDString:@"CB10023F-A318-3394-4199-A8730C7C1AEC"]
                                                            major:123
                                                            minor:456
                                                       identifier:@"Cubeacon"];
    
    NSDictionary *dict = [CBUtils dictionaryFromCLBeaconRegion:region];
    XCTAssertEqualObjects(dict[@"identifier"], @"Cubeacon", @"Region identifier failed");
    XCTAssertEqualObjects(dict[@"uuid"], @"CB10023F-A318-3394-4199-A8730C7C1AEC", @"Region UUID failed");
    XCTAssertEqualObjects(dict[@"major"], @(123), @"Region major failed");
    XCTAssertEqualObjects(dict[@"minor"], @(456), @"Region minor failed");
}

- (void)testRegionFromDictionary {
    NSDictionary *dict = @{
        @"identifier": @"Cubeacon",
        @"uuid": @"CB10023F-A318-3394-4199-A8730C7C1AEC",
        @"major": @(123),
        @"minor": @(456)
    };
    
    CLBeaconRegion *region = [CBUtils regionFromDictionary:dict];
    XCTAssertEqualObjects(region.identifier, @"Cubeacon", @"Region identifier failed");
    XCTAssertEqualObjects(region.UUID.UUIDString, @"CB10023F-A318-3394-4199-A8730C7C1AEC", @"Region UUID failed");
    XCTAssertEqualObjects(region.major, @(123), @"Region major failed");
    XCTAssertEqualObjects(region.minor, @(456), @"Region minor failed");
}

- (void)testStringFromRegionState {
    CLRegionState state = CLRegionStateInside;
    NSString *stateDesc = [CBUtils stringFromRegionState:state];
    XCTAssertEqualObjects(stateDesc, @"inside", @"State description failed");
    
    state = CLRegionStateOutside;
    stateDesc = [CBUtils stringFromRegionState:state];
    XCTAssertEqualObjects(stateDesc, @"outside", @"State description failed");
    
    state = CLRegionStateUnknown;
    stateDesc = [CBUtils stringFromRegionState:state];
    XCTAssertEqualObjects(stateDesc, @"unknown", @"State description failed");
}

- (void)testStringFromManagerState {
    CBManagerState state = CBManagerStateUnknown;
    NSString *stateDesc = [CBUtils stringFromManagerState:state];
    XCTAssertEqualObjects(stateDesc, @"unknown", @"State description failed");
    
    state = CBManagerStatePoweredOn;
    stateDesc = [CBUtils stringFromManagerState:state];
    XCTAssertEqualObjects(stateDesc, @"powerOn", @"State description failed");
    
    state = CBManagerStatePoweredOff;
    stateDesc = [CBUtils stringFromManagerState:state];
    XCTAssertEqualObjects(stateDesc, @"powerOff", @"State description failed");
    
    state = CBManagerStateResetting;
    stateDesc = [CBUtils stringFromManagerState:state];
    XCTAssertEqualObjects(stateDesc, @"resetting", @"State description failed");
    
    state = CBManagerStateUnsupported;
    stateDesc = [CBUtils stringFromManagerState:state];
    XCTAssertEqualObjects(stateDesc, @"unsupported", @"State description failed");
    
    state = CBManagerStateUnauthorized;
    stateDesc = [CBUtils stringFromManagerState:state];
    XCTAssertEqualObjects(stateDesc, @"unauthorized", @"State description failed");
}

- (void)testStringFromAuthorizationStatus {
    CLAuthorizationStatus state = kCLAuthorizationStatusDenied;
    NSString *stateDesc = [CBUtils stringFromAuthorizationStatus:state];
    XCTAssertEqualObjects(stateDesc, @"denied", @"Status description failed");
    
    state = kCLAuthorizationStatusRestricted;
    stateDesc = [CBUtils stringFromAuthorizationStatus:state];
    XCTAssertEqualObjects(stateDesc, @"restricted", @"Status description failed");
    
    state = kCLAuthorizationStatusNotDetermined;
    stateDesc = [CBUtils stringFromAuthorizationStatus:state];
    XCTAssertEqualObjects(stateDesc, @"notDetermined", @"Status description failed");
    
    state = kCLAuthorizationStatusAuthorizedAlways;
    stateDesc = [CBUtils stringFromAuthorizationStatus:state];
    XCTAssertEqualObjects(stateDesc, @"authorizedAlways", @"Status description failed");
    
    state = kCLAuthorizationStatusAuthorizedWhenInUse;
    stateDesc = [CBUtils stringFromAuthorizationStatus:state];
    XCTAssertEqualObjects(stateDesc, @"authorizedWhenInUse", @"Status description failed");
}

- (void)testPerformanceExample {
    [self measureBlock:^{
        [self testStringFromRegionState];
        [self testStringFromManagerState];
        [self testStringFromAuthorizationStatus];
    }];
}

@end
