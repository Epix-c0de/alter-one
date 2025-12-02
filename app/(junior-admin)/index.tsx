import { Link } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { ChevronRight, Upload, Music, BookOpen } from 'lucide-react-native';

const JuniorAdminDashboard = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Junior Admin Dashboard</Text>
        </View>

        <View style={styles.menuContainer}>
          <Link href="/(junior-admin)/upload-readings" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemContent}>
                <BookOpen color={Colors.light.primary} size={22} />
                <Text style={styles.menuItemText}>Upload Sunday Readings</Text>
              </View>
              <ChevronRight color={Colors.light.textTertiary} size={20} />
            </TouchableOpacity>
          </Link>

          <Link href="/(junior-admin)/upload-hymns" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemContent}>
                <Music color={Colors.light.primary} size={22} />
                <Text style={styles.menuItemText}>Upload Hymns</Text>
              </View>
              <ChevronRight color={Colors.light.textTertiary} size={20} />
            </TouchableOpacity>
          </Link>
          
          <Link href="/(junior-admin)/upload-songs" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemContent}>
                <Upload color={Colors.light.primary} size={22} />
                <Text style={styles.menuItemText}>Upload Songs from YouTube</Text>
              </View>
              <ChevronRight color={Colors.light.textTertiary} size={20} />
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
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
  menuContainer: {
    padding: 16,
  },
  menuItem: {
    backgroundColor: Colors.light.surfaceSecondary,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.light.text,
  },
});

export default JuniorAdminDashboard;
