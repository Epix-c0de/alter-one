class ParishHymn {
  final String id;
  final String parishId;
  final String category;
  final String title;
  final String? lyrics;
  final String? audioUrl;
  final String? youtubeId;
  final Map<String, dynamic>? chordsJson;
  final DateTime createdAt;

  ParishHymn({
    required this.id,
    required this.parishId,
    required this.category,
    required this.title,
    this.lyrics,
    this.audioUrl,
    this.youtubeId,
    this.chordsJson,
    required this.createdAt,
  });

  factory ParishHymn.fromJson(Map<String, dynamic> json) {
    return ParishHymn(
      id: json['id'] as String,
      parishId: json['parish_id'] as String,
      category: json['category'] as String,
      title: json['title'] as String,
      lyrics: json['lyrics'] as String?,
      audioUrl: json['audio_url'] as String?,
      youtubeId: json['youtube_id'] as String?,
      chordsJson: json['chords_json'] as Map<String, dynamic>?,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'parish_id': parishId,
      'category': category,
      'title': title,
      'lyrics': lyrics,
      'audio_url': audioUrl,
      'youtube_id': youtubeId,
      'chords_json': chordsJson,
      'created_at': createdAt.toIso8601String(),
    };
  }
}

