package com.cubeacon;

import android.annotation.SuppressLint;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;

class CBBluetoothStateReceiver extends BroadcastReceiver {
  private ReactContext context;

  public CBBluetoothStateReceiver(ReactContext context) {
    this.context = context;
  }

  @Override
  public void onReceive(Context context, Intent intent) {
    final String action = intent.getAction();

    if (BluetoothAdapter.ACTION_STATE_CHANGED.equals(action)) {
      final int state = intent.getIntExtra(BluetoothAdapter.EXTRA_STATE, BluetoothAdapter.ERROR);
      sendState(state);
    }
  }

  private void sendState(int state) {
    switch (state) {
      case BluetoothAdapter.STATE_OFF:
        sendEvent("powerOff");
        break;
      case BluetoothAdapter.STATE_TURNING_OFF:
      case BluetoothAdapter.STATE_TURNING_ON:
        break;
      case BluetoothAdapter.STATE_ON:
        sendEvent("powerOn");
        break;
      default:
        sendEvent("unknown");
        break;
    }
  }

  private void sendEvent(Object object) {
    if (context.hasActiveCatalystInstance()) {
      context
          .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
          .emit(CBBeaconModule.EVENT_BLUETOOTH_DID_UPDATE_STATE, object);
    }
  }

  @SuppressLint("MissingPermission")
  public void start() {
    int state = BluetoothAdapter.STATE_OFF;

    BluetoothManager bluetoothManager = (BluetoothManager)
        context.getSystemService(Context.BLUETOOTH_SERVICE);
    if (bluetoothManager != null) {
      BluetoothAdapter adapter = bluetoothManager.getAdapter();
      if (adapter == null) {
        sendEvent("unsupported");
        return;
      }

      state = adapter.getState();
    }
    this.sendState(state);

    IntentFilter filter = new IntentFilter(BluetoothAdapter.ACTION_STATE_CHANGED);
    context.registerReceiver(this, filter);
  }

  public void stop() {
    context.unregisterReceiver(this);
  }
}
