class ChatMessage {
  final String id;
  final String groupType;
  final String groupId;
  final String userId;
  final String? message;
  final String? mediaUrl;
  final String? mediaType;
  final String? replyToId;
  final Map<String, dynamic> reactions;
  final List<String> deliveredTo;
  final List<String> readBy;
  final DateTime createdAt;

  ChatMessage({
    required this.id,
    required this.groupType,
    required this.groupId,
    required this.userId,
    this.message,
    this.mediaUrl,
    this.mediaType,
    this.replyToId,
    required this.reactions,
    required this.deliveredTo,
    required this.readBy,
    required this.createdAt,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'] as String,
      groupType: json['group_type'] as String,
      groupId: json['group_id'] as String,
      userId: json['user_id'] as String,
      message: json['message'] as String?,
      mediaUrl: json['media_url'] as String?,
      mediaType: json['media_type'] as String?,
      replyToId: json['reply_to_id'] as String?,
      reactions: json['reactions'] as Map<String, dynamic>? ?? {},
      deliveredTo: (json['delivered_to'] as List<dynamic>?)?.map((e) => e as String).toList() ?? [],
      readBy: (json['read_by'] as List<dynamic>?)?.map((e) => e as String).toList() ?? [],
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'group_type': groupType,
      'group_id': groupId,
      'user_id': userId,
      'message': message,
      'media_url': mediaUrl,
      'media_type': mediaType,
      'reply_to_id': replyToId,
      'reactions': reactions,
      'delivered_to': deliveredTo,
      'read_by': readBy,
      'created_at': createdAt.toIso8601String(),
    };
  }
}

