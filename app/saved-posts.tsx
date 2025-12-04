import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bookmark } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import type { FeedPost } from '@/types/feed.types';
import { fetchSavedPosts } from '@/lib/feed';
import FeedPostCard from '@/components/feed/FeedPostCard';

export default function SavedPostsScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);

    const LIMIT = 20;

    useEffect(() => {
        loadSavedPosts(true);
    }, []);

    const loadSavedPosts = async (reset: boolean = false) => {
        if (!user) return;

        if (reset) {
            setLoading(true);
            setOffset(0);
            setHasMore(true);
        } else {
            setLoadingMore(true);
        }

        const currentOffset = reset ? 0 : offset;

        const { data, error } = await fetchSavedPosts(user.id, LIMIT, currentOffset);

        if (error) {
            console.error('Error loading saved posts:', error);
        } else {
            const newPosts = data || [];
            setPosts(reset ? newPosts : [...posts, ...newPosts]);
            setHasMore(newPosts.length === LIMIT);
            setOffset(currentOffset + newPosts.length);
        }

        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadSavedPosts(true);
    };

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            loadSavedPosts(false);
        }
    };

    const renderPost = ({ item }: { item: FeedPost }) => (
        <FeedPostCard post={item} onRefresh={() => loadSavedPosts(true)} />
    );

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={Colors.light.primary} />
            </View>
        );
    };

    const renderEmpty = () => {
        if (loading) return null;
        return (
            <View style={styles.emptyContainer}>
                <Bookmark size={64} color={Colors.light.textSecondary} />
                <Text style={styles.emptyTitle}>No Saved Posts</Text>
                <Text style={styles.emptyText}>
                    Posts you save will appear here for easy access later.
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={Colors.light.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Saved Posts</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Posts List */}
            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={Colors.light.primary} />
                </View>
            ) : (
                <FlatList
                    data={posts}
                    renderItem={renderPost}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={Colors.light.primary}
                        />
                    }
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={renderEmpty}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.surface,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.text,
    },
    placeholder: {
        width: 32,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingVertical: 8,
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    emptyContainer: {
        paddingVertical: 80,
        paddingHorizontal: 40,
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.light.text,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 15,
        color: Colors.light.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
});
