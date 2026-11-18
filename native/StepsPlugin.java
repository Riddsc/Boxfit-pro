package com.riddsc.boxfitpro;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
import android.os.SystemClock;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

/**
 * Contador de pasos del teléfono (sensor TYPE_STEP_COUNTER).
 * El sensor da los pasos acumulados desde que se encendió el teléfono;
 * la app guarda la última lectura y suma la diferencia (js/sf-core.js).
 */
@CapacitorPlugin(
    name = "Steps",
    permissions = { @Permission(strings = { Manifest.permission.ACTIVITY_RECOGNITION }, alias = "activity") }
)
public class StepsPlugin extends Plugin {

    private Sensor sensor() {
        SensorManager sm = (SensorManager) getContext().getSystemService(Context.SENSOR_SERVICE);
        return sm == null ? null : sm.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);
    }

    private boolean granted() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) return true;
        return getPermissionState("activity") == PermissionState.GRANTED;
    }

    @PluginMethod
    public void available(PluginCall call) {
        JSObject r = new JSObject();
        r.put("available", sensor() != null);
        call.resolve(r);
    }

    @Override
    @PluginMethod
    public void requestPermissions(PluginCall call) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q || granted()) {
            JSObject r = new JSObject(); r.put("activity", "granted"); call.resolve(r); return;
        }
        requestPermissionForAlias("activity", call, "permCb");
    }

    @PermissionCallback
    private void permCb(PluginCall call) {
        JSObject r = new JSObject();
        r.put("activity", granted() ? "granted" : "denied");
        call.resolve(r);
    }

    @PluginMethod
    public void read(PluginCall call) {
        Sensor s = sensor();
        if (s == null || !granted()) { JSObject r = new JSObject(); r.put("steps", -1); call.resolve(r); return; }
        final SensorManager sm = (SensorManager) getContext().getSystemService(Context.SENSOR_SERVICE);
        final boolean[] done = { false };
        final SensorEventListener l = new SensorEventListener() {
            @Override public void onSensorChanged(SensorEvent e) {
                if (done[0]) return; done[0] = true;
                sm.unregisterListener(this);
                JSObject r = new JSObject();
                if (StepStore.active(getContext())) StepStore.add(getContext(), Math.round(e.values[0]), System.currentTimeMillis());
                r.put("steps", Math.round(e.values[0]));
                r.put("boot", System.currentTimeMillis() - SystemClock.elapsedRealtime());
                call.resolve(r);
            }
            @Override public void onAccuracyChanged(Sensor sensor, int a) {}
        };
        sm.registerListener(l, s, SensorManager.SENSOR_DELAY_FASTEST);
        // Si el sensor no responde en 4 s, se devuelve sin dato
        new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(() -> {
            if (done[0]) return; done[0] = true;
            sm.unregisterListener(l);
            JSObject r = new JSObject(); r.put("steps", -1); call.resolve(r);
        }, 4000);
    }

    /** Activa el registro automático en segundo plano (sobrevive a cerrar la app y a reiniciar el teléfono). */
    @PluginMethod
    public void start(PluginCall call) {
        if (sensor() == null || !granted()) { JSObject r = new JSObject(); r.put("active", false); call.resolve(r); return; }
        StepStore.start(getContext());
        read(call);   // primera lectura: queda como punto de partida
    }

    @PluginMethod
    public void stop(PluginCall call) {
        StepStore.stop(getContext());
        call.resolve();
    }

    /** Historial guardado por el registro automático: { active, days:{fecha:pasos}, hours:{fecha:[24]} }. */
    @PluginMethod
    public void history(PluginCall call) {
        try { call.resolve(JSObject.fromJSONObject(StepStore.history(getContext()))); }
        catch (Exception e) { call.resolve(new JSObject()); }
    }

    /** Abre los ajustes de batería para que el teléfono no frene el conteo con la app cerrada. */
    @PluginMethod
    public void openBattery(PluginCall call) {
        android.content.Context c = getContext();
        try {
            android.content.Intent i = new android.content.Intent(android.provider.Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
            i.setData(android.net.Uri.parse("package:" + c.getPackageName()));
            i.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
            c.startActivity(i);
        } catch (Exception e) {
            try {
                android.content.Intent i = new android.content.Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                i.setData(android.net.Uri.parse("package:" + c.getPackageName()));
                i.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                c.startActivity(i);
            } catch (Exception ignored) {}
        }
        call.resolve();
    }

    /** Dice si el teléfono ya deja trabajar a la app sin restricciones de batería. */
    @PluginMethod
    public void batteryOk(PluginCall call) {
        JSObject r = new JSObject();
        android.os.PowerManager pm = (android.os.PowerManager) getContext().getSystemService(android.content.Context.POWER_SERVICE);
        r.put("ok", pm == null || pm.isIgnoringBatteryOptimizations(getContext().getPackageName()));
        call.resolve(r);
    }
}
