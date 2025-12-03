import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/mass_response.dart';
import 'cache_service.dart';

class SupabaseResponsesService {
  final SupabaseClient _client;

  SupabaseResponsesService(this._client);

  Future<List<MassResponse>> getResponsesByLanguage(String language) async {
    final cacheKey = 'mass_responses_$language';
    final cached = await CacheService.get<List<dynamic>>(cacheKey);
    if (cached != null) {
      return cached.map((json) => MassResponse.fromJson(json as Map<String, dynamic>)).toList();
    }

    try {
      final response = await _client
          .from('mass_responses')
          .select()
          .eq('language', language)
          .order('category')
          .order('title');

      final responses = (response as List)
          .map((json) => MassResponse.fromJson(json as Map<String, dynamic>))
          .toList();
      
      // Cache for 7 days (static content)
      await CacheService.set(cacheKey, response, ttlHours: 168);
      
      return responses;
    } catch (e) {
      return [];
    }
  }

  Future<List<MassResponse>> getResponsesByCategory(String language, String category) async {
    try {
      final response = await _client
          .from('mass_responses')
          .select()
          .eq('language', language)
          .eq('category', category)
          .order('title');

      return (response as List)
          .map((json) => MassResponse.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      return [];
    }
  }

  Future<List<MassResponse>> searchResponses(String language, String query) async {
    try {
      final response = await _client
          .from('mass_responses')
          .select()
          .eq('language', language)
          .or('title.ilike.%$query%,content.ilike.%$query%')
          .order('category')
          .order('title');

      return (response as List)
          .map((json) => MassResponse.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      return [];
    }
  }

  Future<List<String>> getCategories(String language) async {
    try {
      final response = await _client
          .from('mass_responses')
          .select('category')
          .eq('language', language);

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

