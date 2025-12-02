import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import React, { useEffect, useRef } from 'react';
import Colors from '@/constants/colors';

// This is a placeholder for the splash screen image/video uploaded by the admin
const SPLASH_BACKGROUND = 'https://images.unsplash.com/photo-1579959288109-9363a3d5b736';

const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <View style={styles.container}>
      <Image source={{ uri: SPLASH_BACKGROUND }} style={StyleSheet.absoluteFill} />
      <Animated.View style={{ ...StyleSheet.absoluteFillObject, opacity: fadeAnim }}>
        <BlurView intensity={50} tint="dark" style={styles.blurContainer}>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradient}
          />
          <View style={styles.logoContainer}>
            {/* Placeholder for Admin-uploaded logo */}
            <Image source={require('@/assets/images/icon.png')} style={styles.logo} />
            {/* Placeholder for Admin-editable app name */}
            <Text style={styles.appName}>EpixChurch</Text>
          </View>
        </BlurView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: '40%',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.light.surface,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
});

export default SplashScreen;
