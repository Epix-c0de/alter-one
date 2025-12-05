import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, AlertTriangle, Trash2, CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { deletePost } from '@/lib/feed';
import FeedPostCard from '@/components/feed/FeedPostCard';

interface ReportedPost {
    id: string;
    post_id: string;
    user_id: string;
    reason: string;
    created_at: string;
    post: any;
    reporter_name: string;
}

export default function ModerationDashboard() {
    const router = useRouter();
    const { user } = useAuth();
    const [reports, setReports] = useState<ReportedPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        setLoading(true);

        const { data, error } = await supabase
            .from('feed_reports')
            .select(`
        id,
        post_id,
        user_id,
        reason,
        created_at,
        feed_posts (
          id,
          content,
          tier,
          post_type,
          author_id,
          parish_id,
          created_at,
          updated_at,
          like_count,
          comment_count,
          share_count,
          is_pinned,
          event_date,
          users!feed_posts_author_id_fkey (
            id,
            full_name,
            role
          ),
          parishes (
            parish_name
          )
        ),
        users!feed_reports_user_id_fkey (
          full_name
        )
      `)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Error loading reports:', error);
            Alert.alert('Error', 'Failed to load reports');
        } else {
            const formattedReports = (data || []).map((report: any) => ({
                id: report.id,
                post_id: report.post_id,
                user_id: report.user_id,
                reason: report.reason,
                created_at: report.created_at,
                post: report.feed_posts,
                reporter_name: report.users?.full_name || 'Anonymous',
            }));
            setReports(formattedReports);
        }

        setLoading(false);
        setRefreshing(false);
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadReports();
    };

    const handleDismissReport = async (reportId: string) => {
        Alert.alert(
            'Dismiss Report',
            'Are you sure you want to dismiss this report? The post will remain visible.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Dismiss',
                    onPress: async () => {
                        setProcessingId(reportId);

                        const { error } = await supabase
                            .from('feed_reports')
                            .delete()
                            .eq('id', reportId);

                        if (error) {
                            Alert.alert('Error', 'Failed to dismiss report');
                        } else {
                            setReports(reports.filter((r) => r.id !== reportId));
                        }

                        setProcessingId(null);
                    },
                },
            ]
        );
    };

    const handleDeletePost = async (reportId: string, postId: string) => {
        Alert.alert(
            'Delete Post',
            'Are you sure you want to delete this post? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        if (!user) return;

                        setProcessingId(reportId);

                        const { error } = await deletePost(postId, user.id);

                        if (error) {
                            Alert.alert('Error', 'Failed to delete post');
                        } else {
                            // Remove all reports for this post
                            await supabase.from('feed_reports').delete().eq('post_id', postId);

                            setReports(reports.filter((r) => r.post_id !== postId));
                            Alert.alert('Success', 'Post deleted successfully');
                        }

                        setProcessingId(null);
                    },
                },
            ]
        );
    };

    const renderReport = ({ item }: { item: ReportedPost }) => {
        if (!item.post) {
            return null; // Post was already deleted
        }

        const post = {
            id: item.post.id,
            content: item.post.content,
            tier: item.post.tier,
            post_type: item.post.post_type,
            author_id: item.post.author_id,
            parish_id: item.post.parish_id,
            author_name: item.post.users?.full_name || 'Unknown',
            author_role: item.post.users?.role || 'user',
            parish_name: item.post.parishes?.parish_name || '',
            created_at: item.post.created_at,
            updated_at: item.post.updated_at,
            like_count: item.post.like_count,
            comment_count: item.post.comment_count,
            share_count: item.post.share_count,
            is_pinned: item.post.is_pinned,
            event_date: item.post.event_date,
            media: [],
            user_has_liked: false,
            user_has_saved: false,
        };

        return (
            <View style={styles.reportCard}>
                {/* Report Info */}
                <View style={styles.reportHeader}>
                    <View style={styles.reportHeaderLeft}>
                        <AlertTriangle size={20} color={Colors.light.error} />
                        <View style={styles.reportHeaderText}>
                            <Text style={styles.reportReason}>{item.reason}</Text>
                            <Text style={styles.reportMeta}>
                                Reported by {item.reporter_name} •{' '}
                                {new Date(item.created_at).toLocaleDateString()}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Post Preview */}
                <FeedPostCard post={post} />

                {/* Actions */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.dismissButton]}
                        onPress={() => handleDismissReport(item.id)}
                        disabled={processingId === item.id}
                    >
                        {processingId === item.id ? (
                            <ActivityIndicator size="small" color={Colors.light.primary} />
                        ) : (
                            <>
                                <CheckCircle size={18} color={Colors.light.primary} />
                                <Text style={styles.dismissButtonText}>Dismiss</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDeletePost(item.id, item.post_id)}
                        disabled={processingId === item.id}
                    >
                        {processingId === item.id ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Trash2 size={18} color="#fff" />
                                <Text style={styles.deleteButtonText}>Delete Post</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderEmpty = () => {
        if (loading) return null;
        return (
            <View style={styles.emptyContainer}>
                <CheckCircle size={64} color={Colors.light.success} />
                <Text style={styles.emptyTitle}>No Reports</Text>
                <Text style={styles.emptyText}>
                    All clear! There are no reported posts to review.
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
                <Text style={styles.headerTitle}>Content Moderation</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Reports Count */}
            {!loading && reports.length > 0 && (
                <View style={styles.countBanner}>
                    <Text style={styles.countText}>
                        {reports.length} {reports.length === 1 ? 'report' : 'reports'} pending review
                    </Text>
                </View>
            )}

            {/* Reports List */}
            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={Colors.light.primary} />
                </View>
            ) : (
                <FlatList
                    data={reports}
                    renderItem={renderReport}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={Colors.light.primary}
                        />
                    }
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
    countBanner: {
        backgroundColor: Colors.light.errorLight,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    countText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.error,
        textAlign: 'center',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingVertical: 8,
    },
    reportCard: {
        marginHorizontal: 16,
        marginVertical: 8,
        backgroundColor: Colors.light.card,
        borderRadius: 16,
        padding: 16,
        shadowColor: Colors.light.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    reportHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.borderLight,
    },
    reportHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
        gap: 10,
    },
    reportHeaderText: {
        flex: 1,
    },
    reportReason: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.light.error,
        marginBottom: 4,
    },
    reportMeta: {
        fontSize: 13,
        color: Colors.light.textSecondary,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.light.borderLight,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12,
    },
    dismissButton: {
        backgroundColor: Colors.light.primaryLight,
    },
    dismissButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.light.primary,
    },
    deleteButton: {
        backgroundColor: Colors.light.error,
    },
    deleteButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
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
