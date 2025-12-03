class Prayer {
  final String id;
  final String parishId;
  final String category;
  final String title;
  final String content;
  final DateTime createdAt;

  Prayer({
    required this.id,
    required this.parishId,
    required this.category,
    required this.title,
    required this.content,
    required this.createdAt,
  });

  factory Prayer.fromJson(Map<String, dynamic> json) {
    return Prayer(
      id: json['id'] as String,
      parishId: json['parish_id'] as String,
      category: json['category'] as String,
      title: json['title'] as String,
      content: json['content'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'parish_id': parishId,
      'category': category,
      'title': title,
      'content': content,
      'created_at': createdAt.toIso8601String(),
    };
  }
}

