import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import Colors from '@/constants/colors';
import { Lock, Sparkles } from 'lucide-react-native';
import { PromptContext } from '@/lib/auth-prompt';

interface SignUpPromptProps {
    visible: boolean;
    onDismiss: () => void;
    onSignUp: () => void;
    onIgnore: () => void;
    context: PromptContext;
}

const CONTEXT_MESSAGES: Record<PromptContext, { title: string; description: string }> = {
    session: {
        title: 'Connect to Parish Session',
        description: 'To join live parish sessions and access real-time content, please create your account.',
    },
    favorites: {
        title: 'Save Your Favorites',
        description: 'Create an account to save and sync your favorite hymns, prayers, and readings across devices.',
    },
    premium: {
        title: 'Unlock Premium Features',
        description: 'Access AI-powered features, advanced search, and exclusive content with your account.',
    },
    download: {
        title: 'Download Content',
        description: 'Sign in to download hymns, readings, and prayers for offline access.',
    },
    general: {
        title: 'Create Your Account',
        description: 'Unlock full parish access, personalized content, and connect with your local church community.',
    },
};

const SignUpPrompt: React.FC<SignUpPromptProps> = ({
    visible,
    onDismiss,
    onSignUp,
    onIgnore,
    context,
}) => {
    const message = CONTEXT_MESSAGES[context] || CONTEXT_MESSAGES.general;

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onDismiss}
        >
            <View style={styles.centeredView}>
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill}>
                    <TouchableOpacity
                        style={styles.backdrop}
                        activeOpacity={1}
                        onPress={onDismiss}
                    />
                </BlurView>

                <Animated.View style={styles.modalView}>
                    <View style={styles.iconContainer}>
                        <Lock color={Colors.light.primary} size={48} />
                    </View>

                    <Text style={styles.modalTitle}>{message.title}</Text>

                    <Text style={styles.modalDescription}>{message.description}</Text>

                    <View style={styles.benefitsList}>
                        <View style={styles.benefitItem}>
                            <Sparkles color={Colors.light.primary} size={16} />
                            <Text style={styles.benefitText}>Access parish-specific content</Text>
                        </View>
                        <View style={styles.benefitItem}>
                            <Sparkles color={Colors.light.primary} size={16} />
                            <Text style={styles.benefitText}>Save favorites & sync across devices</Text>
                        </View>
                        <View style={styles.benefitItem}>
                            <Sparkles color={Colors.light.primary} size={16} />
                            <Text style={styles.benefitText}>Receive personalized notifications</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, styles.buttonPrimary]}
                        onPress={onSignUp}
                    >
                        <Text style={styles.buttonTextPrimary}>Sign Up Now</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.buttonSecondary]}
                        onPress={onDismiss}
                    >
                        <Text style={styles.buttonTextSecondary}>Maybe Later</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.buttonText}
                        onPress={onIgnore}
                    >
                        <Text style={styles.linkText}>Don't Show Again for Today</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
        width: '90%',
        maxWidth: 400,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: `${Colors.light.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
        color: Colors.light.text,
    },
    modalDescription: {
        fontSize: 16,
        marginBottom: 24,
        textAlign: 'center',
        color: Colors.light.textSecondary,
        lineHeight: 24,
    },
    benefitsList: {
        width: '100%',
        marginBottom: 24,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingLeft: 8,
    },
    benefitText: {
        fontSize: 14,
        color: Colors.light.text,
        marginLeft: 12,
        flex: 1,
    },
    button: {
        borderRadius: 12,
        padding: 16,
        width: '100%',
        marginBottom: 12,
        alignItems: 'center',
    },
    buttonPrimary: {
        backgroundColor: Colors.light.primary,
    },
    buttonSecondary: {
        backgroundColor: Colors.light.surfaceSecondary,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    buttonTextPrimary: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    buttonTextSecondary: {
        color: Colors.light.text,
        fontWeight: '600',
        fontSize: 16,
    },
    buttonText: {
        marginTop: 8,
    },
    linkText: {
        color: Colors.light.textTertiary,
        fontSize: 14,
        textDecorationLine: 'underline',
    },
});

export default SignUpPrompt;
