import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/app_media.dart';
import 'cache_service.dart';

class SupabaseMediaService {
  final SupabaseClient _client;

  SupabaseMediaService(this._client);

  Future<List<AppMedia>> getMediaByPlacement(String placement, {String? parishId}) async {
    final cacheKey = 'app_media_${placement}_${parishId ?? 'global'}';
    final cached = await CacheService.get<List<dynamic>>(cacheKey);
    if (cached != null) {
      return cached.map((json) => AppMedia.fromJson(json as Map<String, dynamic>)).toList();
    }

    try {
      var query = _client
          .from('app_media')
          .select()
          .eq('placement', placement)
          .eq('is_active', true);

      if (parishId != null) {
        query = query.or('parish_id.is.null,parish_id.eq.$parishId');
      } else {
        query = query.isFilter('parish_id', null);
      }

      final response = await query.order('order_index');

      final media = (response as List)
          .map((json) => AppMedia.fromJson(json as Map<String, dynamic>))
          .toList();
      
      // Cache for 1 hour
      await CacheService.set(cacheKey, response, ttlHours: 1);
      
      return media;
    } catch (e) {
      return [];
    }
  }

  Future<AppMedia?> getSplashMedia({String? parishId}) async {
    final media = await getMediaByPlacement('splash', parishId: parishId);
    return media.isNotEmpty ? media.first : null;
  }
}

