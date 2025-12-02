import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';

import Colors from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const LocalChurchIdRequestModal = ({ visible, onClose }: Props) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    if (!user) return;

    setLoading(true);
    const { error } = await supabase.from('local_church_id_requests').insert({
      user_id: user.id,
      message: 'User requested local church ID assignment',
    });

    if (error) {
      Alert.alert('Error', 'Could not submit your request. Please try again later.');
    } else {
      Alert.alert('Success', 'Your request has been sent to the parish admin.');
      onClose();
    }
    setLoading(false);
  };

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <BlurView intensity={20} tint="dark" style={styles.container}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Link Your Local Church</Text>
          <Text style={styles.description}>
            To see content relevant to you, please link your local church. You can request an ID from your church admin.
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleRequest} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={Colors.light.surface} />
            ) : (
              <Text style={styles.buttonText}>Request from Admin</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Do It Later</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: Colors.light.surface,
    borderRadius: 24,
    padding: 24,
    margin: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: Colors.light.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 16,
  },
  closeButtonText: {
    color: Colors.light.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default LocalChurchIdRequestModal;
