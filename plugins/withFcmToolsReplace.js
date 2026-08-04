/* eslint-env node */
const { withAndroidManifest } = require('@expo/config-plugins');

function upsertMetaData(application, name, attrs) {
  if (!application['meta-data']) application['meta-data'] = [];
  const items = application['meta-data'];
  const index = items.findIndex(
    (it) => it?.$?.['android:name'] === name,
  );
  const meta = {
    $: {
      'android:name': name,
      ...attrs,
    },
  };
  if (index >= 0) {
    items[index] = meta;
  } else {
    items.push(meta);
  }
}

const withFcmToolsReplace = (config) =>
  withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest ?? config.modResults;

    // Ensure tools namespace on <manifest>
    manifest.$ = manifest.$ || {};
    manifest.$['xmlns:tools'] = manifest.$['xmlns:tools'] || 'http://schemas.android.com/tools';

    const application = manifest.application?.[0];
    if (!application) return config;

    // Ensure the three FCM defaults with tools:replace
    upsertMetaData(
      application,
      'com.google.firebase.messaging.default_notification_channel_id',
      {
        'android:value': 'default',
        'tools:replace': 'android:value',
      },
    );

    upsertMetaData(
      application,
      'com.google.firebase.messaging.default_notification_color',
      {
        'android:resource': '@color/notification_icon_color',
        'tools:replace': 'android:resource',
      },
    );

    upsertMetaData(
      application,
      'com.google.firebase.messaging.default_notification_icon',
      {
        'android:resource': '@drawable/notification_icon',
        'tools:replace': 'android:resource',
      },
    );

    return config;
  });

module.exports = withFcmToolsReplace;



