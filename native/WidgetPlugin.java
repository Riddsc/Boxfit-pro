package com.riddsc.boxfitpro;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Guarda lo que muestra el widget de la pantalla de inicio y lo actualiza. */
@CapacitorPlugin(name = "SFWidget")
public class WidgetPlugin extends Plugin {
    @PluginMethod
    public void update(PluginCall call) {
        Context ctx = getContext();
        String data = call.getString("data", "{}");
        SharedPreferences p = ctx.getSharedPreferences(BoxFitWidget.PREFS, Context.MODE_PRIVATE);
        p.edit().putString("data", data).apply();
        Intent i = new Intent(ctx, BoxFitWidget.class);
        i.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        int[] ids = AppWidgetManager.getInstance(ctx).getAppWidgetIds(new ComponentName(ctx, BoxFitWidget.class));
        i.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        ctx.sendBroadcast(i);
        JSObject r = new JSObject();
        r.put("widgets", ids.length);
        call.resolve(r);
    }
}
