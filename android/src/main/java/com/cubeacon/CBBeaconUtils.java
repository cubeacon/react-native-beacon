package com.cubeacon;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;

import org.altbeacon.beacon.Beacon;
import org.altbeacon.beacon.Identifier;
import org.altbeacon.beacon.MonitorNotifier;
import org.altbeacon.beacon.Region;

import java.util.ArrayList;
import java.util.List;

class CBBeaconUtils {
  static String parseState(int state) {
    return state == MonitorNotifier.INSIDE ? "inside" : state == MonitorNotifier.OUTSIDE ? "outside" : "unknown";
  }

  static WritableNativeArray beaconsToArray(List<Beacon> beacons) {
    if (beacons == null) {
      return new WritableNativeArray();
    }
    WritableNativeArray list = new WritableNativeArray();
    for (Beacon beacon : beacons) {
      WritableNativeMap map = beaconToMap(beacon);
      list.pushMap(map);
    }

    return list;
  }

  private static WritableNativeMap beaconToMap(Beacon beacon) {
    WritableNativeMap map = new WritableNativeMap();

    map.putString("uuid", beacon.getId1().toString().toUpperCase());
    map.putInt("major", beacon.getId2().toInt());
    map.putInt("minor", beacon.getId3().toInt());
    map.putInt("rssi", beacon.getRssi());
    map.putInt("txPower", beacon.getTxPower());
    map.putDouble("accuracy", beacon.getDistance());
    map.putString("proximity", distanceToProximity(beacon.getRssi(), beacon.getDistance()));
    map.putString("macAddress", beacon.getBluetoothAddress());

    return map;
  }

  static String distanceToProximity(int rssi, double distance) {
    if (rssi == 0) {
      return "unknown";
    }

    if (distance < 1.0) {
      return "immediate";
    }

    if (distance < 3.0) {
      return "near";
    }

    return "far";
  }

  static WritableNativeMap regionToMap(Region region) {
    WritableNativeMap map = new WritableNativeMap();

    map.putString("identifier", region.getUniqueId());
    if (region.getId1() != null) {
      map.putString("uuid", region.getId1().toString());
    }
    if (region.getId2() != null) {
      map.putInt("major", region.getId2().toInt());
    }
    if (region.getId3() != null) {
      map.putInt("minor", region.getId3().toInt());
    }

    return map;
  }

  static Region regionFromMap(ReadableMap map) {
    String identifier = "";
    List<Identifier> identifiers = new ArrayList<>();

    if (map.getType("identifier") == ReadableType.String) {
      String id = map.getString("identifier");
      if (id != null) {
        identifier = id;
      }
    }

    if (map.hasKey("uuid") && map.getType("uuid") == ReadableType.String) {
      String uuid = map.getString("uuid");
      if (uuid != null) {
        identifiers.add(Identifier.parse(uuid));
      }
    }

    if (map.hasKey("major") && map.getType("major") == ReadableType.Number) {
      identifiers.add(Identifier.fromInt(map.getInt("major")));
    }

    if (map.hasKey("minor") && map.getType("minor") == ReadableType.Number) {
      identifiers.add(Identifier.fromInt(map.getInt("minor")));
    }

    return new Region(identifier, identifiers);
  }
}
