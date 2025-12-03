import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/announcement.dart';
import 'cache_service.dart';

class SupabaseAnnouncementsService {
  final SupabaseClient _client;

  SupabaseAnnouncementsService(this._client);

  Future<List<Announcement>> getAnnouncements(
    String parishId, {
    String? localChurchId,
    int limit = 20,
    int offset = 0,
    bool? pinnedOnly,
  }) async {
    try {
      var query = _client
          .from('announcements')
          .select()
          .eq('parish_id', parishId);

      if (localChurchId != null) {
        query = query.eq('local_church_id', localChurchId);
      }

      if (pinnedOnly == true) {
        query = query.eq('pinned', true);
      }

      final response = await query
          .order('pinned', ascending: false)
          .order('created_at', ascending: false)
          .range(offset, offset + limit - 1);

      return (response as List)
          .map((json) => Announcement.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      return [];
    }
  }

  Future<List<Announcement>> getPinnedAnnouncements(String parishId) async {
    final cacheKey = 'pinned_announcements_$parishId';
    final cached = await CacheService.get<List<dynamic>>(cacheKey);
    if (cached != null) {
      return cached.map((json) => Announcement.fromJson(json as Map<String, dynamic>)).toList();
    }

    try {
      final response = await _client
          .from('announcements')
          .select()
          .eq('parish_id', parishId)
          .eq('pinned', true)
          .order('created_at', ascending: false);

      final announcements = (response as List)
          .map((json) => Announcement.fromJson(json as Map<String, dynamic>))
          .toList();
      
      // Cache for 1 hour
      await CacheService.set(cacheKey, response, ttlHours: 1);
      
      return announcements;
    } catch (e) {
      return [];
    }
  }
}

