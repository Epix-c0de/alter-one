import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigationStore } from '@/store/navigationStore';
import { NAVIGATION_MODES } from '@/constants/navigation';
import { GlassContainer } from './GlassContainer';
import { Bell, Search, Menu, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export const SmartAppBar: React.FC = () => {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { currentMode, setMode } = useNavigationStore();
    const modeConfig = NAVIGATION_MODES[currentMode];

    const handleBack = () => {
        if (currentMode !== 'default') {
            setMode('default');
        } else if (router.canGoBack()) {
            router.back();
        }
    };

    if (!modeConfig) return null;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <GlassContainer
                intensity={20}
                tint={modeConfig.theme.blurTint}
                className="mx-4 mt-2 flex-row items-center justify-between rounded-full border border-white/20 px-4 py-3 shadow-sm"
                style={{ backgroundColor: modeConfig.theme.background }}
            >
                <View className="flex-row items-center gap-3">
                    {currentMode !== 'default' ? (
                        <TouchableOpacity onPress={handleBack} className="rounded-full bg-black/5 p-2">
                            <ArrowLeft size={20} color={modeConfig.theme.primary} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity className="rounded-full bg-black/5 p-2">
                            <Menu size={20} color={modeConfig.theme.primary} />
                        </TouchableOpacity>
                    )}

                    <View>
                        <Text className="text-sm font-bold" style={{ color: modeConfig.theme.primary }}>
                            {currentMode === 'default' ? "St. Mary's Parish" : modeConfig.id.toUpperCase()}
                        </Text>
                        <Text className="text-xs text-muted-foreground">
                            {currentMode === 'default' ? 'Welcome back' : 'Active Mode'}
                        </Text>
                    </View>
                </View>

                <View className="flex-row gap-2">
                    <TouchableOpacity className="rounded-full bg-black/5 p-2">
                        <Search size={20} color={modeConfig.theme.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity className="rounded-full bg-black/5 p-2">
                        <Bell size={20} color={modeConfig.theme.primary} />
                    </TouchableOpacity>
                </View>
            </GlassContainer>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
});
