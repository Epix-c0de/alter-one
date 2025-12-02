import { Stack } from 'expo-router';
import React from 'react';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="manage-archdiocese" />
      <Stack.Screen name="manage-parishes" />
      <Stack.Screen name="manage-local-churches" />
    </Stack>
  );
}
