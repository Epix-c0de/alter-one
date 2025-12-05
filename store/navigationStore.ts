import { create } from 'zustand';
import { NavigationMode } from '@/constants/navigation';

interface NavigationState {
    currentMode: NavigationMode;
    activeTabId: string;
    isTabBarVisible: boolean;

    // Actions
    setMode: (mode: NavigationMode) => void;
    setActiveTab: (tabId: string) => void;
    setTabBarVisible: (visible: boolean) => void;
    resetToDefault: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
    currentMode: 'default',
    activeTabId: 'home',
    isTabBarVisible: true,

    setMode: (mode) => set({ currentMode: mode }),
    setActiveTab: (tabId) => set({ activeTabId: tabId }),
    setTabBarVisible: (visible) => set({ isTabBarVisible: visible }),
    resetToDefault: () => set({ currentMode: 'default', activeTabId: 'home' }),
}));
