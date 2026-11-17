package com.riddsc.boxfitpro;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.view.View;
import android.widget.RemoteViews;
import org.json.JSONObject;

/** Widget de Satronho BoxFit: racha, calorías activas, minutos, pasos y agua del día. */
public class BoxFitWidget extends AppWidgetProvider {
    public static final String PREFS = "sf_widget";

    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        JSONObject d;
        try {
            d = new JSONObject(ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString("data", "{}"));
        } catch (Exception e) {
            d = new JSONObject();
        }
        for (int id : ids) {
            RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.sf_widget);
            boolean light = d.optBoolean("light", false);
            v.setInt(R.id.sfw_root, "setBackgroundResource", light ? R.drawable.sf_widget_bg_light : R.drawable.sf_widget_bg);
            int txt = light ? Color.parseColor("#1c1a22") : Color.WHITE;
            int dim = light ? Color.parseColor("#6b6577") : Color.parseColor("#a1a1aa");
            v.setTextViewText(R.id.sfw_streak, "🔥 " + d.optInt("streak", 0));
            v.setTextColor(R.id.sfw_streak, txt);
            v.setTextViewText(R.id.sfw_title, d.optString("title", "Satronho BoxFit"));
            v.setTextColor(R.id.sfw_title, dim);
            row(v, d, "kcal", R.id.sfw_kcal_box, R.id.sfw_kcal, R.id.sfw_kcal_bar, txt);
            row(v, d, "min", R.id.sfw_min_box, R.id.sfw_min, R.id.sfw_min_bar, txt);
            row(v, d, "steps", R.id.sfw_steps_box, R.id.sfw_steps, R.id.sfw_steps_bar, txt);
            row(v, d, "water", R.id.sfw_water_box, R.id.sfw_water, R.id.sfw_water_bar, txt);
            v.setViewVisibility(R.id.sfw_streak, d.optBoolean("showStreak", true) ? View.VISIBLE : View.GONE);
            Intent open = new Intent(ctx, MainActivity.class);
            open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            PendingIntent pi = PendingIntent.getActivity(ctx, 0, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            v.setOnClickPendingIntent(R.id.sfw_root, pi);
            mgr.updateAppWidget(id, v);
        }
    }

    private static void row(RemoteViews v, JSONObject d, String k, int box, int label, int bar, int txt) {
        JSONObject r = d.optJSONObject(k);
        if (r == null || !r.optBoolean("on", true)) { v.setViewVisibility(box, View.GONE); return; }
        v.setViewVisibility(box, View.VISIBLE);
        v.setTextViewText(label, r.optString("t", ""));
        v.setTextColor(label, txt);
        v.setProgressBar(bar, 100, Math.max(0, Math.min(100, r.optInt("p", 0))), false);
    }
}
