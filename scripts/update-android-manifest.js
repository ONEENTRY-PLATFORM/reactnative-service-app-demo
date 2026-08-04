#!/usr/bin/env node
/* eslint-env node */
/*
 Updates AndroidManifest meta-data for FCM defaults to include tools:replace attributes.
 - Ensures xmlns:tools is present on <manifest>
 - Replaces the three FCM meta-data entries with canonical forms
 - Idempotent: safe to run multiple times
*/

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const manifestPaths = [
  path.join(
    projectRoot,
    'android',
    'app',
    'src',
    'main',
    'AndroidManifest.xml',
  ),
  path.join(
    projectRoot,
    'android',
    'app',
    'src',
    'debug',
    'AndroidManifest.xml',
  ),
];

function ensureToolsNamespace(xml) {
  if (xml.includes('xmlns:tools="http://schemas.android.com/tools"')) {
    return xml;
  }
  return xml.replace(/<manifest(\s[^>]*)?>/, (match) =>
    match.replace('>', ' xmlns:tools="http://schemas.android.com/tools">'),
  );
}

function replaceMetaData(xml) {
  // Replace channel id meta-data
  const channelIdPattern = /<meta-data[^>]*android:name="com\.google\.firebase\.messaging\.default_notification_channel_id"[^>]*\/>/g;
  const channelIdReplacement = '    <meta-data tools:replace="android:value" android:name="com.google.firebase.messaging.default_notification_channel_id" android:value="default"/>';
  if (channelIdPattern.test(xml)) {
    xml = xml.replace(channelIdPattern, channelIdReplacement);
  }

  // Replace default color meta-data
  const colorPattern = /<meta-data[^>]*android:name="com\.google\.firebase\.messaging\.default_notification_color"[^>]*\/>/g;
  const colorReplacement = '    <meta-data tools:replace="android:resource" android:name="com.google.firebase.messaging.default_notification_color" android:resource="@color/notification_icon_color"/>';
  if (colorPattern.test(xml)) {
    xml = xml.replace(colorPattern, colorReplacement);
  }

  // Replace default icon meta-data
  const iconPattern = /<meta-data[^>]*android:name="com\.google\.firebase\.messaging\.default_notification_icon"[^>]*\/>/g;
  const iconReplacement = '    <meta-data tools:replace="android:resource" android:name="com.google.firebase.messaging.default_notification_icon" android:resource="@drawable/notification_icon"/>';
  if (iconPattern.test(xml)) {
    xml = xml.replace(iconPattern, iconReplacement);
  }

  return xml;
}

function processManifest(filePath) {
  if (!fs.existsSync(filePath)) return false;
  const original = fs.readFileSync(filePath, 'utf8');
  let xml = original;
  xml = ensureToolsNamespace(xml);
  xml = replaceMetaData(xml);
  if (xml !== original) {
    fs.writeFileSync(filePath, xml, 'utf8');
    return true;
  }
  return false;
}

let changed = false;
for (const p of manifestPaths) {
  try {
    const didChange = processManifest(p);
    if (didChange) {
      // eslint-disable-next-line no-console
      console.log(`Updated: ${p}`);
      changed = true;
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`Failed to update ${p}:`, e.message);
    process.exitCode = 1;
  }
}

if (!changed) {
  // eslint-disable-next-line no-console
  console.log('No changes needed. Manifests are already up to date.');
}


