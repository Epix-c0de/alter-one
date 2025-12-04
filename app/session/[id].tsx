import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { fetchSessionContent, SessionContent } from '@/lib/session-content';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

type Session = Database['public']['Tables']['sessions']['Row'];

const SessionView = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [session, setSession] = useState<Session | null>(null);
    const [content, setContent] = useState<SessionContent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadSessionData(id);
        }
    }, [id]);

    const loadSessionData = async (sessionId: string) => {
        try {
            setLoading(true);
            // 1. Fetch Session Details
            const { data: sessionData, error } = await supabase
                .from('sessions')
                .select('*')
                .eq('id', sessionId)
                .single();

            if (error) throw error;
            setSession(sessionData);

            // 2. Fetch Content
            const contentData = await fetchSessionContent(sessionId);
            setContent(contentData);

        } catch (error) {
            console.error('Error loading session:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
            </SafeAreaView>
        );
    }

    if (!session) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>Session not found or ended.</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{session.title || 'Live Session'}</Text>
                <Text style={styles.subtitle}>{session.session_type?.toUpperCase()} • {new Date(session.start_time || '').toLocaleTimeString()}</Text>
            </View>

            <ScrollView style={styles.contentContainer}>
                {/* Readings Section */}
                {content?.readings && content.readings.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Readings</Text>
                        {content.readings.map((reading) => (
                            <View key={reading.id} style={styles.card}>
                                <Text style={styles.cardTitle}>{reading.title}</Text>
                                <Text style={styles.cardBody} numberOfLines={3}>{reading.content}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Songs Section */}
                {content?.songs && content.songs.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Hymns & Songs</Text>
                        {content.songs.map((song) => (
                            <View key={song.id} style={styles.card}>
                                <Text style={styles.cardTitle}>{song.title}</Text>
                                <Text style={styles.cardBody}>Lyrics available</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Prayers Section */}
                {content?.prayers && content.prayers.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Prayers</Text>
                        {content.prayers.map((prayer) => (
                            <View key={prayer.id} style={styles.card}>
                                <Text style={styles.cardTitle}>{prayer.prayer_title}</Text>
                                <Text style={styles.cardBody} numberOfLines={2}>{prayer.prayer_text}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {(!content?.readings.length && !content?.songs.length && !content?.prayers.length) && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No content pinned to this session yet.</Text>
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.surface,
    },
    header: {
        padding: 20,
        backgroundColor: Colors.light.surfaceSecondary,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.light.text,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        marginTop: 4,
    },
    contentContainer: {
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.light.primary,
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
        color: Colors.light.text,
    },
    cardBody: {
        fontSize: 14,
        color: Colors.light.textSecondary,
    },
    errorText: {
        fontSize: 18,
        color: Colors.light.error,
        textAlign: 'center',
        marginTop: 50,
    },
    backButton: {
        marginTop: 20,
        alignSelf: 'center',
        padding: 10,
    },
    backButtonText: {
        color: Colors.light.primary,
        fontSize: 16,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: Colors.light.textTertiary,
        fontStyle: 'italic',
    }
});

export default SessionView;
