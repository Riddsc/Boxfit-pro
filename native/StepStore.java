package com.riddsc.boxfitpro;

import android.Manifest;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.SystemClock;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.Iterator;
import java.util.Locale;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Guarda los pasos del teléfono hora por hora aunque la app esté cerrada (como Google Fit).
 * El sensor TYPE_STEP_COUNTER cuenta en el chip del teléfono casi sin gastar batería;
 * cada ~15 minutos (o cuando el teléfono despierta) se toma una lectura y se reparte la diferencia por horas.
 */
final class StepStore {
    static final String P = "sf_steps_native";
    private static final long H = 3600000L, DAY = 86400000L;

    private StepStore() {}

    static boolean granted(Context c) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) return true;
        return c.checkSelfPermission(Manifest.permission.ACTIVITY_RECOGNITION) == PackageManager.PERMISSION_GRANTED;
    }

    static boolean active(Context c) { return c.getSharedPreferences(P, 0).getBoolean("on", false); }

    private static String day(long t) { return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date(t)); }

    private static int hour(long t) { Calendar k = Calendar.getInstance(); k.setTimeInMillis(t); return k.get(Calendar.HOUR_OF_DAY); }

    private static long hourStart(long t) {
        Calendar k = Calendar.getInstance(); k.setTimeInMillis(t);
        k.set(Calendar.MINUTE, 0); k.set(Calendar.SECOND, 0); k.set(Calendar.MILLISECOND, 0);
        return k.getTimeInMillis();
    }

    private static JSONObject obj(SharedPreferences sp, String k) {
        try { return new JSONObject(sp.getString(k, "{}")); } catch (Exception e) { return new JSONObject(); }
    }

    /** Suma una lectura del sensor (pasos acumulados desde que se encendió el teléfono). */
    static synchronized void add(Context c, long counter, long now) {
        SharedPreferences sp = c.getSharedPreferences(P, 0);
        long last = sp.getLong("last", -1), lastTs = sp.getLong("lastTs", 0);
        long boot = now - SystemClock.elapsedRealtime();
        long delta = 0, from = now;
        if (last >= 0) {
            if (counter >= last && lastTs > boot - 60000) { delta = counter - last; from = lastTs; }
            else { delta = counter; from = Math.max(boot, lastTs); }   // el teléfono se reinició
        }
        if (delta < 0 || delta > 100000) delta = 0;
        from = Math.max(from, now - 3 * DAY);
        JSONObject days = obj(sp, "days"), hours = obj(sp, "hours");
        try {
            if (delta > 0) {
                long span = Math.max(1, now - from);
                double left = delta;
                long t = from;
                while (t < now) {
                    long end = Math.min(now, hourStart(t) + H);
                    double part = delta * (double) (end - t) / span;
                    if (end >= now) part = left;
                    left -= part;
                    String d = day(t);
                    days.put(d, days.optDouble(d, 0) + part);
                    JSONArray hs = hours.optJSONArray(d);
                    if (hs == null) { hs = new JSONArray(); for (int i = 0; i < 24; i++) hs.put(0); hours.put(d, hs); }
                    int h = hour(t);
                    hs.put(h, hs.optDouble(h, 0) + part);
                    t = end;
                }
            }
            trim(days, 400); trim(hours, 21);
        } catch (Exception ignored) {}
        sp.edit().putLong("last", counter).putLong("lastTs", now)
            .putString("days", days.toString()).putString("hours", hours.toString()).apply();
        refreshWidget(c, Math.round(days.optDouble(day(now), 0)));
    }

    private static void trim(JSONObject o, int keep) {
        ArrayList<String> ks = new ArrayList<>();
        Iterator<String> it = o.keys(); while (it.hasNext()) ks.add(it.next());
        if (ks.size() <= keep) return;
        Collections.sort(ks);
        for (int i = 0; i < ks.size() - keep; i++) o.remove(ks.get(i));
    }

    static JSONObject history(Context c) {
        SharedPreferences sp = c.getSharedPreferences(P, 0);
        JSONObject r = new JSONObject();
        try {
            r.put("active", sp.getBoolean("on", false));
            r.put("days", obj(sp, "days"));
            r.put("hours", obj(sp, "hours"));
            r.put("lastTs", sp.getLong("lastTs", 0));
        } catch (Exception ignored) {}
        return r;
    }

    private static PendingIntent alarmIntent(Context c) {
        Intent i = new Intent(c, StepAlarm.class).setAction(StepAlarm.TICK);
        return PendingIntent.getBroadcast(c, 4317, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    /** Programa la lectura periódica. No despierta al teléfono: se hace cuando ya está despierto. */
    static void schedule(Context c) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        am.setInexactRepeating(AlarmManager.ELAPSED_REALTIME, SystemClock.elapsedRealtime() + AlarmManager.INTERVAL_FIFTEEN_MINUTES,
            AlarmManager.INTERVAL_FIFTEEN_MINUTES, alarmIntent(c));
    }

    static void start(Context c) {
        c.getSharedPreferences(P, 0).edit().putBoolean("on", true).apply();
        schedule(c);
    }

    static void stop(Context c) {
        c.getSharedPreferences(P, 0).edit().putBoolean("on", false).remove("last").remove("lastTs").apply();
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (am != null) am.cancel(alarmIntent(c));
    }

    /** Pone al día la fila de pasos del widget sin abrir la app. */
    static void refreshWidget(Context c, long today) {
        try {
            SharedPreferences wp = c.getSharedPreferences(BoxFitWidget.PREFS, Context.MODE_PRIVATE);
            JSONObject d = new JSONObject(wp.getString("data", "{}"));
            JSONObject s = d.optJSONObject("steps");
            if (s == null || !s.has("goal")) return;
            long base = s.optString("day").equals(day(System.currentTimeMillis())) ? s.optLong("manual", 0) : 0;
            long val = Math.max(today, base), goal = Math.max(1, s.optLong("goal", 8000));
            NumberFormat nf = NumberFormat.getIntegerInstance();
            s.put("t", s.optString("label", "Pasos") + " " + nf.format(val) + " / " + nf.format(goal));
            s.put("p", (int) Math.min(100, val * 100 / goal));
            wp.edit().putString("data", d.toString()).apply();
            Intent i = new Intent(c, BoxFitWidget.class).setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
            int[] ids = AppWidgetManager.getInstance(c).getAppWidgetIds(new ComponentName(c, BoxFitWidget.class));
            if (ids.length == 0) return;
            i.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
            c.sendBroadcast(i);
        } catch (Exception ignored) {}
    }
}
