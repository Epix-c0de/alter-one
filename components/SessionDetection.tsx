import React, { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';
import { findNearbySession } from '@/lib/geofencing';
import Colors from '@/constants/colors';
import { Database } from '@/types/database';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import SignUpPrompt from './SignUpPrompt';
import { shouldShowPrompt, recordPromptShown } from '@/lib/auth-prompt';

type Session = Database['public']['Tables']['sessions']['Row'];

const SessionDetection = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [detectedSession, setDetectedSession] = useState<Session | null>(null);
    const [parishName, setParishName] = useState<string>('');
    const [showAuthPrompt, setShowAuthPrompt] = useState(false);
    const router = useRouter();
    const { user, isGuest } = useAuth();

    useEffect(() => {
        let subscription: Location.LocationSubscription | null = null;

        const startLocationTracking = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            // Check initially
            const location = await Location.getCurrentPositionAsync({});
            checkSessions(location);

            // Subscribe to updates (every 60 seconds or 100 meters to save battery)
            subscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.Balanced,
                    timeInterval: 60000,
                    distanceInterval: 100,
                },
                (newLocation) => {
                    checkSessions(newLocation);
                }
            );
        };

        startLocationTracking();

        return () => {
            if (subscription) {
                subscription.remove();
            }
        };
    }, []);

    const checkSessions = async (location: Location.LocationObject) => {
        try {
            // 1. Get active sessions
            const { data: activeSessions, error } = await supabase
                .from('sessions')
                .select('*, parishes(parish_name)')
                .eq('is_active', true);

            if (error || !activeSessions) return;

            // 2. Find nearby
            // Note: activeSessions returned by supabase join will have parishes object. 
            // We need to cast or handle it. 
            // For simplicity in this component, we'll just treat it as Session and extract parish_name separately if needed,
            // but supabase-js types might be tricky with joins. 
            // Let's just find the session first.

            const nearby = findNearbySession(location, activeSessions as any); // Type assertion for now due to join

            if (nearby && nearby.id !== detectedSession?.id) {
                setDetectedSession(nearby);
                // Extract parish name if available from the join
                const parish = (nearby as any).parishes;
                setParishName(parish?.parish_name || 'Unknown Parish');
                setModalVisible(true);
            }
        } catch (e) {
            console.error('Error checking sessions:', e);
        }
    };

    const handleConnect = async () => {
        if (!detectedSession) return;

        // Check if user is authenticated
        if (isGuest) {
            const canShow = await shouldShowPrompt('session');
            if (canShow) {
                setModalVisible(false);
                setShowAuthPrompt(true);
            }
            return;
        }

        setModalVisible(false);
        // Navigate to the session page
        router.push(`/session/${detectedSession.id}` as any);
    };

    const handleSignUp = () => {
        setShowAuthPrompt(false);
        recordPromptShown('signup');
        router.push('/(tabs)/profile' as any);
    };

    const handleDismissPrompt = () => {
        setShowAuthPrompt(false);
        recordPromptShown('later');
    };

    const handleIgnorePrompt = () => {
        setShowAuthPrompt(false);
        recordPromptShown('ignore');
    };

    return (
        <>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>New Session Detected!</Text>
                        <Text style={styles.modalText}>
                            A session is active in your area.
                        </Text>
                        <Text style={styles.parishName}>Parish: {parishName}</Text>

                        <Text style={styles.question}>Would you like to connect?</Text>

                        <TouchableOpacity
                            style={[styles.button, styles.buttonConnect]}
                            onPress={handleConnect}
                        >
                            <Text style={styles.textStyle}>Connect Automatically</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.textStyleCancel}>No, thanks</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <SignUpPrompt
                visible={showAuthPrompt}
                onDismiss={handleDismissPrompt}
                onSignUp={handleSignUp}
                onIgnore={handleIgnorePrompt}
                context="session"
            />
        </>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        color: Colors.light.primary,
    },
    modalText: {
        marginBottom: 10,
        textAlign: 'center',
        fontSize: 16,
    },
    parishName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 20,
        textAlign: 'center',
        color: Colors.light.text,
    },
    question: {
        marginBottom: 20,
        textAlign: 'center',
        color: Colors.light.textSecondary,
    },
    button: {
        borderRadius: 12,
        padding: 15,
        elevation: 2,
        width: '100%',
        marginBottom: 10,
    },
    buttonConnect: {
        backgroundColor: Colors.light.primary,
    },
    buttonClose: {
        backgroundColor: Colors.light.surfaceSecondary,
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
    textStyleCancel: {
        color: Colors.light.text,
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
});

export default SessionDetection;
