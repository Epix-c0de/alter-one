import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Heart, Send } from 'lucide-react-native';
import Colors from '@/constants/colors';
import type { FeedComment } from '@/types/feed.types';
import { fetchPostComments, commentOnPost, toggleLikeComment, deleteComment } from '@/lib/feed';
import { formatTimeAgo } from '@/lib/time-formatter';
import { useAuth } from '@/context/AuthContext';

interface FeedCommentSectionProps {
    postId: string;
    onClose?: () => void;
}

export default function FeedCommentSection({ postId, onClose }: FeedCommentSectionProps) {
    const { user } = useAuth();
    const [comments, setComments] = useState<FeedComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [replyingTo, setReplyingTo] = useState<FeedComment | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadComments();
    }, [postId]);

    const loadComments = async () => {
        if (!user) return;

        setLoading(true);
        const { data, error } = await fetchPostComments(postId, user.id);

        if (error) {
            Alert.alert('Error', 'Failed to load comments');
        } else {
            setComments(data || []);
        }
        setLoading(false);
    };

    const handleSubmitComment = async () => {
        if (!user || !commentText.trim()) return;

        setSubmitting(true);
        const { data, error } = await commentOnPost(
            postId,
            user.id,
            commentText.trim(),
            replyingTo?.id
        );

        if (error) {
            Alert.alert('Error', 'Failed to post comment');
        } else {
            setCommentText('');
            setReplyingTo(null);
            await loadComments();
        }
        setSubmitting(false);
    };

    const handleLikeComment = async (commentId: string) => {
        if (!user) return;

        const { error } = await toggleLikeComment(commentId, user.id);

        if (error) {
            Alert.alert('Error', 'Failed to like comment');
        } else {
            await loadComments();
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        Alert.alert(
            'Delete Comment',
            'Are you sure you want to delete this comment?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const { error } = await deleteComment(commentId);
                        if (error) {
                            Alert.alert('Error', 'Failed to delete comment');
                        } else {
                            await loadComments();
                        }
                    },
                },
            ]
        );
    };

    const renderComment = ({ item }: { item: FeedComment }) => {
        const isAuthor = user?.id === item.user_id;
        const isAdmin = user?.role === 'admin' || user?.role === 'junior_admin';

        return (
            <View style={styles.commentContainer}>
                <View style={styles.commentHeader}>
                    <View style={styles.commentAvatar}>
                        <Text style={styles.commentAvatarText}>
                            {item.user_name?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <View style={styles.commentContent}>
                        <Text style={styles.commentAuthor}>{item.user_name || 'Anonymous'}</Text>
                        <Text style={styles.commentText}>{item.content}</Text>
                        <View style={styles.commentFooter}>
                            <Text style={styles.commentTime}>{formatTimeAgo(item.created_at)}</Text>
                            <TouchableOpacity onPress={() => handleLikeComment(item.id)}>
                                <Text
                                    style={[
                                        styles.commentAction,
                                        item.user_has_liked && styles.commentActionActive,
                                    ]}
                                >
                                    {item.user_has_liked ? '❤️' : '🤍'} {item.like_count}
                                </Text>
                            </TouchableOpacity>
                            {!item.parent_comment_id && (
                                <TouchableOpacity onPress={() => setReplyingTo(item)}>
                                    <Text style={styles.commentAction}>Reply</Text>
                                </TouchableOpacity>
                            )}
                            {(isAuthor || isAdmin) && (
                                <TouchableOpacity onPress={() => handleDeleteComment(item.id)}>
                                    <Text style={[styles.commentAction, styles.commentActionDanger]}>
                                        Delete
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>

                {/* Replies */}
                {item.replies && item.replies.length > 0 && (
                    <View style={styles.repliesContainer}>
                        {item.replies.map((reply) => (
                            <View key={reply.id} style={styles.replyContainer}>
                                <View style={styles.replyAvatar}>
                                    <Text style={styles.replyAvatarText}>
                                        {reply.user_name?.charAt(0).toUpperCase() || 'U'}
                                    </Text>
                                </View>
                                <View style={styles.replyContent}>
                                    <Text style={styles.replyAuthor}>{reply.user_name || 'Anonymous'}</Text>
                                    <Text style={styles.replyText}>{reply.content}</Text>
                                    <View style={styles.replyFooter}>
                                        <Text style={styles.replyTime}>{formatTimeAgo(reply.created_at)}</Text>
                                        <TouchableOpacity onPress={() => handleLikeComment(reply.id)}>
                                            <Text
                                                style={[
                                                    styles.commentAction,
                                                    reply.user_has_liked && styles.commentActionActive,
                                                ]}
                                            >
                                                {reply.user_has_liked ? '❤️' : '🤍'} {reply.like_count}
                                            </Text>
                                        </TouchableOpacity>
                                        {(user?.id === reply.user_id || isAdmin) && (
                                            <TouchableOpacity onPress={() => handleDeleteComment(reply.id)}>
                                                <Text style={[styles.commentAction, styles.commentActionDanger]}>
                                                    Delete
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Comments List */}
            {loading ? (
                <ActivityIndicator size="large" color={Colors.light.primary} style={styles.loader} />
            ) : (
                <FlatList
                    data={comments}
                    renderItem={renderComment}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.commentsList}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No comments yet. Be the first to comment!</Text>
                    }
                />
            )}

            {/* Comment Input */}
            <View style={styles.inputContainer}>
                {replyingTo && (
                    <View style={styles.replyingBanner}>
                        <Text style={styles.replyingText}>
                            Replying to {replyingTo.user_name}
                        </Text>
                        <TouchableOpacity onPress={() => setReplyingTo(null)}>
                            <Text style={styles.cancelReply}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                )}
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.input}
                        placeholder="Write a comment..."
                        placeholderTextColor={Colors.light.textSecondary}
                        value={commentText}
                        onChangeText={setCommentText}
                        multiline
                        maxLength={500}
                    />
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            (!commentText.trim() || submitting) && styles.sendButtonDisabled,
                        ]}
                        onPress={handleSubmitComment}
                        disabled={!commentText.trim() || submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Send size={20} color="#fff" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.surface,
    },
    loader: {
        marginTop: 40,
    },
    commentsList: {
        padding: 16,
    },
    emptyText: {
        textAlign: 'center',
        color: Colors.light.textSecondary,
        fontSize: 15,
        marginTop: 40,
    },
    commentContainer: {
        marginBottom: 20,
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    commentAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.light.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    commentAvatarText: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.light.surfaceSecondary,
    },
    commentContent: {
        flex: 1,
        marginLeft: 12,
    },
    commentAuthor: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 4,
    },
    commentText: {
        fontSize: 14,
        color: Colors.light.text,
        lineHeight: 20,
        marginBottom: 6,
    },
    commentFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    commentTime: {
        fontSize: 12,
        color: Colors.light.textSecondary,
    },
    commentAction: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.light.textSecondary,
    },
    commentActionActive: {
        color: Colors.light.error,
    },
    commentActionDanger: {
        color: Colors.light.error,
    },
    repliesContainer: {
        marginLeft: 48,
        marginTop: 12,
    },
    replyContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    replyAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.light.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    replyAvatarText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.light.primary,
    },
    replyContent: {
        flex: 1,
        marginLeft: 10,
    },
    replyAuthor: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 2,
    },
    replyText: {
        fontSize: 13,
        color: Colors.light.text,
        lineHeight: 18,
        marginBottom: 4,
    },
    replyFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    replyTime: {
        fontSize: 11,
        color: Colors.light.textSecondary,
    },
    inputContainer: {
        borderTopWidth: 1,
        borderTopColor: Colors.light.border,
        backgroundColor: Colors.light.surfaceSecondary,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    replyingBanner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.light.primaryLight,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 8,
    },
    replyingText: {
        fontSize: 13,
        color: Colors.light.primary,
        fontWeight: '600',
    },
    cancelReply: {
        fontSize: 13,
        color: Colors.light.error,
        fontWeight: '600',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
    },
    input: {
        flex: 1,
        backgroundColor: Colors.light.surface,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        color: Colors.light.text,
        maxHeight: 100,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.light.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: Colors.light.borderLight,
    },
});
