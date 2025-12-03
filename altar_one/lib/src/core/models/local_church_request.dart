class LocalChurchIdRequest {
  final String id;
  final String userId;
  final String parishId;
  final String? localChurchId;
  final String status;
  final DateTime createdAt;
  final DateTime? reviewedAt;
  final String? reviewedBy;

  LocalChurchIdRequest({
    required this.id,
    required this.userId,
    required this.parishId,
    this.localChurchId,
    required this.status,
    required this.createdAt,
    this.reviewedAt,
    this.reviewedBy,
  });

  factory LocalChurchIdRequest.fromJson(Map<String, dynamic> json) {
    return LocalChurchIdRequest(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      parishId: json['parish_id'] as String,
      localChurchId: json['local_church_id'] as String?,
      status: json['status'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      reviewedAt: json['reviewed_at'] != null ? DateTime.parse(json['reviewed_at'] as String) : null,
      reviewedBy: json['reviewed_by'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'parish_id': parishId,
      'local_church_id': localChurchId,
      'status': status,
      'created_at': createdAt.toIso8601String(),
      'reviewed_at': reviewedAt?.toIso8601String(),
      'reviewed_by': reviewedBy,
    };
  }
}

