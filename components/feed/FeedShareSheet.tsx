import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Share,
    Linking,
    Alert,
} from 'react-native';
import { X, MessageCircle, Facebook, Mail, Share2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { sharePost } from '@/lib/feed';
import type { ShareType } from '@/types/feed.types';

interface FeedShareSheetProps {
    visible: boolean;
    onClose: () => void;
    postId: string;
    postContent: string;
    userId: string;
}

export default function FeedShareSheet({
    visible,
    onClose,
    postId,
    postContent,
    userId,
}: FeedShareSheetProps) {
    const handleShare = async (type: ShareType) => {
        try {
            // Track the share
            await sharePost(postId, userId, type);

            const shareText = `Check out this post from EpixChurch:\n\n${postContent.substring(0, 200)}${postContent.length > 200 ? '...' : ''
                }`;

            switch (type) {
                case 'whatsapp':
                    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(shareText)}`;
                    const canOpenWhatsApp = await Linking.canOpenURL(whatsappUrl);
                    if (canOpenWhatsApp) {
                        await Linking.openURL(whatsappUrl);
                    } else {
                        Alert.alert('Error', 'WhatsApp is not installed on this device');
                    }
                    break;

                case 'facebook':
                    // Facebook sharing requires Facebook SDK or web share
                    // For now, use native share
                    await Share.share({
                        message: shareText,
                    });
                    break;

                case 'email':
                    const emailUrl = `mailto:?subject=${encodeURIComponent(
                        'Check out this post from EpixChurch'
                    )}&body=${encodeURIComponent(shareText)}`;
                    await Linking.openURL(emailUrl);
                    break;

                case 'internal':
                    // Use native share sheet
                    await Share.share({
                        message: shareText,
                    });
                    break;
            }

            onClose();
        } catch (error) {
            console.error('Error sharing post:', error);
            Alert.alert('Error', 'Failed to share post');
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

                <View style={styles.sheet}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Share Post</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={Colors.light.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Share Options */}
                    <View style={styles.options}>
                        <TouchableOpacity
                            style={styles.option}
                            onPress={() => handleShare('whatsapp')}
                        >
                            <View style={[styles.optionIcon, { backgroundColor: '#25D366' }]}>
                                <MessageCircle size={24} color="#fff" />
                            </View>
                            <Text style={styles.optionText}>WhatsApp</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.option}
                            onPress={() => handleShare('facebook')}
                        >
                            <View style={[styles.optionIcon, { backgroundColor: '#1877F2' }]}>
                                <Facebook size={24} color="#fff" />
                            </View>
                            <Text style={styles.optionText}>Facebook</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.option}
                            onPress={() => handleShare('email')}
                        >
                            <View style={[styles.optionIcon, { backgroundColor: '#EA4335' }]}>
                                <Mail size={24} color="#fff" />
                            </View>
                            <Text style={styles.optionText}>Email</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.option}
                            onPress={() => handleShare('internal')}
                        >
                            <View style={[styles.optionIcon, { backgroundColor: Colors.light.primary }]}>
                                <Share2 size={24} color="#fff" />
                            </View>
                            <Text style={styles.optionText}>More</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    sheet: {
        backgroundColor: Colors.light.surfaceSecondary,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 34,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.text,
    },
    closeButton: {
        padding: 4,
    },
    options: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    option: {
        alignItems: 'center',
        gap: 8,
    },
    optionIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionText: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.light.text,
    },
});
