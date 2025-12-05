import React from 'react';
import { View, ViewProps, Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { cn } from '@/lib/utils';

interface GlassContainerProps extends ViewProps {
    intensity?: number;
    tint?: 'light' | 'dark' | 'default';
    className?: string;
}

export const GlassContainer: React.FC<GlassContainerProps> = ({
    children,
    intensity = 20,
    tint = 'light',
    className,
    style,
    ...props
}) => {
    if (Platform.OS === 'android') {
        // Fallback for Android which might have issues with BlurView in some versions/devices
        // or if we want a simpler transparency effect
        return (
            <View
                style={[
                    { backgroundColor: tint === 'dark' ? 'rgba(20, 20, 20, 0.9)' : 'rgba(255, 255, 255, 0.85)' },
                    style
                ]}
                className={cn("overflow-hidden", className)}
                {...props}
            >
                {children}
            </View>
        );
    }

    return (
        <BlurView
            intensity={intensity}
            tint={tint}
            style={style}
            className={cn("overflow-hidden", className)}
            {...props}
        >
            {children}
        </BlurView>
    );
};
