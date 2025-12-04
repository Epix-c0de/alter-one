import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { X, AlertTriangle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { reportPost } from '@/lib/feed';

interface ReportContentModalProps {
    visible: boolean;
    onClose: () => void;
    postId: string;
    userId: string;
}

const REPORT_REASONS = [
    'Inappropriate content',
    'Spam or misleading',
    'Harassment or hate speech',
    'Violence or dangerous content',
    'False information',
    'Other',
];

export default function ReportContentModal({
    visible,
    onClose,
    postId,
    userId,
}: ReportContentModalProps) {
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [customReason, setCustomReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        const reason = selectedReason === 'Other' ? customReason : selectedReason;

        if (!reason || reason.trim().length === 0) {
            Alert.alert('Error', 'Please select or enter a reason for reporting');
            return;
        }

        setSubmitting(true);

        const { error } = await reportPost(postId, userId, reason.trim());

        if (error) {
            Alert.alert('Error', 'Failed to submit report. Please try again.');
        } else {
            Alert.alert(
                'Report Submitted',
                'Thank you for helping keep our community safe. We will review this content.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            setSelectedReason(null);
                            setCustomReason('');
                            onClose();
                        },
                    },
                ]
            );
        }

        setSubmitting(false);
    };

    const handleClose = () => {
        setSelectedReason(null);
        setCustomReason('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerIcon}>
                            <AlertTriangle size={24} color={Colors.light.error} />
                        </View>
                        <Text style={styles.title}>Report Content</Text>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <X size={24} color={Colors.light.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Description */}
                    <Text style={styles.description}>
                        Help us understand what's wrong with this post. Your report is anonymous.
                    </Text>

                    {/* Reason Options */}
                    <View style={styles.reasons}>
                        {REPORT_REASONS.map((reason) => (
                            <TouchableOpacity
                                key={reason}
                                style={[
                                    styles.reasonOption,
                                    selectedReason === reason && styles.reasonOptionActive,
                                ]}
                                onPress={() => setSelectedReason(reason)}
                            >
                                <View
                                    style={[
                                        styles.radio,
                                        selectedReason === reason && styles.radioActive,
                                    ]}
                                >
                                    {selectedReason === reason && <View style={styles.radioDot} />}
                                </View>
                                <Text
                                    style={[
                                        styles.reasonText,
                                        selectedReason === reason && styles.reasonTextActive,
                                    ]}
                                >
                                    {reason}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Custom Reason Input */}
                    {selectedReason === 'Other' && (
                        <TextInput
                            style={styles.customInput}
                            placeholder="Please describe the issue..."
                            placeholderTextColor={Colors.light.textSecondary}
                            multiline
                            value={customReason}
                            onChangeText={setCustomReason}
                            maxLength={500}
                        />
                    )}

                    {/* Actions */}
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleClose}
                            disabled={submitting}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                (!selectedReason || submitting) && styles.submitButtonDisabled,
                            ]}
                            onPress={handleSubmit}
                            disabled={!selectedReason || submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Submit Report</Text>
                            )}
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modal: {
        backgroundColor: Colors.light.surfaceSecondary,
        borderRadius: 20,
        width: '100%',
        maxWidth: 400,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 12,
    },
    headerIcon: {
        width: 32,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.text,
        flex: 1,
        textAlign: 'center',
    },
    closeButton: {
        padding: 4,
    },
    description: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        paddingHorizontal: 20,
        marginBottom: 20,
        lineHeight: 20,
    },
    reasons: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    reasonOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: Colors.light.surface,
    },
    reasonOptionActive: {
        backgroundColor: Colors.light.primaryLight,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colors.light.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    radioActive: {
        borderColor: Colors.light.primary,
    },
    radioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.light.primary,
    },
    reasonText: {
        fontSize: 15,
        color: Colors.light.text,
        flex: 1,
    },
    reasonTextActive: {
        fontWeight: '600',
        color: Colors.light.primary,
    },
    customInput: {
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 12,
        backgroundColor: Colors.light.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.light.border,
        fontSize: 15,
        color: Colors.light.text,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: Colors.light.surface,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.light.text,
    },
    submitButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: Colors.light.error,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: Colors.light.borderLight,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});
