class Song {
  final String id;
  final String? parishId;
  final String? archdioceseId;
  final bool isUniversal;
  final String title;
  final String? artist;
  final String? lyrics;
  final Map<String, dynamic>? lyricsJson;
  final String? audioUrl;
  final String? youtubeId;
  final String? thumbnailUrl;
  final int? durationSeconds;
  final DateTime createdAt;

  Song({
    required this.id,
    this.parishId,
    this.archdioceseId,
    required this.isUniversal,
    required this.title,
    this.artist,
    this.lyrics,
    this.lyricsJson,
    this.audioUrl,
    this.youtubeId,
    this.thumbnailUrl,
    this.durationSeconds,
    required this.createdAt,
  });

  factory Song.fromJson(Map<String, dynamic> json) {
    return Song(
      id: json['id'] as String,
      parishId: json['parish_id'] as String?,
      archdioceseId: json['archdiocese_id'] as String?,
      isUniversal: json['is_universal'] as bool? ?? false,
      title: json['title'] as String,
      artist: json['artist'] as String?,
      lyrics: json['lyrics'] as String?,
      lyricsJson: json['lyrics_json'] as Map<String, dynamic>?,
      audioUrl: json['audio_url'] as String?,
      youtubeId: json['youtube_id'] as String?,
      thumbnailUrl: json['thumbnail_url'] as String?,
      durationSeconds: json['duration_seconds'] as int?,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'parish_id': parishId,
      'archdiocese_id': archdioceseId,
      'is_universal': isUniversal,
      'title': title,
      'artist': artist,
      'lyrics': lyrics,
      'lyrics_json': lyricsJson,
      'audio_url': audioUrl,
      'youtube_id': youtubeId,
      'thumbnail_url': thumbnailUrl,
      'duration_seconds': durationSeconds,
      'created_at': createdAt.toIso8601String(),
    };
  }
}

