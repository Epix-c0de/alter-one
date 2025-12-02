import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, Heart, Play, X, Camera } from 'lucide-react-native';
import { WebView } from 'react-native-webview';

import Colors from '@/constants/colors';
import { mockSongs, mockUser } from '@/mocks/data';
import type { Song } from '@/types';

function SongCard({ song, onPress }: { song: Song; onPress: () => void }) {
  const [saved, setSaved] = useState(song.saved);

  return (
    <TouchableOpacity style={styles.songCard} onPress={onPress} activeOpacity={0.7}>
      <Image
        source={{ uri: song.thumbnailUrl || 'https://via.placeholder.com/300' }}
        style={styles.songThumbnail}
      />
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={2}>
          {song.title}
        </Text>
        {song.artist && (
          <Text style={styles.songArtist} numberOfLines={1}>
            {song.artist}
          </Text>
        )}
        <View style={styles.songFooter}>
          <View style={styles.songTags}>
            {song.tags.slice(0, 2).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              setSaved(!saved);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Heart
              color={saved ? Colors.light.error : Colors.light.textSecondary}
              size={18}
              fill={saved ? Colors.light.error : 'transparent'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function SongsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredSongs = mockSongs.filter(
    (song) =>
      searchQuery === '' ||
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isAdmin = mockUser.role === 'admin';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Songs</Text>
        {isAdmin && (
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={() => router.push('/capture-song')}
          >
            <Camera color={Colors.light.primary} size={24} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.searchContainer}>
        <Search color={Colors.light.textSecondary} size={20} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search songs, artists..."
          placeholderTextColor={Colors.light.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter color={Colors.light.primary} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.songsGrid}>
          {filteredSongs.map((song) => (
            <SongCard key={song.id} song={song} onPress={() => setSelectedSong(song)} />
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={selectedSong !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedSong(null)}
      >
        {selectedSong && (
          <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedSong(null)} style={styles.closeButton}>
                <X color={Colors.light.text} size={28} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {selectedSong.youtubeVideoId && (
                <View style={styles.videoContainer}>
                  <WebView
                    style={styles.video}
                    source={{
                      uri: `https://www.youtube.com/embed/${selectedSong.youtubeVideoId}?rel=0&modestbranding=1`,
                    }}
                    allowsFullscreenVideo
                  />
                </View>
              )}

              <View style={styles.songDetails}>
                <Text style={styles.modalTitle}>{selectedSong.title}</Text>
                {selectedSong.artist && (
                  <Text style={styles.modalArtist}>by {selectedSong.artist}</Text>
                )}

                <View style={styles.modalTags}>
                  {selectedSong.tags.map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>

                {selectedSong.lyrics && (
                  <View style={styles.lyricsContainer}>
                    <Text style={styles.lyricsTitle}>Lyrics</Text>
                    {selectedSong.lyrics.verses.map((verse, index) => (
                      <View key={index} style={styles.verse}>
                        <Text style={styles.verseLabel}>{verse.label}</Text>
                        {verse.lines.map((line, lineIndex) => (
                          <Text key={lineIndex} style={styles.verseLine}>
                            {line}
                          </Text>
                        ))}
                      </View>
                    ))}
                    {selectedSong.lyrics.chorus && (
                      <View style={styles.chorus}>
                        <Text style={styles.verseLabel}>Chorus</Text>
                        {selectedSong.lyrics.chorus.map((line, index) => (
                          <Text key={index} style={styles.verseLine}>
                            {line}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                <TouchableOpacity style={styles.playButton}>
                  <Play color={Colors.light.surfaceSecondary} size={24} fill={Colors.light.surfaceSecondary} />
                  <Text style={styles.playButtonText}>Play on YouTube</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
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
    paddingVertical: 16,
    backgroundColor: Colors.light.surfaceSecondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
  },
  cameraButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surfaceSecondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
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
  filterButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  songsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  songCard: {
    width: '50%',
    padding: 8,
  },
  songThumbnail: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: Colors.light.surface,
  },
  songInfo: {
    marginTop: 8,
  },
  songTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  songArtist: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  songFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  songTags: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },
  tag: {
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.light.accent,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: Colors.light.text,
  },
  video: {
    flex: 1,
  },
  songDetails: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
  },
  modalArtist: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 16,
  },
  modalTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  lyricsContainer: {
    marginBottom: 24,
  },
  lyricsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 16,
  },
  verse: {
    marginBottom: 20,
  },
  chorus: {
    marginBottom: 20,
    backgroundColor: Colors.light.surface,
    padding: 16,
    borderRadius: 8,
  },
  verseLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  verseLine: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.light.text,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.surfaceSecondary,
  },
});
