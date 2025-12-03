class AppUpdate {
  final String id;
  final String version;
  final String? description;
  final bool mandatory;
  final DateTime releaseDate;
  final DateTime createdAt;

  AppUpdate({
    required this.id,
    required this.version,
    this.description,
    required this.mandatory,
    required this.releaseDate,
    required this.createdAt,
  });

  factory AppUpdate.fromJson(Map<String, dynamic> json) {
    return AppUpdate(
      id: json['id'] as String,
      version: json['version'] as String,
      description: json['description'] as String?,
      mandatory: json['mandatory'] as bool? ?? false,
      releaseDate: DateTime.parse(json['release_date'] as String),
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'version': version,
      'description': description,
      'mandatory': mandatory,
      'release_date': releaseDate.toIso8601String().split('T')[0],
      'created_at': createdAt.toIso8601String(),
    };
  }

  bool isNewerThan(String currentVersion) {
    // Simple version comparison (you may want to use package:version for more robust comparison)
    final current = currentVersion.split('.').map(int.parse).toList();
    final update = version.split('.').map(int.parse).toList();
    
    for (int i = 0; i < update.length; i++) {
      if (i >= current.length) return true;
      if (update[i] > current[i]) return true;
      if (update[i] < current[i]) return false;
    }
    return false;
  }
}

