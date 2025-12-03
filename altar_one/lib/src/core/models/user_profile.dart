class UserProfile {
  final String userId;
  final String fullName;
  final String email;
  final String? phone;
  final String? parishId;
  final String? localChurchId;
  final bool trialExpired;
  final DateTime createdAt;
  final DateTime updatedAt;

  UserProfile({
    required this.userId,
    required this.fullName,
    required this.email,
    this.phone,
    this.parishId,
    this.localChurchId,
    required this.trialExpired,
    required this.createdAt,
    required this.updatedAt,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      userId: json['user_id'] as String,
      fullName: json['full_name'] as String,
      email: json['email'] as String,
      phone: json['phone'] as String?,
      parishId: json['parish_id'] as String?,
      localChurchId: json['local_church_id'] as String?,
      trialExpired: json['trial_expired'] as bool? ?? false,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'full_name': fullName,
      'email': email,
      'phone': phone,
      'parish_id': parishId,
      'local_church_id': localChurchId,
      'trial_expired': trialExpired,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}

