import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/chat_message.dart';

class SupabaseChatService {
  final SupabaseClient _client;

  SupabaseChatService(this._client);

  Future<List<ChatMessage>> getMessages({
    required String groupType,
    required String groupId,
    int limit = 50,
    int offset = 0,
  }) async {
    try {
      final response = await _client
          .from('chat_messages')
          .select()
          .eq('group_type', groupType)
          .eq('group_id', groupId)
          .order('created_at', ascending: false)
          .range(offset, offset + limit - 1);

      final messages = (response as List)
          .map((json) => ChatMessage.fromJson(json as Map<String, dynamic>))
          .toList();
      
      return messages.reversed.toList(); // Reverse to show oldest first
    } catch (e) {
      return [];
    }
  }

  Future<ChatMessage?> sendMessage({
    required String groupType,
    required String groupId,
    required String userId,
    String? message,
    String? mediaUrl,
    String? mediaType,
    String? replyToId,
  }) async {
    try {
      final response = await _client
          .from('chat_messages')
          .insert({
            'group_type': groupType,
            'group_id': groupId,
            'user_id': userId,
            'message': message,
            'media_url': mediaUrl,
            'media_type': mediaType,
            'reply_to_id': replyToId,
          })
          .select()
          .single();

      return ChatMessage.fromJson(response as Map<String, dynamic>);
    } catch (e) {
      return null;
    }
  }

  Future<bool> addReaction(String messageId, String emoji, String userId) async {
    try {
      // Get current reactions
      final messageResponse = await _client
          .from('chat_messages')
          .select('reactions')
          .eq('id', messageId)
          .single();

      final reactions = Map<String, dynamic>.from(
        messageResponse['reactions'] as Map<String, dynamic>? ?? {},
      );

      // Add or update reaction
      final userList = List<String>.from(reactions[emoji] as List<dynamic>? ?? []);
      if (!userList.contains(userId)) {
        userList.add(userId);
      }
      reactions[emoji] = userList;

      await _client
          .from('chat_messages')
          .update({'reactions': reactions})
          .eq('id', messageId);

      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> markAsRead(String messageId, String userId) async {
    try {
      final messageResponse = await _client
          .from('chat_messages')
          .select('read_by')
          .eq('id', messageId)
          .single();

      final readBy = List<String>.from(
        messageResponse['read_by'] as List<dynamic>? ?? [],
      );

      if (!readBy.contains(userId)) {
        readBy.add(userId);
        await _client
            .from('chat_messages')
            .update({'read_by': readBy})
            .eq('id', messageId);
      }

      return true;
    } catch (e) {
      return false;
    }
  }

  ChatRealtimeChannel subscribeToMessages({
    required String groupType,
    required String groupId,
    required Function(ChatMessage) onNewMessage,
  }) {
    final channel = _client.channel('chat_${groupType}_$groupId');
    
    channel.onPostgresChanges(
      event: PostgresChangeEvent.insert,
      schema: 'public',
      table: 'chat_messages',
      filter: PostgresChangeFilter(
        type: PostgresChangeFilterType.eq,
        column: 'group_type',
        value: groupType,
      ),
      callback: (payload) {
        final data = payload.newRecord;
        if (data != null && data['group_id'] == groupId) {
          final message = ChatMessage.fromJson(data as Map<String, dynamic>);
          onNewMessage(message);
        }
      },
    );

    channel.subscribe();
    return ChatRealtimeChannel(channel);
  }
}

class ChatRealtimeChannel {
  final RealtimeChannel _channel;

  ChatRealtimeChannel(this._channel);

  void unsubscribe() {
    _channel.unsubscribe();
  }
}

