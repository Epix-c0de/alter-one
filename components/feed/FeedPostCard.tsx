import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Heart, MessageCircle, Share2, Bookmark, MoreVertical, Pin } from 'lucide-react-native';
import Colors from '@/constants/colors';
import type { FeedPost } from '@/types/feed.types';
import { formatTimeAgo } from '@/lib/time-formatter';
import { formatBibleReferences } from '@/lib/bible-formatter';
import { toggleLikePost, toggleSavePost, sharePost } from '@/lib/feed';
import { useAuth } from '@/context/AuthContext';
import FeedMediaCarousel from './FeedMediaCarousel';
import FeedVideoPlayer from './FeedVideoPlayer';
import FeedShareSheet from './FeedShareSheet';
import ReportContentModal from './ReportContentModal';

interface FeedPostCardProps {
    post: FeedPost;
    onCommentPress?: () => void;
    onEditPress?: () => void;
    onDeletePress?: () => void;
    onPinPress?: () => void;
    onRefresh?: () => void;
}

export default function FeedPostCard({
    post,
    onCommentPress,
    onEditPress,
    onDeletePress,
    onPinPress,
    onRefresh,
}: FeedPostCardProps) {
    const { user } = useAuth();
    const [liked, setLiked] = useState(post.user_has_liked || false);
    const [saved, setSaved] = useState(post.user_has_saved || false);
    const [likeCount, setLikeCount] = useState(post.like_count);
    const [showMenu, setShowMenu] = useState(false);
    const [showShareSheet, setShowShareSheet] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    const isAuthor = user?.id === post.author_id;
    const isAdmin = user?.role === 'admin' || user?.role === 'junior_admin';

    const handleLike = async () => {
        if (!user) return;

        const previousLiked = liked;
        const previousCount = likeCount;

        // Optimistic update
        setLiked(!liked);
        setLikeCount(liked ? likeCount - 1 : likeCount + 1);

        const { error } = await toggleLikePost(post.id, user.id);

        if (error) {
            // Revert on error
            setLiked(previousLiked);
            setLikeCount(previousCount);
            Alert.alert('Error', 'Failed to like post');
        }
    };

    const handleSave = async () => {
        if (!user) return;

        const previousSaved = saved;
        setSaved(!saved);

        const { error } = await toggleSavePost(post.id, user.id);

        if (error) {
            setSaved(previousSaved);
            Alert.alert('Error', 'Failed to save post');
        }
    };

    const handleShare = () => {
        if (!user) return;
        setShowShareSheet(true);
    };

    const handleReport = () => {
        if (!user) return;
        setShowMenu(false);
        setShowReportModal(true);
    };

    const getRoleTag = () => {
        const role = post.author_role || 'member';
        const parishName = post.parish_name || '';

        if (role === 'junior_admin') {
            return `Junior Admin${parishName ? ` – ${parishName}` : ''}`;
        } else if (role === 'admin') {
            return `Parish Admin${parishName ? ` – ${parishName}` : ''}`;
        } else if (post.tier === 'national') {
            return 'National Admin – CBC';
        } else if (post.tier === 'archdiocese') {
            return `Archdiocese Admin${parishName ? ` – ${parishName}` : ''}`;
        }
        return parishName || 'Member';
    };

    const formattedContent = formatBibleReferences(post.content);

    // Separate photos and videos
    const photos = post.media?.filter((m) => m.media_type === 'photo') || [];
    const video = post.media?.find((m) => m.media_type === 'video');

    return (
        <View style={styles.card}>
            {/* Pinned Badge */}
            {post.is_pinned && (
                <View style={styles.pinnedBanner}>
                    <Pin size={14} color={Colors.light.primary} />
                    <Text style={styles.pinnedText}>Pinned Post</Text>
                </View>
            )}

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {post.author_name?.charAt(0).toUpperCase() || 'A'}
                        </Text>
                    </View>
                    <View style={styles.headerText}>
                        <Text style={styles.authorName}>{post.author_name || 'Anonymous'}</Text>
                        <Text style={styles.roleTag}>{getRoleTag()}</Text>
                        <Text style={styles.timestamp}>{formatTimeAgo(post.created_at)}</Text>
                    </View>
                </View>

                {/* More Menu (for author or admin) */}
                {(isAuthor || isAdmin) && (
                    <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
                        <MoreVertical size={20} color={Colors.light.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Menu Options */}
            {showMenu && (
                <View style={styles.menu}>
                    {isAuthor && (
                        <TouchableOpacity style={styles.menuItem} onPress={onEditPress}>
                            <Text style={styles.menuText}>Edit Post</Text>
                        </TouchableOpacity>
                    )}
                    {(isAuthor || isAdmin) && (
                        <TouchableOpacity style={styles.menuItem} onPress={onDeletePress}>
                            <Text style={[styles.menuText, styles.menuTextDanger]}>Delete Post</Text>
                        </TouchableOpacity>
                    )}
                    {isAdmin && post.tier === 'local' && (
                        <TouchableOpacity style={styles.menuItem} onPress={onPinPress}>
                            <Text style={styles.menuText}>
                                {post.is_pinned ? 'Unpin Post' : 'Pin Post'}
                            </Text>
                        </TouchableOpacity>
                    )}
                    {!isAuthor && (
                        <TouchableOpacity style={styles.menuItem} onPress={handleReport}>
                            <Text style={[styles.menuText, styles.menuTextDanger]}>Report Post</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Content */}
            <Text style={styles.content}>{formattedContent}</Text>

            {/* Event Date */}
            {post.event_date && (
                <View style={styles.eventDate}>
                    <Text style={styles.eventDateText}>
                        📅 {new Date(post.event_date).toLocaleDateString()}
                    </Text>
                </View>
            )}

            {/* Media */}
            {photos.length > 0 && <FeedMediaCarousel media={photos} />}
            {video && <FeedVideoPlayer media={video} />}

            {/* Engagement Row */}
            <View style={styles.engagementRow}>
                <TouchableOpacity style={styles.engagementButton} onPress={handleLike}>
                    <Heart
                        size={22}
                        color={liked ? Colors.light.error : Colors.light.textSecondary}
                        fill={liked ? Colors.light.error : 'transparent'}
                    />
                    <Text style={[styles.engagementText, liked && styles.engagementTextActive]}>
                        {likeCount}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.engagementButton} onPress={onCommentPress}>
                    <MessageCircle size={22} color={Colors.light.textSecondary} />
                    <Text style={styles.engagementText}>{post.comment_count}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.engagementButton} onPress={handleShare}>
                    <Share2 size={22} color={Colors.light.textSecondary} />
                    <Text style={styles.engagementText}>{post.share_count}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.engagementButton} onPress={handleSave}>
                    <Bookmark
                        size={22}
                        color={saved ? Colors.light.primary : Colors.light.textSecondary}
                        fill={saved ? Colors.light.primary : 'transparent'}
                    />
                </TouchableOpacity>
            </View>

            {/* Share Sheet */}
            {user && (
                <FeedShareSheet
                    visible={showShareSheet}
                    onClose={() => setShowShareSheet(false)}
                    postId={post.id}
                    postContent={post.content}
                    userId={user.id}
                />
            )}

            {/* Report Modal */}
            {user && (
                <ReportContentModal
                    visible={showReportModal}
                    onClose={() => setShowReportModal(false)}
                    postId={post.id}
                    userId={user.id}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.light.card,
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 16,
        padding: 16,
        shadowColor: Colors.light.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    pinnedBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: Colors.light.primaryLight,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginBottom: 12,
    },
    pinnedText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.light.primary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.light.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.surfaceSecondary,
    },
    headerText: {
        marginLeft: 12,
        flex: 1,
    },
    authorName: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.light.text,
    },
    roleTag: {
        fontSize: 13,
        fontWeight: '500',
        color: Colors.light.primary,
        marginTop: 2,
    },
    timestamp: {
        fontSize: 12,
        color: Colors.light.textSecondary,
        marginTop: 2,
    },
    menu: {
        backgroundColor: Colors.light.surface,
        borderRadius: 8,
        padding: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    menuItem: {
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    menuText: {
        fontSize: 15,
        color: Colors.light.text,
    },
    menuTextDanger: {
        color: Colors.light.error,
    },
    content: {
        fontSize: 15,
        lineHeight: 22,
        color: Colors.light.text,
        marginBottom: 12,
    },
    eventDate: {
        backgroundColor: Colors.light.primaryLight,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 12,
        alignSelf: 'flex-start',
    },
    eventDateText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.primary,
    },
    engagementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.light.borderLight,
        marginTop: 12,
    },
    engagementButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    engagementText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.textSecondary,
    },
    engagementTextActive: {
        color: Colors.light.error,
    },
});
