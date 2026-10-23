package com.riddsc.boxfitpro;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Plugin propio para mantener la pantalla encendida mientras corre el timer
        registerPlugin(KeepAwakePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
