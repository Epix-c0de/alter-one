import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CustomSplashScreen from '@/components/SplashScreen';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LocationProvider } from '@/context/LocationContext';

import SessionDetection from '@/components/SessionDetection';

const queryClient = new QueryClient();

const InitialLayout = () => {
  const { session, loading, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inTabsGroup = segments[0] === '(tabs)';
    const inAdminGroup = segments[0] === '(admin)';
    const inJuniorAdminGroup = segments[0] === '(junior-admin)';
    const inAuthGroup = segments[0] === '(auth)';

    // Role-based checks
    const isMasterAdmin = user?.role === 'admin';
    const isJuniorAdmin = user?.role === 'junior_admin';

    // If user is authenticated and is an admin, redirect to appropriate admin dashboard
    if (session && isMasterAdmin && !inAdminGroup) {
      router.replace('/(admin)');
    } else if (session && isJuniorAdmin && !inJuniorAdminGroup) {
      router.replace('/(junior-admin)');
    } else if (session && !isMasterAdmin && !isJuniorAdmin && !inTabsGroup && !inAuthGroup) {
      // Regular authenticated user - go to tabs
      router.replace('/(tabs)/home');
    }
    // Guest users (no session) can stay wherever they are - no forced redirect to login
  }, [session, loading, segments, router, user]);

  return (
    <>
      <Stack screenOptions={{ headerBackTitle: 'Back', headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="(junior-admin)" />
        <Stack.Screen name="capture-song" options={{ presentation: 'modal' }} />
        <Stack.Screen name="+not-found" options={{ headerShown: true, title: 'Not Found' }} />
      </Stack>
      <SessionDetection />
    </>
  );
};

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Keep the splash screen visible while we fetch resources
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return <CustomSplashScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LocationProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <InitialLayout />
          </GestureHandlerRootView>
        </LocationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
