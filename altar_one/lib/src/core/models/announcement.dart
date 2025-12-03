class Announcement {
  final String id;
  final String parishId;
  final String? localChurchId;
  final String title;
  final String body;
  final String? category;
  final bool pinned;
  final DateTime? scheduledAt;
  final DateTime createdAt;

  Announcement({
    required this.id,
    required this.parishId,
    this.localChurchId,
    required this.title,
    required this.body,
    this.category,
    required this.pinned,
    this.scheduledAt,
    required this.createdAt,
  });

  factory Announcement.fromJson(Map<String, dynamic> json) {
    return Announcement(
      id: json['id'] as String,
      parishId: json['parish_id'] as String,
      localChurchId: json['local_church_id'] as String?,
      title: json['title'] as String,
      body: json['body'] as String,
      category: json['category'] as String?,
      pinned: json['pinned'] as bool? ?? false,
      scheduledAt: json['scheduled_at'] != null ? DateTime.parse(json['scheduled_at'] as String) : null,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'parish_id': parishId,
      'local_church_id': localChurchId,
      'title': title,
      'body': body,
      'category': category,
      'pinned': pinned,
      'scheduled_at': scheduledAt?.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
    };
  }
}

