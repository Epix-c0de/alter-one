import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabaseFunctions } from '@/lib/supabase-functions';
import Colors from '@/constants/colors';

export default function ManageParishesScreen() {
  const [name, setName] = useState('');
  const [archdioceseId, setArchdioceseId] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedId, setGeneratedId] = useState('');

  const handleGenerateId = async () => {
    if (!name || !archdioceseId) {
      Alert.alert('Error', 'Please enter a parish name and archdiocese ID.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabaseFunctions.functions.invoke('generate-id', {
        body: { type: 'parish', name, parentId: archdioceseId },
      });

      if (error) throw error;

      setGeneratedId(data.id);
      Alert.alert('Success', `Generated ID: ${data.id}`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate ID');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Parishes</Text>
      </View>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Parish Name"
          value={name}
          onChangeText={setName}
          placeholderTextColor={Colors.light.textTertiary}
        />
        <TextInput
          style={styles.input}
          placeholder="Archdiocese ID"
          value={archdioceseId}
          onChangeText={setArchdioceseId}
          placeholderTextColor={Colors.light.textTertiary}
        />
        <TextInput
          style={styles.input}
          placeholder="Latitude"
          value={latitude}
          onChangeText={setLatitude}
          keyboardType="numeric"
          placeholderTextColor={Colors.light.textTertiary}
        />
        <TextInput
          style={styles.input}
          placeholder="Longitude"
          value={longitude}
          onChangeText={setLongitude}
          keyboardType="numeric"
          placeholderTextColor={Colors.light.textTertiary}
        />
        <TextInput
          style={styles.input}
          placeholder="Radius (meters)"
          value={radius}
          onChangeText={setRadius}
          keyboardType="numeric"
          placeholderTextColor={Colors.light.textTertiary}
        />
        <TouchableOpacity style={styles.button} onPress={handleGenerateId} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Generate ID</Text>
          )}
        </TouchableOpacity>

        {generatedId && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultLabel}>Generated ID:</Text>
            <Text style={styles.resultText}>{generatedId}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.surface },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.light.border },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.light.text },
  form: { padding: 16 },
  input: { 
    backgroundColor: Colors.light.surfaceSecondary, 
    padding: 16, 
    borderRadius: 12, 
    fontSize: 16, 
    color: Colors.light.text, 
    marginBottom: 16 
  },
  button: { 
    backgroundColor: Colors.light.primary, 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resultContainer: { marginTop: 24, alignItems: 'center' },
  resultLabel: { color: Colors.light.textSecondary, fontSize: 16 },
  resultText: { color: Colors.light.text, fontSize: 20, fontWeight: 'bold', marginTop: 4 },
});
