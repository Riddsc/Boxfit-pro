package com.riddsc.boxfitpro;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Plugin propio para mantener la pantalla encendida mientras corre el timer
        registerPlugin(KeepAwakePlugin.class);
        // Contador de pasos del teléfono (Satronho BoxFit 4)
        registerPlugin(StepsPlugin.class);
        // Widget de la pantalla de inicio del teléfono
        registerPlugin(WidgetPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
