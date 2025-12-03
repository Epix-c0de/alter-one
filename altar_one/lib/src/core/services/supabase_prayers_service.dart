import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/prayer.dart';
import 'cache_service.dart';

class SupabasePrayersService {
  final SupabaseClient _client;

  SupabasePrayersService(this._client);

  Future<List<Prayer>> getPrayers(String parishId, {String? category}) async {
    final cacheKey = 'prayers_${parishId}_${category ?? 'all'}';
    final cached = await CacheService.get<List<dynamic>>(cacheKey);
    if (cached != null) {
      return cached.map((json) => Prayer.fromJson(json as Map<String, dynamic>)).toList();
    }

    try {
      var query = _client
          .from('prayers')
          .select()
          .eq('parish_id', parishId);

      if (category != null && category.isNotEmpty) {
        query = query.eq('category', category);
      }

      final response = await query.order('category').order('title');

      final prayers = (response as List)
          .map((json) => Prayer.fromJson(json as Map<String, dynamic>))
          .toList();
      
      // Cache for 24 hours
      await CacheService.set(cacheKey, response, ttlHours: 24);
      
      return prayers;
    } catch (e) {
      return [];
    }
  }

  Future<List<String>> getCategories(String parishId) async {
    try {
      final response = await _client
          .from('prayers')
          .select('category')
          .eq('parish_id', parishId);

      final categories = (response as List)
          .map((item) => item['category'] as String)
          .toSet()
          .toList();
      
      return categories..sort();
    } catch (e) {
      return [];
    }
  }

  Future<List<Prayer>> searchPrayers(String parishId, String query) async {
    try {
      final response = await _client
          .from('prayers')
          .select()
          .eq('parish_id', parishId)
          .or('title.ilike.%$query%,content.ilike.%$query%')
          .order('category')
          .order('title');

      return (response as List)
          .map((json) => Prayer.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      return [];
    }
  }
}

