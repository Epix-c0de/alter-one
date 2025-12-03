import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/reading.dart';
import 'cache_service.dart';

class SupabaseReadingsService {
  final SupabaseClient _client;

  SupabaseReadingsService(this._client);

  Future<ParishReading?> getReadingByDate(String parishId, DateTime date) async {
    final dateStr = date.toIso8601String().split('T')[0];
    final cacheKey = 'reading_${parishId}_$dateStr';
    
    final cached = await CacheService.get<Map<String, dynamic>>(cacheKey);
    if (cached != null) {
      return ParishReading.fromJson(cached);
    }

    try {
      final response = await _client
          .from('parish_readings')
          .select()
          .eq('parish_id', parishId)
          .eq('date', dateStr)
          .maybeSingle();

      if (response == null) return null;

      final reading = ParishReading.fromJson(response as Map<String, dynamic>);
      
      // Cache for 24 hours
      await CacheService.set(cacheKey, response, ttlHours: 24);
      
      return reading;
    } catch (e) {
      return null;
    }
  }

  Future<List<ParishReading>> getReadingsRange(
    String parishId,
    DateTime startDate,
    DateTime endDate,
  ) async {
    try {
      final startStr = startDate.toIso8601String().split('T')[0];
      final endStr = endDate.toIso8601String().split('T')[0];

      final response = await _client
          .from('parish_readings')
          .select()
          .eq('parish_id', parishId)
          .gte('date', startStr)
          .lte('date', endStr)
          .order('date');

      return (response as List)
          .map((json) => ParishReading.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      return [];
    }
  }

  Future<bool> bookmarkReading(String userId, String readingId) async {
    try {
      // Store bookmarks locally (you can also create a bookmarks table in Supabase)
      final bookmarks = await CacheService.get<List<String>>('bookmarks_$userId') ?? [];
      if (!bookmarks.contains(readingId)) {
        bookmarks.add(readingId);
        await CacheService.set('bookmarks_$userId', bookmarks);
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<List<String>> getBookmarkedReadings(String userId) async {
    return await CacheService.get<List<String>>('bookmarks_$userId') ?? [];
  }
}

