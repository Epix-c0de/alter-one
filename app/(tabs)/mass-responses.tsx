import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';

const massResponses = {
  en: [
    { title: 'Profession of Faith', content: 'I believe in one God, the Father almighty, maker of heaven and earth, of all things visible and invisible...' },
    { title: 'Penitential Act', content: 'I confess to almighty God and to you, my brothers and sisters, that I have greatly sinned...' },
    { title: 'Gloria', content: 'Glory to God in the highest, and on earth peace to people of good will...' },
  ],
  sw: [
    { title: 'Nasadiki', content: 'Nasadiki kwa Mungu mmoja, Baba Mwenyezi, Muumba wa mbingu na dunia, na vitu vyote vinavyoonekana na visivyoonekana...' },
    { title: 'Tendo la Toba', content: 'Naungama kwa Mungu Mwenyezi, na kwenu ninyi, ndugu zangu, kwamba nimekosa mno...' },
    { title: 'Atukuzwe Baba', content: 'Atukuzwe Mungu juu mbinguni, na duniani iwe amani kwa watu wenye mapenzi mema...' },
  ],
};

export default function MassResponsesScreen() {
  const [isSwahili, setIsSwahili] = useState(false);
  const responses = isSwahili ? massResponses.sw : massResponses.en;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mass Responses</Text>
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>EN</Text>
          <Switch
            value={isSwahili}
            onValueChange={setIsSwahili}
            trackColor={{ false: Colors.light.primaryLight, true: Colors.light.primaryLight }}
            thumbColor={isSwahili ? Colors.light.primary : '#f4f3f4'}
          />
          <Text style={styles.toggleLabel}>SW</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {responses.map((item, index) => (
          <BlurView key={index} intensity={80} tint="light" style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardContent}>{item.content}</Text>
          </BlurView>
        ))}
      </ScrollView>
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
    backgroundColor: Colors.light.surfaceSecondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    lineHeight: 24,
  },
});
