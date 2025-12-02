import { Image } from 'expo-image';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Send, Image as ImageIcon, ChevronLeft } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { mockGroups, mockMessages } from '@/mocks/data';
import type { Group, Message } from '@/types';

function GroupListItem({ group, onPress }: { group: Group; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.groupItem} onPress={onPress} activeOpacity={0.7}>
      <Image
        source={{ uri: group.imageUrl || 'https://via.placeholder.com/100' }}
        style={styles.groupImage}
      />
      <View style={styles.groupInfo}>
        <View style={styles.groupHeader}>
          <Text style={styles.groupName} numberOfLines={1}>
            {group.name}
          </Text>
          {group.lastMessage && (
            <Text style={styles.groupTime}>
              {new Date(group.lastMessage.timestamp).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
          )}
        </View>
        {group.lastMessage && (
          <Text style={styles.groupLastMessage} numberOfLines={1}>
            <Text style={styles.senderName}>{group.lastMessage.senderName}: </Text>
            {group.lastMessage.text}
          </Text>
        )}
        <View style={styles.groupFooter}>
          <Text style={styles.memberCount}>{group.memberCount} members</Text>
          {group.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{group.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function MessageBubble({ message }: { message: Message }) {
  return (
    <View style={[styles.messageBubbleContainer, message.isOwn && styles.messageBubbleOwnContainer]}>
      {!message.isOwn && (
        <Image
          source={{ uri: message.senderPhotoUrl || 'https://i.pravatar.cc/150?img=1' }}
          style={styles.messageAvatar}
        />
      )}
      <View style={styles.messageBubbleContent}>
        {!message.isOwn && <Text style={styles.messageSender}>{message.senderName}</Text>}
        <View style={[styles.messageBubble, message.isOwn && styles.messageBubbleOwn]}>
          {message.imageUrl && (
            <Image source={{ uri: message.imageUrl }} style={styles.messageImage} />
          )}
          <Text style={[styles.messageText, message.isOwn && styles.messageTextOwn]}>
            {message.text}
          </Text>
        </View>
        <Text style={[styles.messageTime, message.isOwn && styles.messageTimeOwn]}>
          {new Date(message.timestamp).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );
}

export default function GroupsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [messageText, setMessageText] = useState('');

  const filteredGroups = mockGroups.filter(
    (group) =>
      searchQuery === '' ||
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedGroup) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={() => setSelectedGroup(null)} style={styles.backButton}>
            <ChevronLeft color={Colors.light.text} size={28} />
          </TouchableOpacity>
          <Image
            source={{ uri: selectedGroup.imageUrl || 'https://via.placeholder.com/100' }}
            style={styles.chatHeaderImage}
          />
          <View style={styles.chatHeaderInfo}>
            <Text style={styles.chatHeaderName} numberOfLines={1}>
              {selectedGroup.name}
            </Text>
            <Text style={styles.chatHeaderMembers}>{selectedGroup.memberCount} members</Text>
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={90}
        >
          <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
            {mockMessages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.attachButton}>
              <ImageIcon color={Colors.light.textSecondary} size={24} />
            </TouchableOpacity>
            <TextInput
              style={styles.messageInput}
              placeholder="Type a message..."
              placeholderTextColor={Colors.light.textSecondary}
              value={messageText}
              onChangeText={setMessageText}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, messageText.trim() && styles.sendButtonActive]}
              disabled={!messageText.trim()}
            >
              <Send
                color={messageText.trim() ? Colors.light.surfaceSecondary : Colors.light.textSecondary}
                size={20}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Groups</Text>
      </View>

      <View style={styles.searchContainer}>
        <Search color={Colors.light.textSecondary} size={20} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search groups..."
          placeholderTextColor={Colors.light.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.scrollView}>
        {filteredGroups.map((group) => (
          <GroupListItem key={group.id} group={group} onPress={() => setSelectedGroup(group)} />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surfaceSecondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    position: 'absolute',
    left: 24,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    paddingHorizontal: 40,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.light.text,
  },
  scrollView: {
    flex: 1,
  },
  groupItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
    backgroundColor: Colors.light.surfaceSecondary,
  },
  groupImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.surface,
  },
  groupInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    flex: 1,
  },
  groupTime: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginLeft: 8,
  },
  groupLastMessage: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  senderName: {
    fontWeight: '600',
    color: Colors.light.text,
  },
  groupFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberCount: {
    fontSize: 12,
    color: Colors.light.textTertiary,
  },
  unreadBadge: {
    backgroundColor: Colors.light.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.surfaceSecondary,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: Colors.light.surfaceSecondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  chatHeaderImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
  },
  chatHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  chatHeaderMembers: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageBubbleContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  messageBubbleOwnContainer: {
    flexDirection: 'row-reverse',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.surface,
    marginRight: 8,
  },
  messageBubbleContent: {
    maxWidth: '75%',
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginBottom: 4,
    marginLeft: 12,
  },
  messageBubble: {
    backgroundColor: Colors.light.card,
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  messageBubbleOwn: {
    backgroundColor: Colors.light.primary,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    color: Colors.light.text,
  },
  messageTextOwn: {
    color: Colors.light.surfaceSecondary,
  },
  messageTime: {
    fontSize: 11,
    color: Colors.light.textTertiary,
    marginTop: 4,
    marginLeft: 12,
  },
  messageTimeOwn: {
    textAlign: 'right',
    marginLeft: 0,
    marginRight: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: Colors.light.surfaceSecondary,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    gap: 8,
  },
  attachButton: {
    padding: 8,
  },
  messageInput: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.light.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: Colors.light.primary,
  },
});
