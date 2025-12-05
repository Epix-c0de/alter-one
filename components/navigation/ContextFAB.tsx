import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { Plus, PenTool, Mic, Share2 } from 'lucide-react-native';
import { useNavigationStore } from '@/store/navigationStore';
import { NAVIGATION_MODES } from '@/constants/navigation';

export const ContextFAB: React.FC = () => {
    const { currentMode } = useNavigationStore();
    const modeConfig = NAVIGATION_MODES[currentMode];

    const scale = useSharedValue(0);
    const rotation = useSharedValue(0);

    useEffect(() => {
        // Animate in when mode changes
        scale.value = withSequence(
            withTiming(0, { duration: 100 }),
            withSpring(1, { damping: 12 })
        );
        rotation.value = withRepeat(
            withSequence(
                withTiming(-10, { duration: 100 }),
                withTiming(10, { duration: 100 }),
                withTiming(0, { duration: 100 })
            ),
            1
        );
    }, [currentMode]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { rotate: `${rotation.value}deg` }
        ],
    }));

    // Determine icon and action based on mode
    const getFabConfig = () => {
        switch (currentMode) {
            case 'mass':
                return { icon: PenTool, color: '#F8D26A' };
            case 'bible':
                return { icon: PenTool, color: '#0F1B3D' };
            case 'prayer':
                return { icon: Mic, color: '#EAE8FF' };
            case 'groups':
                return { icon: Plus, color: '#0F1B3D' };
            case 'live':
                return { icon: Share2, color: '#A61C2C' };
            case 'default':
                return { icon: Plus, color: '#F8D26A' };
            default:
                return null;
        }
    };

    const config = getFabConfig();
    if (!config) return null;

    const Icon = config.icon;

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <TouchableOpacity
                style={[styles.button, { backgroundColor: config.color }]}
                activeOpacity={0.8}
            >
                <Icon size={24} color="#FFF" />
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 100, // Above bottom bar
        right: 20,
        zIndex: 90,
    },
    button: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
});
