package com.cubeacon;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothManager;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.content.pm.PackageManager;
import android.location.LocationManager;
import android.os.Build;
import android.os.Process;
import android.os.RemoteException;
import android.provider.Settings;
import android.util.Log;
import android.util.SparseArray;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.modules.core.PermissionAwareActivity;
import com.facebook.react.modules.core.PermissionListener;

import org.altbeacon.beacon.Beacon;
import org.altbeacon.beacon.BeaconConsumer;
import org.altbeacon.beacon.BeaconManager;
import org.altbeacon.beacon.BeaconParser;
import org.altbeacon.beacon.MonitorNotifier;
import org.altbeacon.beacon.RangeNotifier;
import org.altbeacon.beacon.Region;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@SuppressWarnings({"unused", "WeakerAccess", "NullableProblems", "FieldCanBeLocal"})
public class CBBeaconModule extends ReactContextBaseJavaModule {
  private static final String TAG = CBBeaconModule.class.getSimpleName();

  private static final int REQUEST_CODE_LOCATION = 1234;
  private static final int REQUEST_CODE_BLUETOOTH = 5678;

  private static final String GRANTED = "authorizedAlways";
  private static final String DENIED = "denied";
  private static final String RESTRICTED = "restricted";

  public static final String EVENT_BLUETOOTH_DID_UPDATE_STATE = "bluetoothDidUpdateState";
  private static final String EVENT_DID_CHANGE_AUTHORIZATION_STATUS = "didChangeAuthorizationStatus";
  private static final String EVENT_ON_BEACON_SERVICE_CONNECT = "onBeaconServiceConnect";
  private static final String EVENT_DID_RANGE_BEACONS = "didRangeBeacons";
  private static final String EVENT_DID_ENTER_REGION = "didEnterRegion";
  private static final String EVENT_DID_EXIT_REGION = "didExitRegion";
  private static final String EVENT_DID_DETERMINE_STATE_FOR_REGION = "didDetermineStateForRegion";

  private static final String KEY_REGION = "region";
  private static final String KEY_STATE = "state";
  private static final String KEY_BEACONS = "beacons";

  private static final BeaconParser IBEACON_LAYOUT = new BeaconParser()
      .setBeaconLayout("m:2-3=0215,i:4-19,i:20-21,i:22-23,p:24-24");

  private final ReactApplicationContext reactContext;
  private final List<Region> regionRanging;
  private final List<Region> regionMonitoring;
  private final SparseArray<Callback> mCallbacks;

  private final BeaconManager beaconManager;
  private final CBBluetoothStateReceiver bluetoothStateReceiver;

  // region CALLBACKS
  private final RangeNotifier rangeNotifier = new RangeNotifier() {
    @Override
    public void didRangeBeaconsInRegion(Collection<Beacon> collection, Region region) {
      WritableMap map = new WritableNativeMap();
      map.putMap(KEY_REGION, CBBeaconUtils.regionToMap(region));
      map.putArray(KEY_BEACONS, CBBeaconUtils.beaconsToArray(new ArrayList<>(collection)));
      sendEvent(EVENT_DID_RANGE_BEACONS, map);
    }
  };

  private final MonitorNotifier monitorNotifier = new MonitorNotifier() {
    @Override
    public void didEnterRegion(Region region) {
      WritableMap map = new WritableNativeMap();
      map.putMap(KEY_REGION, CBBeaconUtils.regionToMap(region));
      sendEvent(EVENT_DID_ENTER_REGION, map);
    }

    @Override
    public void didExitRegion(Region region) {
      WritableMap map = new WritableNativeMap();
      map.putMap(KEY_REGION, CBBeaconUtils.regionToMap(region));
      sendEvent(EVENT_DID_EXIT_REGION, map);
    }

    @Override
    public void didDetermineStateForRegion(int state, Region region) {
      WritableMap map = new WritableNativeMap();
      map.putString(KEY_STATE, CBBeaconUtils.parseState(state));
      map.putMap(KEY_REGION, CBBeaconUtils.regionToMap(region));
      sendEvent(EVENT_DID_DETERMINE_STATE_FOR_REGION, map);
    }
  };

