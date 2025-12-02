
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { mockReading } from '@/mocks/data';

function ReadingSection({ title, citation, text }: { title: string; citation: string; text: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.citation}>{citation}</Text>
      <Text style={styles.readingText}>{text}</Text>
    </View>
  );
}

export default function ReadingsScreen() {
  const reading = mockReading;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Today&apos;s Readings</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.dateCard}>
          <Calendar color={Colors.light.primary} size={24} />
          <Text style={styles.dateText}>{reading.date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
          })}</Text>
        </View>

        {reading.readings.first && (
          <ReadingSection
            title="First Reading"
            citation={reading.readings.first.citation}
            text={reading.readings.first.text}
          />
        )}

        {reading.readings.psalm && (
          <ReadingSection
            title="Responsorial Psalm"
            citation={reading.readings.psalm.citation}
            text={reading.readings.psalm.text}
          />
        )}

        {reading.readings.second && (
          <ReadingSection
            title="Second Reading"
            citation={reading.readings.second.citation}
            text={reading.readings.second.text}
          />
        )}

        <ReadingSection
          title="Gospel"
          citation={reading.readings.gospel.citation}
          text={reading.readings.gospel.text}
        />

        {reading.reflection && (
          <View style={styles.reflectionCard}>
            <Text style={styles.reflectionTitle}>Reflection</Text>
            <Text style={styles.reflectionText}>{reading.reflection}</Text>
          </View>
        )}
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.light.surfaceSecondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  section: {
    backgroundColor: Colors.light.card,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  citation: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.accent,
    marginBottom: 12,
  },
  readingText: {
    fontSize: 16,
    lineHeight: 26,
    color: Colors.light.text,
  },
  reflectionCard: {
    backgroundColor: Colors.light.primaryLight,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
  },
  reflectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.surfaceSecondary,
    marginBottom: 12,
  },
  reflectionText: {
    fontSize: 16,
    lineHeight: 26,
    color: Colors.light.surfaceSecondary,
  },
});
