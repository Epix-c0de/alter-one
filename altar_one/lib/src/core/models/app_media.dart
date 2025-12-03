class AppMedia {
  final String id;
  final String type;
  final String placement;
  final String url;
  final String? thumbnailUrl;
  final String? parishId;
  final bool isActive;
  final int orderIndex;
  final DateTime createdAt;

  AppMedia({
    required this.id,
    required this.type,
    required this.placement,
    required this.url,
    this.thumbnailUrl,
    this.parishId,
    required this.isActive,
    required this.orderIndex,
    required this.createdAt,
  });

  factory AppMedia.fromJson(Map<String, dynamic> json) {
    return AppMedia(
      id: json['id'] as String,
      type: json['type'] as String,
      placement: json['placement'] as String,
      url: json['url'] as String,
      thumbnailUrl: json['thumbnail_url'] as String?,
      parishId: json['parish_id'] as String?,
      isActive: json['is_active'] as bool? ?? true,
      orderIndex: json['order_index'] as int? ?? 0,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'placement': placement,
      'url': url,
      'thumbnail_url': thumbnailUrl,
      'parish_id': parishId,
      'is_active': isActive,
      'order_index': orderIndex,
      'created_at': createdAt.toIso8601String(),
    };
  }
}

