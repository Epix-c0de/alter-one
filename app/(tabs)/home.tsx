import { Image } from 'expo-image';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, MessageCircle, Bookmark, Share2, Search, Bell } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { mockFeedItems } from '@/mocks/data';
import type { FeedItem } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import LocalChurchIdRequestModal from '@/components/LocalChurchIdRequestModal';
import { useLocation } from '@/context/LocationContext';
import { findParishByLocation } from '@/lib/geofencing';
import { Database } from '@/types/database';

type Parish = Database['public']['Tables']['parishes']['Row'];

// Mock parishes data (replace with actual data from Supabase)
const MOCK_PARISHES: Parish[] = [
  {
    id: '1',
    archdiocese_id: '1',
    parish_name: 'Holy Family Basilica',
    latitude: -1.286389,
    longitude: 36.817223,
    radius_meters: 1000,
    polygon_coordinates: null,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    archdiocese_id: '1',
    parish_name: 'All Saints Cathedral',
    latitude: -1.286667,
    longitude: 36.818333,
    radius_meters: 1500,
    polygon_coordinates: null,
    created_at: new Date().toISOString(),
  },
];

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function FeedCard({ item }: { item: FeedItem }) {
  const [liked, setLiked] = useState(item.liked);
  const [saved, setSaved] = useState(item.saved);
  const [likes, setLikes] = useState(item.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image
          source={{ uri: item.authorPhotoUrl || 'https://i.pravatar.cc/150?img=1' }}
          style={styles.avatar}
        />
        <View style={styles.cardHeaderText}>
          <Text style={styles.authorName}>{item.authorName}</Text>
          <Text style={styles.timestamp}>{formatTimeAgo(item.createdAt)}</Text>
        </View>
        {item.pinned && (
          <View style={styles.pinnedBadge}>
            <Text style={styles.pinnedText}>Pinned</Text>
          </View>
        )}
      </View>

      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardContent} numberOfLines={3}>
        {item.content}
      </Text>

      {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />}

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Heart
            color={liked ? Colors.light.error : Colors.light.textSecondary}
            size={20}
            fill={liked ? Colors.light.error : 'transparent'}
          />
          <Text style={[styles.actionText, liked && styles.actionTextActive]}>{likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <MessageCircle color={Colors.light.textSecondary} size={20} />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => setSaved(!saved)}>
          <Bookmark
            color={saved ? Colors.light.primary : Colors.light.textSecondary}
            size={20}
            fill={saved ? Colors.light.primary : 'transparent'}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Share2 color={Colors.light.textSecondary} size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { location, errorMsg, requestPermission } = useLocation();
  const [refreshing, setRefreshing] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [parishes, setParishes] = useState<Parish[]>(MOCK_PARISHES);

  useEffect(() => {
    const checkLocalChurchId = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('users')
        .select('local_church_id, parish_id')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user data:', error.message);
        return;
      }

      if (!data?.local_church_id) {
        setModalVisible(true);
      }

      if (!data?.parish_id) {
        requestPermission();
      }
    };

    checkLocalChurchId();
  }, [user, requestPermission]);

  useEffect(() => {
    if (location && user) {
      const foundParish = findParishByLocation(location, parishes);
      if (foundParish) {
        supabase
          .from('users')
          .update({ parish_id: foundParish.id })
          .eq('id', user.id)
          .then(({ error }) => {
            if (error) {
              Alert.alert('Error', 'Could not update your parish.');
            } else {
              Alert.alert('Parish Assigned', `You have been assigned to ${foundParish.parish_name}.`);
            }
          });
      }
    }

    if (errorMsg) {
      Alert.alert('Location Error', errorMsg);
    }
  }, [location, errorMsg, user, parishes]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LocalChurchIdRequestModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
      />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>EpixChurch</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setSearchVisible(!searchVisible)}
          >
            <Search color={Colors.light.text} size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Bell color={Colors.light.text} size={24} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
      </View>

      {searchVisible && (
        <View style={styles.searchContainer}>
          <Search color={Colors.light.textSecondary} size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search posts, songs, prayers..."
            placeholderTextColor={Colors.light.textSecondary}
          />
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {mockFeedItems.map((item) => (
          <FeedCard key={item.id} item={item} />
        ))}
      </ScrollView>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surfaceSecondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  searchIcon: {
    position: 'absolute',
    left: 24,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    paddingHorizontal: 40,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.light.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  card: {
    backgroundColor: Colors.light.card,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  timestamp: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  pinnedBadge: {
    backgroundColor: Colors.light.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pinnedText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.surfaceSecondary,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  cardImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: Colors.light.surface,
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  actionTextActive: {
    color: Colors.light.error,
  },
});
