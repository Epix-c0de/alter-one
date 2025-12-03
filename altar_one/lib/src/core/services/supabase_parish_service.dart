import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/parish.dart';
import 'cache_service.dart';

class SupabaseParishService {
  final SupabaseClient _client;

  SupabaseParishService(this._client);

  Future<Parish?> getParish(String parishId) async {
    final cacheKey = 'parish_$parishId';
    final cached = await CacheService.get<Map<String, dynamic>>(cacheKey);
    if (cached != null) {
      return Parish.fromJson(cached);
    }

    try {
      final response = await _client
          .from('parishes')
          .select()
          .eq('id', parishId)
          .maybeSingle();

      if (response == null) return null;

      final parish = Parish.fromJson(response as Map<String, dynamic>);
      
      // Cache for 24 hours
      await CacheService.set(cacheKey, response, ttlHours: 24);
      
      return parish;
    } catch (e) {
      return null;
    }
  }

  Future<List<Parish>> getAllParishes() async {
    try {
      final response = await _client
          .from('parishes')
          .select()
          .order('name');

      return (response as List)
          .map((json) => Parish.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      return [];
    }
  }

  Future<String?> matchParishByLocation(double lat, double lng) async {
    try {
      final response = await _client.rpc(
        'match_parish_polygon',
        params: {'lat': lat, 'lng': lng},
      );
      
      return response as String?;
    } catch (e) {
      return null;
    }
  }

  Future<List<LocalChurch>> getLocalChurches(String parishId) async {
    final cacheKey = 'local_churches_$parishId';
    final cached = await CacheService.get<List<dynamic>>(cacheKey);
    if (cached != null) {
      return cached.map((json) => LocalChurch.fromJson(json as Map<String, dynamic>)).toList();
    }

    try {
      final response = await _client
          .from('local_churches')
          .select()
          .eq('parish_id', parishId)
          .order('name');

      final churches = (response as List)
          .map((json) => LocalChurch.fromJson(json as Map<String, dynamic>))
          .toList();
      
      // Cache for 24 hours
      await CacheService.set(cacheKey, response, ttlHours: 24);
      
      return churches;
    } catch (e) {
      return [];
    }
  }

  Future<LocalChurch?> getLocalChurch(String localChurchId) async {
    try {
      final response = await _client
          .from('local_churches')
          .select()
          .eq('id', localChurchId)
          .maybeSingle();

      if (response == null) return null;
      return LocalChurch.fromJson(response as Map<String, dynamic>);
    } catch (e) {
      return null;
    }
  }
}

