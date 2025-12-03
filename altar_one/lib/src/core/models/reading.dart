class ParishReading {
  final String id;
  final String parishId;
  final DateTime date;
  final String title;
  final String? firstReading;
  final String? secondReading;
  final String? psalm;
  final String? gospel;
  final DateTime createdAt;

  ParishReading({
    required this.id,
    required this.parishId,
    required this.date,
    required this.title,
    this.firstReading,
    this.secondReading,
    this.psalm,
    this.gospel,
    required this.createdAt,
  });

  factory ParishReading.fromJson(Map<String, dynamic> json) {
    return ParishReading(
      id: json['id'] as String,
      parishId: json['parish_id'] as String,
      date: DateTime.parse(json['date'] as String),
      title: json['title'] as String,
      firstReading: json['first_reading'] as String?,
      secondReading: json['second_reading'] as String?,
      psalm: json['psalm'] as String?,
      gospel: json['gospel'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'parish_id': parishId,
      'date': date.toIso8601String().split('T')[0],
      'title': title,
      'first_reading': firstReading,
      'second_reading': secondReading,
      'psalm': psalm,
      'gospel': gospel,
      'created_at': createdAt.toIso8601String(),
    };
  }
}

