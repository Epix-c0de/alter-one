import { Stack } from 'expo-router';
import React from 'react';

export default function JuniorAdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="upload-readings" />
      <Stack.Screen name="upload-hymns" />
      <Stack.Screen name="upload-songs" />
    </Stack>
  );
}
