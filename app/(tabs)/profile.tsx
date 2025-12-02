

import { Image } from 'expo-image';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Crown,
} from 'lucide-react-native';

import Colors from '@/constants/colors';
import { mockUser } from '@/mocks/data';

function MenuItem({
  icon: Icon,
  title,
  subtitle,
  onPress,
}: {
  icon: React.ComponentType<{ color: string; size: number }>;
  title: string;
  subtitle?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <Icon color={Colors.light.primary} size={24} />
      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
      </View>
      <ChevronRight color={Colors.light.textTertiary} size={20} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const user = mockUser;
  const isAdmin = user.role === 'admin';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <Image
            source={{ uri: user.photoUrl || 'https://i.pravatar.cc/150?img=1' }}
            style={styles.profileImage}
          />
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          {isAdmin && (
            <View style={styles.roleBadge}>
              <Crown color={Colors.light.primaryDark} size={16} />
              <Text style={styles.roleText}>Admin</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuGroup}>
            <MenuItem
              icon={Settings}
              title="Settings"
              subtitle="Manage your account settings"
              onPress={() => console.log('Settings')}
            />
            <MenuItem
              icon={Bell}
              title="Notifications"
              subtitle="Configure notification preferences"
              onPress={() => console.log('Notifications')}
            />
          </View>
        </View>

        {isAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Administration</Text>
            <View style={styles.menuGroup}>
              <MenuItem
                icon={Shield}
                title="Admin Dashboard"
                subtitle="Manage content and users"
                onPress={() => console.log('Admin Dashboard')}
              />
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.menuGroup}>
            <MenuItem
              icon={HelpCircle}
              title="Help & Support"
              subtitle="Get help and contact support"
              onPress={() => console.log('Help')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} activeOpacity={0.7}>
            <LogOut color={Colors.light.error} size={20} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>EpixChurch v1.0.0</Text>
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
    paddingVertical: 24,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.surface,
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.light.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.primaryDark,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  menuGroup: {
    backgroundColor: Colors.light.surfaceSecondary,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.light.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
    gap: 12,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: Colors.light.surfaceSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.error,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.error,
  },
  version: {
    fontSize: 13,
    color: Colors.light.textTertiary,
    textAlign: 'center',
    marginTop: 24,
  },
});
