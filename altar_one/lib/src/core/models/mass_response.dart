class MassResponse {
  final String id;
  final String language;
  final String category;
  final String title;
  final String content;
  final bool isGlobal;
  final String? parishId;
  final DateTime createdAt;

  MassResponse({
    required this.id,
    required this.language,
    required this.category,
    required this.title,
    required this.content,
    required this.isGlobal,
    this.parishId,
    required this.createdAt,
  });

  factory MassResponse.fromJson(Map<String, dynamic> json) {
    return MassResponse(
      id: json['id'] as String,
      language: json['language'] as String,
      category: json['category'] as String,
      title: json['title'] as String,
      content: json['content'] as String,
      isGlobal: json['is_global'] as bool? ?? true,
      parishId: json['parish_id'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'language': language,
      'category': category,
      'title': title,
      'content': content,
      'is_global': isGlobal,
      'parish_id': parishId,
      'created_at': createdAt.toIso8601String(),
    };
  }
}

