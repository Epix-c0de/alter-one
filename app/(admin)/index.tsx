
import { Link } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { ChevronRight, MapPin } from 'lucide-react-native';

const AdminDashboard = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Master Admin Dashboard</Text>
        </View>

        <View style={styles.menuContainer}>
          <Link href="/(admin)/manage-sessions" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemContent}>
                <MapPin color={Colors.light.primary} size={22} />
                <Text style={styles.menuItemText}>Manage Active Sessions</Text>
              </View>
              <ChevronRight color={Colors.light.textTertiary} size={20} />
            </TouchableOpacity>
          </Link>

          <Link href="/(admin)/manage-archdiocese" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>Manage Archdioceses</Text>
              <ChevronRight color={Colors.light.textTertiary} size={20} />
            </TouchableOpacity>
          </Link>

          <Link href="/(admin)/manage-parishes" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>Manage Parishes</Text>
              <ChevronRight color={Colors.light.textTertiary} size={20} />
            </TouchableOpacity>
          </Link>

          <Link href="/(admin)/create-feed-post" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemContent}>
                <MapPin color={Colors.light.primary} size={22} />
                <Text style={styles.menuItemText}>Create Feed Post</Text>
              </View>
              <ChevronRight color={Colors.light.textTertiary} size={20} />
            </TouchableOpacity>
          </Link>

          <Link href="/(admin)/moderation" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemContent}>
                <MapPin color={Colors.light.primary} size={22} />
                <Text style={styles.menuItemText}>Content Moderation</Text>
              </View>
              <ChevronRight color={Colors.light.textTertiary} size={20} />
            </TouchableOpacity>
          </Link>

          <Link href="/(admin)/manage-local-churches" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuItemText}>Manage Local Churches</Text>
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

export default AdminDashboard;
