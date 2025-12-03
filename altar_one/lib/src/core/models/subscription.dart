class Subscription {
  final String userId;
  final String parishId;
  final bool active;
  final bool trialExpired;
  final DateTime? trialStart;
  final DateTime? trialEnd;
  final DateTime? expiryDate;
  final String? paymentReference;
  final String? paymentMethod;
  final double? amountPaid;
  final DateTime createdAt;

  Subscription({
    required this.userId,
    required this.parishId,
    required this.active,
    required this.trialExpired,
    this.trialStart,
    this.trialEnd,
    this.expiryDate,
    this.paymentReference,
    this.paymentMethod,
    this.amountPaid,
    required this.createdAt,
  });

  factory Subscription.fromJson(Map<String, dynamic> json) {
    return Subscription(
      userId: json['user_id'] as String,
      parishId: json['parish_id'] as String,
      active: json['active'] as bool? ?? false,
      trialExpired: json['trial_expired'] as bool? ?? false,
      trialStart: json['trial_start'] != null ? DateTime.parse(json['trial_start'] as String) : null,
      trialEnd: json['trial_end'] != null ? DateTime.parse(json['trial_end'] as String) : null,
      expiryDate: json['expiry_date'] != null ? DateTime.parse(json['expiry_date'] as String) : null,
      paymentReference: json['payment_reference'] as String?,
      paymentMethod: json['payment_method'] as String?,
      amountPaid: json['amount_paid'] != null ? (json['amount_paid'] as num).toDouble() : null,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'parish_id': parishId,
      'active': active,
      'trial_expired': trialExpired,
      'trial_start': trialStart?.toIso8601String().split('T')[0],
      'trial_end': trialEnd?.toIso8601String().split('T')[0],
      'expiry_date': expiryDate?.toIso8601String().split('T')[0],
      'payment_reference': paymentReference,
      'payment_method': paymentMethod,
      'amount_paid': amountPaid,
      'created_at': createdAt.toIso8601String(),
    };
  }

  int get trialDaysRemaining {
    if (trialEnd == null || trialExpired) return 0;
    final now = DateTime.now();
    final remaining = trialEnd!.difference(now).inDays;
    return remaining > 0 ? remaining : 0;
  }
}

