import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CustomSplashScreen from '@/components/SplashScreen';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LocationProvider } from '@/context/LocationContext';

const queryClient = new QueryClient();

import SessionDetection from '@/components/SessionDetection';

const InitialLayout = () => {
  const { session, loading, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inTabsGroup = segments[0] === '(tabs)';
    const inAdminGroup = segments[0] === '(admin)';

    // This is a simplified role check. In production, you'd have more robust logic.
    const isAdmin = user?.role === 'admin';

    if (session && !inTabsGroup && !inAdminGroup) {
      if (isAdmin) {
        router.replace('/(admin)/manage-archdiocese');
      } else {
        router.replace('/(tabs)/home');
      }
    } else if (!session) {
      router.replace('/(auth)/login');
    }
  }, [session, loading, segments, router, user]);

  return (
    <>
      <Stack screenOptions={{ headerBackTitle: 'Back', headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(admin)" />
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
