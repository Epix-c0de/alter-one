class Livestream {
  final String id;
  final String parishId;
  final String? localChurchId;
  final String streamUrl;
  final String streamType;
  final bool isLive;
  final DateTime? startTime;
  final DateTime? endTime;
  final String? title;
  final String? description;
  final DateTime createdAt;

  Livestream({
    required this.id,
    required this.parishId,
    this.localChurchId,
    required this.streamUrl,
    required this.streamType,
    required this.isLive,
    this.startTime,
    this.endTime,
    this.title,
    this.description,
    required this.createdAt,
  });

  factory Livestream.fromJson(Map<String, dynamic> json) {
    return Livestream(
      id: json['id'] as String,
      parishId: json['parish_id'] as String,
      localChurchId: json['local_church_id'] as String?,
      streamUrl: json['stream_url'] as String,
      streamType: json['stream_type'] as String? ?? 'youtube',
      isLive: json['is_live'] as bool? ?? false,
      startTime: json['start_time'] != null ? DateTime.parse(json['start_time'] as String) : null,
      endTime: json['end_time'] != null ? DateTime.parse(json['end_time'] as String) : null,
      title: json['title'] as String?,
      description: json['description'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'parish_id': parishId,
      'local_church_id': localChurchId,
      'stream_url': streamUrl,
      'stream_type': streamType,
      'is_live': isLive,
      'start_time': startTime?.toIso8601String(),
      'end_time': endTime?.toIso8601String(),
      'title': title,
      'description': description,
      'created_at': createdAt.toIso8601String(),
    };
  }
}

