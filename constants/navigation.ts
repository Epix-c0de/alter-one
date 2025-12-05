import {
    Home, BookOpen, Heart, Users, User,
    Music, Radio, MessageCircle, Calendar,
    Share2, Settings, Plus, BookMarked,
    CloudSun, Moon, List, Play, Download,
    Mic, PenTool, MapPin, Bell
} from 'lucide-react-native';

export type NavigationMode =
    | 'default'
    | 'mass'
    | 'bible'
    | 'prayer'
    | 'stations'
    | 'music'
    | 'live'
    | 'groups'
    | 'feed';

export interface TabConfig {
    id: string;
    label: string;
    icon: any;
    action?: () => void;
    route?: string;
}

export interface ModeConfig {
    id: NavigationMode;
    tabs: TabConfig[];
    theme: {
        primary: string;
        background: string;
        blurTint: 'light' | 'dark' | 'default';
    };
}

export const NAVIGATION_MODES: Record<NavigationMode, ModeConfig> = {
    default: {
        id: 'default',
        theme: { primary: '#F8D26A', background: 'rgba(255, 255, 255, 0.8)', blurTint: 'light' },
        tabs: [
            { id: 'home', label: 'Feed', icon: Home, route: '/(tabs)/home' },
            { id: 'bible', label: 'Bible', icon: BookOpen, route: '/(tabs)/bible' },
            { id: 'prayers', label: 'Prayers', icon: Heart, route: '/(tabs)/prayers' },
            { id: 'mass', label: 'Mass', icon: BookMarked, route: '/(tabs)/mass' },
            { id: 'profile', label: 'Profile', icon: User, route: '/(tabs)/profile' },
        ]
    },
    mass: {
        id: 'mass',
        theme: { primary: '#F8D26A', background: 'rgba(255, 248, 220, 0.9)', blurTint: 'light' },
        tabs: [
            { id: 'readings', label: 'Readings', icon: BookOpen },
            { id: 'hymns', label: 'Hymns', icon: Music },
            { id: 'psalms', label: 'Psalms', icon: CloudSun },
            { id: 'responses', label: 'Responses', icon: MessageCircle },
            { id: 'notes', label: 'Notes', icon: PenTool },
        ]
    },
    bible: {
        id: 'bible',
        theme: { primary: '#0F1B3D', background: 'rgba(15, 27, 61, 0.9)', blurTint: 'dark' },
        tabs: [
            { id: 'books', label: 'Books', icon: List },
            { id: 'chapters', label: 'Chapters', icon: BookOpen },
            { id: 'verse', label: 'Verse', icon: BookMarked },
            { id: 'commentary', label: 'Insights', icon: MessageCircle },
            { id: 'bookmarks', label: 'Saved', icon: Heart },
        ]
    },
    prayer: {
        id: 'prayer',
        theme: { primary: '#EAE8FF', background: 'rgba(234, 232, 255, 0.9)', blurTint: 'light' },
        tabs: [
            { id: 'morning', label: 'Morning', icon: CloudSun },
            { id: 'evening', label: 'Evening', icon: Moon },
            { id: 'special', label: 'Special', icon: Heart },
            { id: 'books', label: 'Books', icon: BookOpen },
            { id: 'intentions', label: 'Intentions', icon: PenTool },
        ]
    },
    stations: {
        id: 'stations',
        theme: { primary: '#A61C2C', background: 'rgba(20, 20, 20, 0.9)', blurTint: 'dark' },
        tabs: [
            { id: 'stations', label: 'Stations', icon: MapPin },
            { id: 'audio', label: 'Audio', icon: Mic },
            { id: 'visual', label: 'Visual', icon: List },
            { id: 'meditate', label: 'Meditate', icon: Heart },
            { id: 'history', label: 'History', icon: BookOpen },
        ]
    },
    music: {
        id: 'music',
        theme: { primary: '#F8D26A', background: 'rgba(255, 255, 255, 0.8)', blurTint: 'light' },
        tabs: [
            { id: 'playlists', label: 'Playlists', icon: List },
            { id: 'hymns', label: 'Hymns', icon: Music },
            { id: 'choir', label: 'Choir', icon: Users },
            { id: 'favorites', label: 'Favorites', icon: Heart },
            { id: 'downloads', label: 'Downloads', icon: Download },
        ]
    },
    live: {
        id: 'live',
        theme: { primary: '#A61C2C', background: 'rgba(0, 0, 0, 0.8)', blurTint: 'dark' },
        tabs: [
            { id: 'chat', label: 'Chat', icon: MessageCircle },
            { id: 'schedule', label: 'Schedule', icon: Calendar },
            { id: 'share', label: 'Share', icon: Share2 },
            { id: 'quality', label: 'Quality', icon: Settings },
            { id: 'exit', label: 'Exit', icon: User }, // Should be exit icon
        ]
    },
    groups: {
        id: 'groups',
        theme: { primary: '#0F1B3D', background: 'rgba(255, 255, 255, 0.9)', blurTint: 'light' },
        tabs: [
            { id: 'posts', label: 'Posts', icon: List },
            { id: 'members', label: 'Members', icon: Users },
            { id: 'announcements', label: 'Alerts', icon: Bell },
            { id: 'media', label: 'Media', icon: Music },
            { id: 'create', label: 'Create', icon: Plus },
        ]
    },
    feed: {
        id: 'feed',
        theme: { primary: '#F8D26A', background: 'rgba(255, 255, 255, 0.8)', blurTint: 'light' },
        tabs: [
            { id: 'local', label: 'Local', icon: MapPin },
            { id: 'parish', label: 'Parish', icon: Home },
            { id: 'archdiocese', label: 'Archdiocese', icon: BookOpen },
            { id: 'national', label: 'National', icon: CloudSun },
            { id: 'saved', label: 'Saved', icon: Heart },
        ]
    }
};
