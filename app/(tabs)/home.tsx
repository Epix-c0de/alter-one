import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Bell, Plus, Bookmark } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { FeedPost, FeedTier } from '@/types/feed.types';
import { fetchLocalFeed, fetchArchdioceseFeed, fetchNationalFeed } from '@/lib/feed';
import FeedPostCard from '@/components/feed/FeedPostCard';
import FeedCommentSection from '@/components/feed/FeedCommentSection';
import { Link } from 'expo-router';

type TabType = 'local' | 'archdiocese' | 'national';

export default function HomeScreen() {
  const { user, isGuest } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('local');
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [parishName, setParishName] = useState<string>('');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);

  const LIMIT = 10;

  useEffect(() => {
    loadUserParish();
    loadFeed(true);
  }, [activeTab, user]);

  const loadUserParish = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('users')
      .select('parish_id, parishes(parish_name)')
      .eq('id', user.id)
      .single();

    if (data && (data as any).parishes) {
      setParishName((data as any).parishes.parish_name);
    }
  };

  const loadFeed = async (reset: boolean = false) => {
    if (!user) return;

    if (reset) {
      setLoading(true);
      setOffset(0);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    const currentOffset = reset ? 0 : offset;

    let result;
    if (activeTab === 'local') {
      result = await fetchLocalFeed(user.id, LIMIT, currentOffset);
    } else if (activeTab === 'archdiocese') {
      result = await fetchArchdioceseFeed(user.id, LIMIT, currentOffset);
    } else {
      result = await fetchNationalFeed(user.id, LIMIT, currentOffset);
    }

    if (result.error) {
      Alert.alert('Error', 'Failed to load feed');
    } else {
      const newPosts = result.data || [];
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
    loadFeed(true);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadFeed(false);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setPosts([]);
  };

  const handleCommentPress = (postId: string) => {
    setSelectedPostId(postId);
    setShowComments(true);
  };

  const handleCloseComments = () => {
    setShowComments(false);
    setSelectedPostId(null);
    // Refresh to update comment counts
    loadFeed(true);
  };

  const renderPost = ({ item }: { item: FeedPost }) => (
    <FeedPostCard
      post={item}
      onCommentPress={() => handleCommentPress(item.id)}
      onRefresh={() => loadFeed(true)}
    />
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
        <Text style={styles.emptyText}>
          {activeTab === 'local'
            ? 'No posts in your parish yet. Be the first to share!'
            : activeTab === 'archdiocese'
              ? 'No archdiocese posts yet.'
              : 'No national posts yet.'}
        </Text>
      </View>
    );
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'junior_admin';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>EpixChurch</Text>
        <View style={styles.headerActions}>
          <Link href="/saved-posts" asChild>
            <TouchableOpacity style={styles.headerButton}>
              <Bookmark color={Colors.light.text} size={24} />
            </TouchableOpacity>
          </Link>
          <TouchableOpacity style={styles.headerButton}>
            <Search color={Colors.light.text} size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Bell color={Colors.light.text} size={24} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Parish Banner */}
      {activeTab === 'local' && parishName && (
        <View style={styles.parishBanner}>
          <Text style={styles.parishBannerText}>
            📍 Viewing content from: {parishName}
          </Text>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'local' && styles.tabActive]}
          onPress={() => handleTabChange('local')}
        >
          <Text style={[styles.tabText, activeTab === 'local' && styles.tabTextActive]}>
            Local Feed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'archdiocese' && styles.tabActive]}
          onPress={() => handleTabChange('archdiocese')}
        >
          <Text
            style={[styles.tabText, activeTab === 'archdiocese' && styles.tabTextActive]}
          >
            Archdiocese
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'national' && styles.tabActive]}
          onPress={() => handleTabChange('national')}
        >
          <Text style={[styles.tabText, activeTab === 'national' && styles.tabTextActive]}>
            National
          </Text>
        </TouchableOpacity>
      </View>

      {/* Feed */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.feedContent}
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

      {/* Floating Create Button (Admin Only) */}
      {isAdmin && (
        <TouchableOpacity style={styles.fab}>
          <Plus size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Comments Modal */}
      <Modal
        visible={showComments}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseComments}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Comments</Text>
            <TouchableOpacity onPress={handleCloseComments}>
              <Text style={styles.modalClose}>Done</Text>
            </TouchableOpacity>
          </View>
          {selectedPostId && (
            <FeedCommentSection postId={selectedPostId} onClose={handleCloseComments} />
          )}
        </SafeAreaView>
      </Modal>
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
    backgroundColor: Colors.light.surfaceSecondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    padding: 4,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.error,
  },
  parishBanner: {
    backgroundColor: Colors.light.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  parishBannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.primary,
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surfaceSecondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  tabTextActive: {
    color: Colors.light.primary,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedContent: {
    paddingVertical: 8,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 60,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  modalClose: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
  },
});
