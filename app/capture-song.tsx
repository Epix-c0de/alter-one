import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, X, CheckCircle, AlertCircle, Upload } from 'lucide-react-native';

import Colors from '@/constants/colors';
import type { Song } from '@/types';

export default function CaptureSongScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<Partial<Song> | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [editMode, setEditMode] = useState(false);

  const [editedTitle, setEditedTitle] = useState('');
  const [editedArtist, setEditedArtist] = useState('');
  const [editedLyrics, setEditedLyrics] = useState('');

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images' as ImagePicker.MediaTypeOptions,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      processImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert('Permission to access camera is required!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      processImage(result.assets[0].uri);
    }
  };

  const processImage = async (uri: string) => {
    setProcessing(true);
    setOcrResult(null);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockResult: Partial<Song> = {
      title: 'Amazing Grace',
      artist: 'John Newton',
      lyrics: {
        verses: [
          {
            label: 'Verse 1',
            lines: [
              'Amazing grace! How sweet the sound',
              'That saved a wretch like me!',
              'I once was lost, but now am found;',
              'Was blind, but now I see.',
            ],
          },
        ],
      },
      tags: ['hymn', 'traditional', 'worship'],
      language: 'en',
    };

    setOcrResult(mockResult);
    setConfidence(92);
    setEditedTitle(mockResult.title || '');
    setEditedArtist(mockResult.artist || '');
    setEditedLyrics(
      mockResult.lyrics?.verses.map((v) => `[${v.label}]\n${v.lines.join('\n')}`).join('\n\n') || ''
    );
    setProcessing(false);
  };

  const handlePublish = () => {
    console.log('Publishing song:', { editedTitle, editedArtist, editedLyrics });
    router.back();
  };

  if (!image) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <X color={Colors.light.text} size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Capture Song</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.emptyState}>
          <Camera color={Colors.light.primary} size={80} />
          <Text style={styles.emptyTitle}>Capture or Upload a Song Page</Text>
          <Text style={styles.emptySubtitle}>
            Take a photo of a printed or handwritten song page, and we will extract the lyrics and
            metadata for you.
          </Text>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={takePhoto}>
              <Camera color={Colors.light.surfaceSecondary} size={20} />
              <Text style={styles.primaryButtonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={pickImage}>
              <Upload color={Colors.light.primary} size={20} />
              <Text style={styles.secondaryButtonText}>Choose from Library</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            setImage(null);
            setOcrResult(null);
            setProcessing(false);
          }}
        >
          <X color={Colors.light.text} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Processing</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: image }} style={styles.previewImage} />

        {processing && (
          <View style={styles.processingCard}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.processingTitle}>Processing Image</Text>
            <Text style={styles.processingSubtitle}>
              Extracting lyrics and metadata using OCR and AI...
            </Text>
          </View>
        )}

        {ocrResult && (
          <>
            <View style={styles.confidenceCard}>
              {confidence >= 80 ? (
                <CheckCircle color={Colors.light.success} size={24} />
              ) : (
                <AlertCircle color={Colors.light.warning} size={24} />
              )}
              <View style={styles.confidenceContent}>
                <Text style={styles.confidenceTitle}>Confidence Score: {confidence}%</Text>
                <Text style={styles.confidenceSubtitle}>
                  {confidence >= 80
                    ? 'High confidence extraction'
                    : 'Manual review recommended'}
                </Text>
              </View>
            </View>

            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>Extracted Data</Text>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Title</Text>
                {editMode ? (
                  <TextInput
                    style={styles.fieldInput}
                    value={editedTitle}
                    onChangeText={setEditedTitle}
                    placeholder="Song title"
                  />
                ) : (
                  <Text style={styles.fieldValue}>{ocrResult.title}</Text>
                )}
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Artist</Text>
                {editMode ? (
                  <TextInput
                    style={styles.fieldInput}
                    value={editedArtist}
                    onChangeText={setEditedArtist}
                    placeholder="Artist name"
                  />
                ) : (
                  <Text style={styles.fieldValue}>{ocrResult.artist || 'Unknown'}</Text>
                )}
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Lyrics</Text>
                {editMode ? (
                  <TextInput
                    style={[styles.fieldInput, styles.fieldInputMultiline]}
                    value={editedLyrics}
                    onChangeText={setEditedLyrics}
                    placeholder="Song lyrics"
                    multiline
                    numberOfLines={10}
                  />
                ) : (
                  <ScrollView style={styles.lyricsPreview} nestedScrollEnabled>
                    {ocrResult.lyrics?.verses.map((verse, index) => (
                      <View key={index} style={styles.verse}>
                        <Text style={styles.verseLabel}>{verse.label}</Text>
                        {verse.lines.map((line, lineIndex) => (
                          <Text key={lineIndex} style={styles.verseLine}>
                            {line}
                          </Text>
                        ))}
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>

              {ocrResult.tags && (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Tags</Text>
                  <View style={styles.tags}>
                    {ocrResult.tags.map((tag) => (
                      <View key={tag} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setEditMode(!editMode)}
              >
                <Text style={styles.secondaryButtonText}>{editMode ? 'Preview' : 'Edit'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.primaryButton} onPress={handlePublish}>
                <CheckCircle color={Colors.light.surfaceSecondary} size={20} />
                <Text style={styles.primaryButtonText}>Approve & Publish</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
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
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.surfaceSecondary,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.surfaceSecondary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  previewImage: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
    marginBottom: 16,
  },
  processingCard: {
    backgroundColor: Colors.light.card,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  processingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  processingSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  confidenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  confidenceContent: {
    flex: 1,
  },
  confidenceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  confidenceSubtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  resultCard: {
    backgroundColor: Colors.light.card,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 20,
  },
  field: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  fieldValue: {
    fontSize: 16,
    color: Colors.light.text,
  },
  fieldInput: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.light.text,
  },
  fieldInputMultiline: {
    minHeight: 200,
    textAlignVertical: 'top',
  },
  lyricsPreview: {
    maxHeight: 300,
  },
  verse: {
    marginBottom: 16,
  },
  verseLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.primary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  verseLine: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.light.text,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.accent,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
});

