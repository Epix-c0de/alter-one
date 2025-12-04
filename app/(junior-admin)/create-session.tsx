import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/colors';
import { findNearbySession } from '@/lib/geofencing';
import { useRouter } from 'expo-router';
import { Database } from '@/types/database';

type Session = Database['public']['Tables']['sessions']['Row'];

const SESSION_TYPES = ['mass', 'live', 'meeting', 'other'] as const;

const CreateSession = () => {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState<string | null>(null);

    // New fields
    const [title, setTitle] = useState('');
    const [sessionType, setSessionType] = useState<typeof SESSION_TYPES[number]>('mass');
    const [durationMinutes, setDurationMinutes] = useState('60');

    const router = useRouter();

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setStatusMsg('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
        })();
    }, []);

    const generateSessionId = () => {
        return 'SJ-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    };

    const handleCreateSession = async () => {
        if (!location) {
            Alert.alert('Error', 'Location not available yet. Please wait.');
            return;
        }
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a session title.');
            return;
        }

        setLoading(true);
        try {
            // 1. Fetch all active sessions
            const { data: activeSessions, error: fetchError } = await supabase
                .from('sessions')
                .select('*')
                .eq('is_active', true);

            if (fetchError) throw fetchError;

            // 2. Check for conflicts
            const conflict = findNearbySession(location, activeSessions || []);
            if (conflict) {
                Alert.alert('Error', 'A session is already active in this area (within 500m).');
                setLoading(false);
                return;
            }

            // 3. Create new session
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError || !userData.user) {
                Alert.alert('Error', 'User not authenticated');
                setLoading(false);
                return;
            }

            const { data: userProfile, error: profileError } = await supabase
                .from('users')
                .select('parish_id, local_church_id')
                .eq('id', userData.user.id)
                .single();

            if (profileError || !userProfile) {
                Alert.alert('Error', 'Could not fetch user profile details.');
                setLoading(false);
                return;
            }

            const startTime = new Date();
            const endTime = new Date(startTime.getTime() + parseInt(durationMinutes) * 60000);

            const newSession = {
                session_code: generateSessionId(),
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                radius: 500,
                parish_id: userProfile.parish_id || '00000000-0000-0000-0000-000000000000',
                local_church_id: userProfile.local_church_id || '00000000-0000-0000-0000-000000000000',
                created_by: userData.user.id,
                is_active: true,
                title: title,
                session_type: sessionType,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                metadata: {},
            };

            const { error: insertError } = await supabase
                .from('sessions')
                .insert(newSession);

            if (insertError) throw insertError;

            Alert.alert('Success', 'Session created successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);

        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create session');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Create New Session</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Session Title</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Sunday Mass 9AM"
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Session Type</Text>
                    <View style={styles.typeContainer}>
                        {SESSION_TYPES.map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[
                                    styles.typeButton,
                                    sessionType === type && styles.typeButtonActive
                                ]}
                                onPress={() => setSessionType(type)}
                            >
                                <Text style={[
                                    styles.typeText,
                                    sessionType === type && styles.typeTextActive
                                ]}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Duration (minutes)</Text>
                    <TextInput
                        style={styles.input}
                        value={durationMinutes}
                        onChangeText={setDurationMinutes}
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.locationCard}>
                    <Text style={styles.label}>Current Location:</Text>
                    {location ? (
                        <>
                            <Text style={styles.value}>Lat: {location.coords.latitude.toFixed(6)}</Text>
                            <Text style={styles.value}>Long: {location.coords.longitude.toFixed(6)}</Text>
                            <Text style={styles.accuracy}>Accuracy: ±{location.coords.accuracy?.toFixed(1)}m</Text>
                        </>
                    ) : (
                        <Text style={styles.waiting}>{statusMsg || 'Getting location...'}</Text>
                    )}
                </View>

                <View style={styles.infoCard}>
                    <Text style={styles.infoText}>
                        Creating a session will lock a 500m radius. No other sessions can be created in this area while this one is active.
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.button, (!location || loading) && styles.buttonDisabled]}
                    onPress={handleCreateSession}
                    disabled={!location || loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Generate Session ID</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.surface,
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        color: Colors.light.text,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: Colors.light.surfaceSecondary,
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
        color: Colors.light.text,
    },
    typeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    typeButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: Colors.light.surfaceSecondary,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    typeButtonActive: {
        backgroundColor: Colors.light.primary,
        borderColor: Colors.light.primary,
    },
    typeText: {
        color: Colors.light.text,
        fontSize: 14,
    },
    typeTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    locationCard: {
        backgroundColor: Colors.light.surfaceSecondary,
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    value: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.light.text,
        marginBottom: 4,
    },
    accuracy: {
        fontSize: 12,
        color: Colors.light.textTertiary,
        marginTop: 4,
    },
    waiting: {
        fontSize: 16,
        color: Colors.light.textSecondary,
        fontStyle: 'italic',
    },
    infoCard: {
        backgroundColor: '#e3f2fd',
        padding: 16,
        borderRadius: 12,
        marginBottom: 30,
    },
    infoText: {
        color: '#0d47a1',
        fontSize: 14,
        lineHeight: 20,
    },
    button: {
        backgroundColor: Colors.light.primary,
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default CreateSession;
