# Agrega al AndroidManifest de Capacitor: permisos de pasos y notificaciones,
# y el enlace satronhoboxfit:// que usa Satronho Somnia para devolver el sueño.
import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
perms = ['android.permission.ACTIVITY_RECOGNITION', 'android.permission.POST_NOTIFICATIONS', 'android.permission.SCHEDULE_EXACT_ALARM', 'android.permission.RECEIVE_BOOT_COMPLETED']
add = ''.join(f'    <uses-permission android:name="{x}" />\n' for x in perms if x not in s)
add += '    <uses-feature android:name="android.hardware.sensor.stepcounter" android:required="false" />\n'
add += '    <queries><intent><action android:name="android.intent.action.VIEW" /><data android:scheme="satronhosomnia" /></intent></queries>\n'
s = s.replace('</manifest>', add + '</manifest>')
link = '''            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="satronhoboxfit" />
            </intent-filter>
'''
i = s.index('</activity>')
s = s[:i] + link + s[i:]
if 'android:launchMode' not in s:
    s = s.replace('android:name=".MainActivity"', 'android:name=".MainActivity"\n            android:launchMode="singleTask"', 1)
open(p, 'w', encoding='utf-8').write(s)
print('Manifest listo')
