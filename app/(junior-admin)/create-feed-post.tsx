import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Image, Camera, Video, Calendar, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { createPost } from '@/lib/feed';
import { uploadFeedPhoto, uploadFeedVideo, createPhotoCarousel } from '@/lib/feed-media';
import type { PostType } from '@/types/feed.types';
import DateTimePicker from '@react-native-community/datetimepicker';

const POST_CATEGORIES: { label: string; value: PostType }[] = [
    { label: 'General', value: 'general' },
    { label: 'Event', value: 'event' },
    { label: 'Announcement', value: 'announcement' },
    { label: 'Testimony', value: 'testimony' },
    { label: 'Gallery', value: 'gallery' },
    { label: 'Youth Group', value: 'youth' },
    { label: 'Choir', value: 'choir' },
    { label: 'Catechism', value: 'catechism' },
];

interface MediaItem {
    uri: string;
    type: 'photo' | 'video';
    file?: any;
}

export default function CreateFeedPost() {
    const router = useRouter();
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [category, setCategory] = useState<PostType>('general');
    const [eventDate, setEventDate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const pickImages = async () => {
        if (media.length >= 10) {
            Alert.alert('Limit Reached', 'You can only upload up to 10 photos');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.8,
            selectionLimit: 10 - media.length,
        });

        if (!result.canceled) {
            const newMedia: MediaItem[] = result.assets.map((asset) => ({
                uri: asset.uri,
                type: 'photo',
                file: asset,
            }));
            setMedia([...media, ...newMedia]);
        }
    };

    const pickVideo = async () => {
        if (media.some((m) => m.type === 'video')) {
            Alert.alert('Video Limit', 'You can only upload one video per post');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            quality: 0.8,
            videoMaxDuration: 120, // 2 minutes
        });

        if (!result.canceled) {
            const newMedia: MediaItem = {
                uri: result.assets[0].uri,
                type: 'video',
                file: result.assets[0],
            };
            setMedia([...media, newMedia]);
        }
    };

    const removeMedia = (index: number) => {
        setMedia(media.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!content.trim()) {
            Alert.alert('Error', 'Please enter post content');
            return;
        }

        if (!user) {
            Alert.alert('Error', 'You must be logged in to create a post');
            return;
        }

        setSubmitting(true);

        try {
            // Get user's parish
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('parish_id, archdiocese_id')
                .eq('id', user.id)
                .single();

            if (userError || !userData) {
                throw new Error('Failed to get user parish');
            }

            // Create the post
            const { data: post, error: postError } = await createPost(
                {
                    content: content.trim(),
                    tier: 'local', // Junior admins can only post to local feed
                    post_type: category,
                    event_date: eventDate?.toISOString(),
                },
                user.id,
                userData.parish_id,
                userData.archdiocese_id
            );

            if (postError || !post) {
                throw new Error('Failed to create post');
            }

            // Upload media if any
            if (media.length > 0) {
                const photos = media.filter((m) => m.type === 'photo');
                const video = media.find((m) => m.type === 'video');

                // Upload photos
                if (photos.length > 0) {
                    const photoFiles = photos.map((p) => {
                        // Convert to blob for upload
                        return fetch(p.uri).then((r) => r.blob());
                    });

                    const photoBlobs = await Promise.all(photoFiles);
                    await createPhotoCarousel(photoBlobs, post.id);
                }

                // Upload video
                if (video) {
                    const videoBlob = await fetch(video.uri).then((r) => r.blob());
                    await uploadFeedVideo(videoBlob, post.id);
                }
            }

            Alert.alert('Success', 'Post created successfully!', [
                {
                    text: 'OK',
                    onPress: () => router.back(),
                },
            ]);
        } catch (error) {
            console.error('Error creating post:', error);
            Alert.alert('Error', 'Failed to create post. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.cancelButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create Post</Text>
                <TouchableOpacity onPress={handleSubmit} disabled={submitting || !content.trim()}>
                    {submitting ? (
                        <ActivityIndicator size="small" color={Colors.light.primary} />
                    ) : (
                        <Text
                            style={[
                                styles.publishButton,
                                (!content.trim() || submitting) && styles.publishButtonDisabled,
                            ]}
                        >
                            Publish
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
                {/* Content Input */}
                <TextInput
                    style={styles.contentInput}
                    placeholder="What would you like to share with your parish?"
                    placeholderTextColor={Colors.light.textSecondary}
                    multiline
                    value={content}
                    onChangeText={setContent}
                    maxLength={2000}
                    autoFocus
                />

                <Text style={styles.characterCount}>{content.length}/2000</Text>

                {/* Category Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Category</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.categoryContainer}>
                            {POST_CATEGORIES.map((cat) => (
                                <TouchableOpacity
                                    key={cat.value}
                                    style={[
                                        styles.categoryChip,
                                        category === cat.value && styles.categoryChipActive,
                                    ]}
                                    onPress={() => setCategory(cat.value)}
                                >
                                    <Text
                                        style={[
                                            styles.categoryChipText,
                                            category === cat.value && styles.categoryChipTextActive,
                                        ]}
                                    >
                                        {cat.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* Event Date (Optional) */}
                {category === 'event' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Event Date (Optional)</Text>
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Calendar size={20} color={Colors.light.primary} />
                            <Text style={styles.dateButtonText}>
                                {eventDate ? eventDate.toLocaleDateString() : 'Select Date'}
                            </Text>
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={eventDate || new Date()}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    setShowDatePicker(Platform.OS === 'ios');
                                    if (selectedDate) {
                                        setEventDate(selectedDate);
                                    }
                                }}
                            />
                        )}
                    </View>
                )}

                {/* Media Preview */}
                {media.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Media ({media.length})</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.mediaPreviewContainer}>
                                {media.map((item, index) => (
                                    <View key={index} style={styles.mediaPreview}>
                                        <Image
                                            source={{ uri: item.uri }}
                                            style={styles.mediaPreviewImage}
                                        />
                                        <TouchableOpacity
                                            style={styles.removeMediaButton}
                                            onPress={() => removeMedia(index)}
                                        >
                                            <X size={16} color="#fff" />
                                        </TouchableOpacity>
                                        {item.type === 'video' && (
                                            <View style={styles.videoBadge}>
                                                <Video size={16} color="#fff" />
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                )}

                {/* Media Upload Buttons */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Add Media</Text>
                    <View style={styles.mediaButtons}>
                        <TouchableOpacity style={styles.mediaButton} onPress={pickImages}>
                            <Image size={24} color={Colors.light.primary} />
                            <Text style={styles.mediaButtonText}>Photos</Text>
                            <Text style={styles.mediaButtonSubtext}>Up to 10</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.mediaButton,
                                media.some((m) => m.type === 'video') && styles.mediaButtonDisabled,
                            ]}
                            onPress={pickVideo}
                            disabled={media.some((m) => m.type === 'video')}
                        >
                            <Video size={24} color={Colors.light.primary} />
                            <Text style={styles.mediaButtonText}>Video</Text>
                            <Text style={styles.mediaButtonSubtext}>Max 2 min</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Publishing Info */}
                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        📍 This post will be published to your Local Parish Feed only.
                    </Text>
                </View>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    cancelButton: {
        fontSize: 16,
        color: Colors.light.textSecondary,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.text,
    },
    publishButton: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.light.primary,
    },
    publishButtonDisabled: {
        color: Colors.light.textSecondary,
    },
    content: {
        flex: 1,
    },
    contentInput: {
        padding: 16,
        fontSize: 16,
        color: Colors.light.text,
        minHeight: 150,
        textAlignVertical: 'top',
    },
    characterCount: {
        textAlign: 'right',
        paddingHorizontal: 16,
        fontSize: 12,
        color: Colors.light.textSecondary,
        marginBottom: 16,
    },
    section: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 12,
    },
    categoryContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.light.surfaceSecondary,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    categoryChipActive: {
        backgroundColor: Colors.light.primaryLight,
        borderColor: Colors.light.primary,
    },
    categoryChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.textSecondary,
    },
    categoryChipTextActive: {
        color: Colors.light.primary,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 14,
        backgroundColor: Colors.light.surfaceSecondary,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    dateButtonText: {
        fontSize: 15,
        color: Colors.light.text,
    },
    mediaPreviewContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    mediaPreview: {
        width: 100,
        height: 100,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    mediaPreviewImage: {
        width: '100%',
        height: '100%',
    },
    removeMediaButton: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    videoBadge: {
        position: 'absolute',
        bottom: 6,
        right: 6,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mediaButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    mediaButton: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        backgroundColor: Colors.light.surfaceSecondary,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    mediaButtonDisabled: {
        opacity: 0.5,
    },
    mediaButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.text,
        marginTop: 8,
    },
    mediaButtonSubtext: {
        fontSize: 12,
        color: Colors.light.textSecondary,
        marginTop: 2,
    },
    infoBox: {
        marginHorizontal: 16,
        marginBottom: 24,
        padding: 14,
        backgroundColor: Colors.light.primaryLight,
        borderRadius: 12,
    },
    infoText: {
        fontSize: 13,
        color: Colors.light.primary,
        lineHeight: 20,
    },
});
