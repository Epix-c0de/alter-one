import { BlurView } from 'expo-blur';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Play, Pause, RotateCcw } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';

const ROSARY_BACKGROUND = 'https://images.unsplash.com/photo-1593793619948-9b6a0a8e3b1e';

const mysteries = {
  Joyful: ['The Annunciation', 'The Visitation', 'The Nativity', 'The Presentation', 'The Finding in the Temple'],
  Luminous: ['The Baptism in the Jordan', 'The Wedding at Cana', 'The Proclamation of the Kingdom', 'The Transfiguration', 'The Institution of the Eucharist'],
  Sorrowful: ['The Agony in the Garden', 'The Scourging at the Pillar', 'The Crowning with Thorns', 'The Carrying of the Cross', 'The Crucifixion'],
  Glorious: ['The Resurrection', 'The Ascension', 'The Descent of the Holy Spirit', 'The Assumption', 'The Coronation of Mary'],
};

export default function PrayersScreen() {
  const [currentMystery, setCurrentMystery] = useState('Joyful');
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  async function playSound() {
    // Placeholder for audio playback
    setIsPlaying(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function pauseSound() {
    setIsPlaying(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  const onBeadPress = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Add bead glow animation
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Prayers</Text>
        </View>

        <ImageBackground source={{ uri: ROSARY_BACKGROUND }} style={styles.rosaryContainer} imageStyle={styles.rosaryBgImage}>
          <BlurView intensity={20} tint="dark" style={styles.rosaryOverlay}>
            <Text style={styles.rosaryTitle}>Holy Rosary</Text>
            <View style={styles.mysterySelector}>
              {Object.keys(mysteries).map(key => (
                <TouchableOpacity key={key} onPress={() => setCurrentMystery(key)}>
                  <Text style={[styles.mysteryText, currentMystery === key && styles.mysteryTextActive]}>{key}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.beadsContainer}>
              {/* Simplified rosary bead visualization */}
              {Array.from({ length: 10 }).map((_, i) => (
                <TouchableOpacity key={i} style={styles.bead} onPress={() => onBeadPress(i)} />
              ))}
            </View>
            
            <View style={styles.audioPlayer}>
              <Text style={styles.mysteryTitle}>{currentMystery} Mysteries</Text>
              <TouchableOpacity style={styles.playButton} onPress={isPlaying ? pauseSound : playSound}>
                {isPlaying ? <Pause color="#fff" size={24} /> : <Play color="#fff" size={24} />}
              </TouchableOpacity>
            </View>
          </BlurView>
        </ImageBackground>

        {/* Other prayers section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other Prayers</Text>
          <BlurView intensity={80} tint="light" style={styles.card}>
            <Text style={styles.cardTitle}>Divine Mercy Chaplet</Text>
            <Text style={styles.cardContent}>You expired, Jesus, but the source of life gushed forth for souls...</Text>
          </BlurView>
          <BlurView intensity={80} tint="light" style={styles.card}>
            <Text style={styles.cardTitle}>Morning Offering</Text>
            <Text style={styles.cardContent}>O Jesus, through the Immaculate Heart of Mary, I offer you my prayers, works, joys, and sufferings of this day...</Text>
          </BlurView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.surface },
  scrollContent: { paddingBottom: 32 },
  header: { padding: 16 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: Colors.light.text },
  rosaryContainer: { marginHorizontal: 16, borderRadius: 24, overflow: 'hidden' },
  rosaryBgImage: { opacity: 0.8 },
  rosaryOverlay: { padding: 20 },
  rosaryTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  mysterySelector: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  mysteryText: { color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  mysteryTextActive: { color: '#fff', borderBottomWidth: 2, borderBottomColor: '#fff' },
  beadsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginVertical: 12 },
  bead: { width: 12, height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.5)', borderWidth: 1, borderColor: '#fff' },
  audioPlayer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  mysteryTitle: { fontSize: 16, fontWeight: '600', color: '#fff' },
  playButton: { padding: 8, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 50 },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.light.text, marginBottom: 12 },
  card: { padding: 16, borderRadius: 16, marginBottom: 12, overflow: 'hidden' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.light.text, marginBottom: 4 },
  cardContent: { fontSize: 15, color: Colors.light.textSecondary, lineHeight: 22 },
});
