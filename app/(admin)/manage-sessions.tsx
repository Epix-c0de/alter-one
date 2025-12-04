import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/colors';
import { Trash2, MapPin } from 'lucide-react-native';
import { Database } from '@/types/database';

type Session = Database['public']['Tables']['sessions']['Row'] & {
    parishes: { parish_name: string } | null;
    users: { name: string | null } | null;
};

const ManageSessions = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('sessions')
                .select(`
          *,
          parishes (parish_name),
          users (name)
        `)
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSessions(data as any); // Type assertion for joined data
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleDeactivate = async (sessionId: string) => {
        Alert.alert(
            'Confirm Deactivation',
            'Are you sure you want to deactivate this session? Users will no longer be able to connect.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Deactivate',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { error } = await supabase
                                .from('sessions')
                                .update({ is_active: false })
                                .eq('id', sessionId);

                            if (error) throw error;

                            setSessions(prev => prev.filter(s => s.id !== sessionId));
                            Alert.alert('Success', 'Session deactivated.');
                        } catch (error: any) {
                            Alert.alert('Error', error.message);
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: Session }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.parishName}>{item.parishes?.parish_name || 'Unknown Parish'}</Text>
                    <Text style={styles.sessionCode}>Code: {item.session_code}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDeactivate(item.id)} style={styles.deleteButton}>
                    <Trash2 color={Colors.light.error} size={20} />
                </TouchableOpacity>
            </View>

            <View style={styles.details}>
                <View style={styles.detailRow}>
                    <MapPin size={14} color={Colors.light.textSecondary} />
                    <Text style={styles.detailText}>
                        {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                    </Text>
                </View>
                <Text style={styles.detailText}>Radius: {item.radius}m</Text>
            </View>

            <View style={styles.footer}>
                <Text style={styles.createdBy}>Created by: {item.users?.name || 'Unknown'}</Text>
                <Text style={styles.time}>{new Date(item.created_at).toLocaleString()}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Active Sessions</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={Colors.light.primary} style={styles.loader} />
            ) : (
                <FlatList
                    data={sessions}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No active sessions found.</Text>
                    }
                    onRefresh={fetchSessions}
                    refreshing={loading}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.surface,
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.light.text,
    },
    loader: {
        marginTop: 20,
    },
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: Colors.light.surfaceSecondary,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    parishName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.light.text,
        marginBottom: 4,
    },
    sessionCode: {
        fontSize: 14,
        color: Colors.light.primary,
        fontWeight: '600',
    },
    deleteButton: {
        padding: 8,
    },
    details: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        fontSize: 14,
        color: Colors.light.textSecondary,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    createdBy: {
        fontSize: 12,
        color: Colors.light.textTertiary,
    },
    time: {
        fontSize: 12,
        color: Colors.light.textTertiary,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: Colors.light.textSecondary,
        fontSize: 16,
    },
});

export default ManageSessions;
