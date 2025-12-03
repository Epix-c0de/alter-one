import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/hymn.dart';
import 'cache_service.dart';

class SupabaseHymnsService {
  final SupabaseClient _client;

  SupabaseHymnsService(this._client);

  Future<List<ParishHymn>> getHymnsByCategory(String parishId, String? category) async {
    final cacheKey = 'hymns_${parishId}_${category ?? 'all'}';
    final cached = await CacheService.get<List<dynamic>>(cacheKey);
    if (cached != null) {
      return cached.map((json) => ParishHymn.fromJson(json as Map<String, dynamic>)).toList();
    }

    try {
      var query = _client
          .from('parish_hymns')
          .select()
          .eq('parish_id', parishId);

      if (category != null && category.isNotEmpty) {
        query = query.eq('category', category);
      }

      final response = await query.order('title');

      final hymns = (response as List)
          .map((json) => ParishHymn.fromJson(json as Map<String, dynamic>))
          .toList();
      
      // Cache for 24 hours
      await CacheService.set(cacheKey, response, ttlHours: 24);
      
      return hymns;
    } catch (e) {
      return [];
    }
  }

  Future<List<ParishHymn>> searchHymns(String parishId, String query) async {
    try {
      final response = await _client
          .from('parish_hymns')
          .select()
          .eq('parish_id', parishId)
          .or('title.ilike.%$query%,lyrics.ilike.%$query%')
          .order('title');

      return (response as List)
          .map((json) => ParishHymn.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      return [];
    }
  }

  Future<List<String>> getCategories(String parishId) async {
    try {
      final response = await _client
          .from('parish_hymns')
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
}

