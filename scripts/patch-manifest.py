# Agrega al AndroidManifest de Capacitor: permisos de pasos y notificaciones,
# y el enlace satronhoboxfit:// que usa Satronho Somnia para devolver el sueño.
import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
perms = ['android.permission.ACTIVITY_RECOGNITION', 'android.permission.POST_NOTIFICATIONS', 'android.permission.SCHEDULE_EXACT_ALARM', 'android.permission.RECEIVE_BOOT_COMPLETED',
         'android.permission.CAMERA',  # pulso con la cámara y el flash
         # Health Connect (solo lectura): pasos y pulso del reloj u otras apps
         'android.permission.health.READ_STEPS', 'android.permission.health.READ_HEART_RATE', 'android.permission.health.READ_RESTING_HEART_RATE']
add = ''.join(f'    <uses-permission android:name="{x}" />\n' for x in perms if x not in s)
add += '    <uses-feature android:name="android.hardware.sensor.stepcounter" android:required="false" />\n'
add += '    <uses-feature android:name="android.hardware.camera" android:required="false" />\n    <uses-feature android:name="android.hardware.camera.flash" android:required="false" />\n'
add += '    <queries><intent><action android:name="android.intent.action.VIEW" /><data android:scheme="satronhosomnia" /></intent><package android:name="com.google.android.apps.healthdata" /></queries>\n'
s = s.replace('</manifest>', add + '</manifest>')
link = '''            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="satronhoboxfit" />
            </intent-filter>
'''
link += '''            <intent-filter><action android:name="androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE" /></intent-filter>
'''
i = s.index('</activity>')
s = s[:i] + link + s[i:]
# Health Connect (Android 14+) busca esta actividad para explicar el uso de los datos
extra = '''        <activity-alias android:name="ViewPermissionUsageActivity" android:exported="true" android:targetActivity=".MainActivity" android:permission="android.permission.START_VIEW_PERMISSION_USAGE">
            <intent-filter><action android:name="android.intent.action.VIEW_PERMISSION_USAGE" /><category android:name="android.intent.category.HEALTH_PERMISSIONS" /></intent-filter>
        </activity-alias>
        <receiver android:name=".BoxFitWidget" android:exported="false" android:label="Satronho BoxFit">
            <intent-filter><action android:name="android.appwidget.action.APPWIDGET_UPDATE" /></intent-filter>
            <meta-data android:name="android.appwidget.provider" android:resource="@xml/sf_widget_info" />
        </receiver>
'''
i = s.index('</activity>') + len('</activity>\n')
s = s[:i] + extra + s[i:]
if 'android:launchMode' not in s:
    s = s.replace('android:name=".MainActivity"', 'android:name=".MainActivity"\n            android:launchMode="singleTask"', 1)
open(p, 'w', encoding='utf-8').write(s)
print('Manifest listo')