  private final BeaconConsumer beaconConsumer = new BeaconConsumer() {
    @Override
    public void onBeaconServiceConnect() {
      sendEvent(EVENT_ON_BEACON_SERVICE_CONNECT, null);
    }

    @Override
    public Context getApplicationContext() {
      return reactContext.getApplicationContext();
    }

    @Override
    public void unbindService(ServiceConnection serviceConnection) {
      reactContext.unbindService(serviceConnection);
    }

    @Override
    public boolean bindService(Intent intent, ServiceConnection serviceConnection, int i) {
      return reactContext.bindService(intent, serviceConnection, i);
    }
  };

  private final ActivityEventListener activityEventListener = new ActivityEventListener() {
    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
      mCallbacks.get(requestCode).invoke(resultCode);
      mCallbacks.remove(requestCode);
    }

    @Override
    public void onNewIntent(Intent intent) {

    }
  };

  private final PermissionListener permissionListener = new PermissionListener() {
    @Override
    public boolean onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
      if (requestCode != REQUEST_CODE_LOCATION) {
        return false;
      }

      if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
        sendEvent(EVENT_DID_CHANGE_AUTHORIZATION_STATUS, GRANTED);
      } else {
        PermissionAwareActivity activity = getPermissionAwareActivity();
        if (activity.shouldShowRequestPermissionRationale(Manifest.permission.ACCESS_COARSE_LOCATION)) {
          sendEvent(EVENT_DID_CHANGE_AUTHORIZATION_STATUS, DENIED);
        } else {
          sendEvent(EVENT_DID_CHANGE_AUTHORIZATION_STATUS, RESTRICTED);
        }
      }

      return true;
    }
  };
  // endregion

  public CBBeaconModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
    this.regionRanging = new ArrayList<>();
    this.regionMonitoring = new ArrayList<>();
    this.mCallbacks = new SparseArray<>();

    this.beaconManager = BeaconManager.getInstanceForApplication(reactContext);
    this.bluetoothStateReceiver = new CBBluetoothStateReceiver(reactContext);

    this.reactContext.addActivityEventListener(activityEventListener);

  }

  @Override
  public String getName() {
    return "CBBeacon";
  }

  // region REACT METHOD
  @ReactMethod
  public void sampleMethod(String stringArgument, int numberArgument, Callback callback) {
    // TODO: Implement some actually useful functionality
    callback.invoke("Received numberArgument: " + numberArgument + " stringArgument: " + stringArgument);
  }

  @ReactMethod
  public void setup() {
    if (!beaconManager.getBeaconParsers().contains(IBEACON_LAYOUT)) {
      beaconManager.getBeaconParsers().clear();
      beaconManager.getBeaconParsers().add(IBEACON_LAYOUT);
    }

    if (!beaconManager.isBound(beaconConsumer)) {
      this.beaconManager.bind(beaconConsumer);
    }

    beaconManager.removeAllRangeNotifiers();
    beaconManager.addRangeNotifier(rangeNotifier);
    beaconManager.removeAllMonitorNotifiers();
    beaconManager.addMonitorNotifier(monitorNotifier);

    bluetoothStateReceiver.start();
  }

  @ReactMethod
  public void close() {
    if (beaconManager != null) {
      if (!regionMonitoring.isEmpty()) {
        try {
          for (int i = 0; i < regionMonitoring.size(); i++) {
            Region region = regionMonitoring.get(i);
            stopMonitoringBeaconsInRegion(region);
          }
        } catch (RemoteException e) {
          e.printStackTrace();
        }
      }
      beaconManager.removeMonitorNotifier(monitorNotifier);

      if (!regionRanging.isEmpty()) {
        try {
          for (int i = 0; i < regionRanging.size(); i++) {
            Region region = regionRanging.get(i);
            stopRangingBeaconsInRegion(region);
          }
        } catch (RemoteException e) {
          e.printStackTrace();
        }
      }
      beaconManager.removeRangeNotifier(rangeNotifier);

      if (beaconManager.isBound(beaconConsumer)) {
        beaconManager.unbind(beaconConsumer);
      }
    }
    bluetoothStateReceiver.stop();
  }

  @ReactMethod
  public void requestAlwaysAuthorization() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
      sendEvent(EVENT_DID_CHANGE_AUTHORIZATION_STATUS, checkLocationServicesPermission() ? GRANTED : DENIED);
      return;
    }

    if (reactContext.checkSelfPermission(
        Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
      sendEvent(EVENT_DID_CHANGE_AUTHORIZATION_STATUS, GRANTED);
      return;
    }

    try {
      getPermissionAwareActivity().requestPermissions(
          new String[]{Manifest.permission.ACCESS_COARSE_LOCATION},
          REQUEST_CODE_LOCATION,
          permissionListener
      );
    } catch (IllegalStateException e) {
      Log.e(TAG, e.getLocalizedMessage());
    }
  }

  @ReactMethod
  public void requestWhenInUseAuthorization() {
    requestAlwaysAuthorization();
  }

  @ReactMethod
  public void openApplicationSettings() {
    // do nothing
  }

  @ReactMethod
  public void openLocationSettings() {
    Intent intent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS);
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    reactContext.startActivity(intent);
  }

  @ReactMethod
  public void openBluetoothSettings() {
    Intent intent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
    Activity activity = reactContext.getCurrentActivity();
    if (activity == null) {
      return;
    }

    mCallbacks.put(
        REQUEST_CODE_BLUETOOTH,
        new Callback() {
          @Override
          public void invoke(Object... args) {
            Object result = args[0];
            if (result instanceof Integer) {
              if ((Integer) result == Activity.RESULT_OK) {
                sendEvent(EVENT_BLUETOOTH_DID_UPDATE_STATE, "powerOn");
              } else {
                sendEvent(EVENT_BLUETOOTH_DID_UPDATE_STATE, "powerOff");
              }
            } else {
              sendEvent(EVENT_BLUETOOTH_DID_UPDATE_STATE, "unknown");
            }
          }
        });

    reactContext.startActivityForResult(intent, REQUEST_CODE_BLUETOOTH, null);
  }

  @ReactMethod
  public void bluetoothEnabled(Callback callback) {
    callback.invoke(checkBluetoothIfEnabled() ? "powerOn" : "powerOff");
  }

  @ReactMethod
  public void locationServicesEnabled(Callback callback) {
    callback.invoke(checkLocationServicesIfEnabled());
  }

  @ReactMethod
  public void authorizationStatus(Callback callback) {
    callback.invoke(checkLocationServicesPermission() ? GRANTED : DENIED);
  }
  // endregion

  // region CHECKER STATE
  private boolean checkLocationServicesPermission() {
    Context context = reactContext.getBaseContext();

    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
      return reactContext.checkPermission(Manifest.permission.ACCESS_COARSE_LOCATION, Process.myPid(), Process.myUid())
          == PackageManager.PERMISSION_GRANTED;
    }

    return reactContext.checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
  }

  private boolean checkLocationServicesIfEnabled() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      LocationManager locationManager = (LocationManager) reactContext.getSystemService(Context.LOCATION_SERVICE);
      return locationManager != null && locationManager.isLocationEnabled();
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      int mode = Settings.Secure.getInt(reactContext.getContentResolver(), Settings.Secure.LOCATION_MODE,
          Settings.Secure.LOCATION_MODE_OFF);
      return (mode != Settings.Secure.LOCATION_MODE_OFF);
    }

    return true;
  }

  @SuppressLint("MissingPermission")
  private boolean checkBluetoothIfEnabled() {
    BluetoothManager bluetoothManager = (BluetoothManager)
        reactContext.getSystemService(Context.BLUETOOTH_SERVICE);
    if (bluetoothManager == null) {
      throw new RuntimeException("No bluetooth service");
    }

    BluetoothAdapter adapter = bluetoothManager.getAdapter();

    return (adapter != null) && (adapter.isEnabled());
  }
  // endregion

  //region RANGING
  private void startRanging(ReadableMap map) throws RemoteException {
    Region region = CBBeaconUtils.regionFromMap(map);
    if (regionRanging.indexOf(region) != -1) {
      Log.d(TAG, "Already ranged region: " + region);
      return;
    }

    beaconManager.startRangingBeaconsInRegion(region);
    regionRanging.add(region);
  }

  @ReactMethod
  public void startRangingBeaconsInRegion(ReadableMap map) {
    try {
      startRanging(map);
    } catch (RemoteException e) {
      Log.e(TAG, e.getLocalizedMessage());
    }
  }

  @ReactMethod
  public void startRangingBeaconsInRegions(ReadableArray array) {
    try {
      for (int i = 0; i < array.size(); i++) {
        ReadableMap map = array.getMap(i);
        if (map != null) {
          startRanging(map);
        }
      }
    } catch (RemoteException e) {
      Log.e(TAG, e.getLocalizedMessage());
    }
  }

  private void stopRangingBeaconsInRegion(Region region) throws RemoteException {
    beaconManager.stopRangingBeaconsInRegion(region);
    regionRanging.remove(region);
  }

  @ReactMethod
  public void stopRangingBeaconsInRegion(ReadableMap map) {
    try {
      Region region = CBBeaconUtils.regionFromMap(map);
      stopRangingBeaconsInRegion(region);
    } catch (RemoteException e) {
      Log.e(TAG, e.getLocalizedMessage());
    }
  }
  //endregion

  //region MONITORING
  private void startMonitoring(ReadableMap map) throws RemoteException {
    Region region = CBBeaconUtils.regionFromMap(map);
    if (regionMonitoring.indexOf(region) != -1) {
      Log.d(TAG, "Already monitored region: " + region);
      return;
    }

    beaconManager.startMonitoringBeaconsInRegion(region);
    regionMonitoring.add(region);
  }

  @ReactMethod
  public void startMonitoringForRegion(ReadableMap map) {
    try {
      startMonitoring(map);
    } catch (RemoteException e) {
      Log.e(TAG, e.getLocalizedMessage());
    }
  }

  @ReactMethod
  public void startMonitoringForRegions(ReadableArray array) {
    try {
      for (int i = 0; i < array.size(); i++) {
        ReadableMap map = array.getMap(i);
        if (map != null) {
          startMonitoring(map);
        }
      }
    } catch (RemoteException e) {
      Log.e(TAG, e.getLocalizedMessage());
    }
  }

  private void stopMonitoringBeaconsInRegion(Region region) throws RemoteException {
    beaconManager.stopMonitoringBeaconsInRegion(region);
    regionRanging.remove(region);
  }

  @ReactMethod
  public void stopMonitoringForRegion(ReadableMap map) {
    try {
      Region region = CBBeaconUtils.regionFromMap(map);
      stopMonitoringBeaconsInRegion(region);
    } catch (RemoteException e) {
      Log.e(TAG, e.getLocalizedMessage());
    }
  }
  // endregion

  // region HELPERS
  private void sendEvent(String eventName, Object object) {
    if (reactContext.hasActiveCatalystInstance()) {
      reactContext
          .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
          .emit(eventName, object);
    }
  }

  private PermissionAwareActivity getPermissionAwareActivity() {
    Activity activity = getCurrentActivity();
    if (activity == null) {
      throw new IllegalStateException(
          "Tried to use permissions API while not attached to an Activity.");
    } else if (!(activity instanceof PermissionAwareActivity)) {
      throw new IllegalStateException(
          "Tried to use permissions API but the host Activity doesn't"
              + " implement PermissionAwareActivity.");
    }
    return (PermissionAwareActivity) activity;
  }
  // endregion
}
