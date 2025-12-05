import React, { useEffect } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    interpolateColor
} from 'react-native-reanimated';
import { TabConfig } from '@/constants/navigation';
import { cn } from '@/lib/utils';

interface TabItemProps {
    tab: TabConfig;
    isActive: boolean;
    onPress: () => void;
    activeColor: string;
}

export const TabItem: React.FC<TabItemProps> = ({ tab, isActive, onPress, activeColor }) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.6);

    useEffect(() => {
        scale.value = withSpring(isActive ? 1.1 : 1, { damping: 12 });
        opacity.value = withTiming(isActive ? 1 : 0.6, { duration: 200 });
    }, [isActive]);

    const animatedIconStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const Icon = tab.icon;

    return (
        <TouchableOpacity
            onPress={onPress}
            className="flex-1 items-center justify-center py-2"
            activeOpacity={0.7}
        >
            <Animated.View style={animatedIconStyle} className="items-center">
                <Icon
                    size={24}
                    color={isActive ? activeColor : '#666'}
                    strokeWidth={isActive ? 2.5 : 2}
                />
                {isActive && (
                    <View className="mt-1 h-1 w-1 rounded-full" style={{ backgroundColor: activeColor }} />
                )}
            </Animated.View>
            <Text
                className={cn(
                    "mt-1 text-[10px] font-medium",
                    isActive ? "text-foreground" : "text-muted-foreground"
                )}
                style={{ color: isActive ? activeColor : '#666' }}
            >
                {tab.label}
            </Text>
        </TouchableOpacity>
    );
};
