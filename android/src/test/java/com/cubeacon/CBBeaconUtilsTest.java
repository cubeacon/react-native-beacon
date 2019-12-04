package com.cubeacon;

import com.facebook.react.bridge.JavaOnlyMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import org.altbeacon.beacon.Beacon;
import org.altbeacon.beacon.Identifier;
import org.altbeacon.beacon.MonitorNotifier;
import org.altbeacon.beacon.Region;
import org.junit.Assert;
import org.junit.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class CBBeaconUtilsTest {

  @Test
  public void parseState() {
    int state = MonitorNotifier.INSIDE;
    String parsed = CBBeaconUtils.parseState(state);
    Assert.assertEquals(parsed, "inside");

    state = MonitorNotifier.OUTSIDE;
    parsed = CBBeaconUtils.parseState(state);
    Assert.assertEquals(parsed, "outside");

    state = -1;
    parsed = CBBeaconUtils.parseState(state);
    Assert.assertEquals(parsed, "unknown");
  }

  @Test
  public void beaconsToArray() {
    final Beacon beacon = new Beacon.Builder()
        .setId1("CB10023F-A318-3394-4199-A8730C7C1AEC")
        .setId2("123")
        .setId3("456")
        .setRssi(-59)
        .setTxPower(-58)
        .setBluetoothAddress("00:11:22:33:44:55")
        .build();

    List<Beacon> beacons = new ArrayList<Beacon>(){{
      add(beacon);
      add(beacon);
      add(beacon);
    }};
    Assert.assertEquals(beacons.size(), 3);

    WritableArray array = CBBeaconUtils.beaconsToArray(beacons, true);
    Assert.assertEquals(array.size(), 3);
  }

  @Test
  public void beaconToMap() {
    Beacon beacon = new Beacon.Builder()
        .setId1("CB10023F-A318-3394-4199-A8730C7C1AEC")
        .setId2("123")
        .setId3("456")
        .setRssi(-59)
        .setTxPower(-58)
        .setBluetoothAddress("00:11:22:33:44:55")
        .build();

    WritableMap map = CBBeaconUtils.beaconToMap(beacon, true);
    Assert.assertEquals(map.getString("uuid"), "CB10023F-A318-3394-4199-A8730C7C1AEC");
    Assert.assertEquals(map.getInt("major"), 123);
    Assert.assertEquals(map.getInt("minor"), 456);
    Assert.assertEquals(map.getInt("rssi"), -59);
    Assert.assertEquals(map.getInt("txPower"), -58);
    Assert.assertEquals(map.getString("macAddress"), "00:11:22:33:44:55");
  }

  @Test
  public void distanceToProximity() {
    int rssi = 0;
    double distance = 1.0;
    String proximity = CBBeaconUtils.distanceToProximity(rssi, distance);
    Assert.assertEquals(proximity, "unknown");

    rssi = -59;
    distance = 0.9;
    proximity = CBBeaconUtils.distanceToProximity(rssi, distance);
    Assert.assertEquals(proximity, "immediate");

    distance = 2.3;
    proximity = CBBeaconUtils.distanceToProximity(rssi, distance);
    Assert.assertEquals(proximity, "near");

    distance = 12.3;
    proximity = CBBeaconUtils.distanceToProximity(rssi, distance);
    Assert.assertEquals(proximity, "far");
  }

  @Test
  public void regionToMap() {
    String identifier = "Cubeacon";
    Identifier uuid = Identifier.fromUuid(UUID.fromString("CB10023F-A318-3394-4199-A8730C7C1AEC"));
    Identifier major = Identifier.fromInt(123);
    Identifier minor = Identifier.fromInt(456);
    Region region = new Region(identifier, uuid, major, minor);

    WritableMap map = CBBeaconUtils.regionToMap(region, true);
    Assert.assertEquals(map.getString("identifier"), "Cubeacon");
    Assert.assertEquals(map.getString("uuid"), "CB10023F-A318-3394-4199-A8730C7C1AEC");
    Assert.assertEquals(map.getInt("major"), 123);
    Assert.assertEquals(map.getInt("minor"), 456);
  }

  @Test
  public void regionFromMap() {
    WritableMap map = new JavaOnlyMap();
    map.putString("identifier", "Cubeacon");
    map.putString("uuid", "CB10023F-A318-3394-4199-A8730C7C1AEC");
    map.putInt("major", 123);
    map.putInt("minor", 456);

    Region region = CBBeaconUtils.regionFromMap(map);
    Assert.assertEquals(region.getUniqueId(), "Cubeacon");
    Assert.assertEquals(region.getId1().toString().toUpperCase(), "CB10023F-A318-3394-4199-A8730C7C1AEC");
    Assert.assertEquals(region.getId2().toInt(), 123);
    Assert.assertEquals(region.getId3().toInt(), 456);
  }
}