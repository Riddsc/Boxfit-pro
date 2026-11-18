package com.riddsc.boxfitpro;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Handler;
import android.os.Looper;

/** Toma una lectura del sensor de pasos cada ~15 minutos y vuelve a programarse al reiniciar el teléfono. */
public class StepAlarm extends BroadcastReceiver {
    static final String TICK = "com.riddsc.boxfitpro.STEP_TICK";

    @Override
    public void onReceive(Context ctx, Intent intent) {
        final Context c = ctx.getApplicationContext();
        if (!StepStore.active(c)) return;
        String a = intent.getAction();
        if (!TICK.equals(a)) StepStore.schedule(c);   // arranque del teléfono o app actualizada
        if (!StepStore.granted(c)) return;
        sample(c, goAsync());
    }

    /** Lee el sensor una vez; si no responde en 5 s, se rinde sin tocar nada. */
    static void sample(final Context c, final PendingResult pr) {
        final SensorManager sm = (SensorManager) c.getSystemService(Context.SENSOR_SERVICE);
        final Sensor s = sm == null ? null : sm.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);
        if (s == null) { if (pr != null) pr.finish(); return; }
        final boolean[] done = { false };
        final Handler hd = new Handler(Looper.getMainLooper());
        final SensorEventListener l = new SensorEventListener() {
            @Override public void onSensorChanged(SensorEvent e) {
                if (done[0]) return; done[0] = true;
                sm.unregisterListener(this);
                StepStore.add(c, Math.round(e.values[0]), System.currentTimeMillis());
                if (pr != null) pr.finish();
            }
            @Override public void onAccuracyChanged(Sensor sensor, int x) {}
        };
        sm.registerListener(l, s, SensorManager.SENSOR_DELAY_NORMAL);
        hd.postDelayed(() -> { if (done[0]) return; done[0] = true; sm.unregisterListener(l); if (pr != null) pr.finish(); }, 5000);
    }
}
