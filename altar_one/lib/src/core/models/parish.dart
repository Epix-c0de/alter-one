class Parish {
  final String id;
  final String name;
  final String? logoUrl;
  final String? locationText;
  final String? archdiocese;
  final Map<String, dynamic>? polygonGeoJson;
  final DateTime createdAt;

  Parish({
    required this.id,
    required this.name,
    this.logoUrl,
    this.locationText,
    this.archdiocese,
    this.polygonGeoJson,
    required this.createdAt,
  });

  factory Parish.fromJson(Map<String, dynamic> json) {
    return Parish(
      id: json['id'] as String,
      name: json['name'] as String,
      logoUrl: json['logo_url'] as String?,
      locationText: json['location_text'] as String?,
      archdiocese: json['archdiocese'] as String?,
      polygonGeoJson: json['polygon_geo_json'] as Map<String, dynamic>?,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'logo_url': logoUrl,
      'location_text': locationText,
      'archdiocese': archdiocese,
      'polygon_geo_json': polygonGeoJson,
      'created_at': createdAt.toIso8601String(),
    };
  }
}

class LocalChurch {
  final String id;
  final String parishId;
  final String name;
  final String? leaderName;
  final DateTime createdAt;

  LocalChurch({
    required this.id,
    required this.parishId,
    required this.name,
    this.leaderName,
    required this.createdAt,
  });

  factory LocalChurch.fromJson(Map<String, dynamic> json) {
    return LocalChurch(
      id: json['id'] as String,
      parishId: json['parish_id'] as String,
      name: json['name'] as String,
      leaderName: json['leader_name'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'parish_id': parishId,
      'name': name,
      'leader_name': leaderName,
      'created_at': createdAt.toIso8601String(),
    };
  }
}

