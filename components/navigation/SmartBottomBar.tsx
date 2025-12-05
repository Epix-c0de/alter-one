import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    withSpring
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';

import { GlassContainer } from './GlassContainer';
import { TabItem } from './TabItem';
import { useNavigationStore } from '@/store/navigationStore';
import { NAVIGATION_MODES } from '@/constants/navigation';

const { width } = Dimensions.get('window');

export const SmartBottomBar: React.FC = () => {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const pathname = usePathname();

    const { currentMode, activeTabId, setActiveTab, isTabBarVisible } = useNavigationStore();
    const modeConfig = NAVIGATION_MODES[currentMode];

    const translateY = useSharedValue(0);
    const opacity = useSharedValue(1);

    useEffect(() => {
        // Animate visibility
        translateY.value = withTiming(isTabBarVisible ? 0 : 100, { duration: 300 });
        opacity.value = withTiming(isTabBarVisible ? 1 : 0, { duration: 300 });
    }, [isTabBarVisible]);

    // Sync active tab with route if in default mode
    useEffect(() => {
        if (currentMode === 'default') {
            const routeName = pathname.split('/').pop();
            if (routeName && ['home', 'bible', 'prayers', 'mass', 'profile'].includes(routeName)) {
                setActiveTab(routeName);
            }
        }
    }, [pathname, currentMode]);

    const handleTabPress = (tabId: string, route?: string) => {
        setActiveTab(tabId);
        if (route) {
            router.push(route as any);
        }
    };

    const containerStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    if (!modeConfig) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                containerStyle,
                { paddingBottom: insets.bottom }
            ]}
        >
            <GlassContainer
                intensity={30}
                tint={modeConfig.theme.blurTint}
                className="mx-4 mb-2 rounded-[25px] border border-white/20 shadow-lg"
                style={{ backgroundColor: modeConfig.theme.background }}
            >
                <View className="flex-row items-center justify-between px-2 py-2">
                    {modeConfig.tabs.map((tab) => (
                        <TabItem
                            key={tab.id}
                            tab={tab}
                            isActive={activeTabId === tab.id}
                            activeColor={modeConfig.theme.primary}
                            onPress={() => handleTabPress(tab.id, tab.route)}
                        />
                    ))}
                </View>
            </GlassContainer>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
});
