import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/song.dart';
import 'cache_service.dart';

class SupabaseSongsService {
  final SupabaseClient _client;

  SupabaseSongsService(this._client);

  Future<List<Song>> getSongs({
    String? parishId,
    String? archdioceseId,
    bool includeUniversal = true,
  }) async {
    try {
      var query = _client.from('songs').select();

      if (parishId != null) {
        query = query.eq('parish_id', parishId);
      } else if (archdioceseId != null) {
        query = query.eq('archdiocese_id', archdioceseId);
      }

      if (includeUniversal) {
        query = query.or('is_universal.eq.true${parishId != null ? ',parish_id.eq.$parishId' : ''}');
      }

      final response = await query.order('title');

      return (response as List)
          .map((json) => Song.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      return [];
    }
  }

  Future<Song?> getSong(String songId) async {
    final cacheKey = 'song_$songId';
    final cached = await CacheService.get<Map<String, dynamic>>(cacheKey);
    if (cached != null) {
      return Song.fromJson(cached);
    }

    try {
      final response = await _client
          .from('songs')
          .select()
          .eq('id', songId)
          .maybeSingle();

      if (response == null) return null;

      final song = Song.fromJson(response as Map<String, dynamic>);
      
      // Cache for 24 hours
      await CacheService.set(cacheKey, response, ttlHours: 24);
      
      return song;
    } catch (e) {
      return null;
    }
  }

  Future<List<Song>> searchSongs(String query, {String? parishId}) async {
    try {
      var searchQuery = _client
          .from('songs')
          .select()
          .or('title.ilike.%$query%,artist.ilike.%$query%,lyrics.ilike.%$query%');

      if (parishId != null) {
        searchQuery = searchQuery.or('parish_id.eq.$parishId,is_universal.eq.true');
      }

      final response = await searchQuery.order('title');

      return (response as List)
          .map((json) => Song.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      return [];
    }
  }

  Future<bool> addToFavorites(String userId, String songId) async {
    try {
      final favorites = await CacheService.get<List<String>>('favorites_$userId') ?? [];
      if (!favorites.contains(songId)) {
        favorites.add(songId);
        await CacheService.set('favorites_$userId', favorites);
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<List<String>> getFavorites(String userId) async {
    return await CacheService.get<List<String>>('favorites_$userId') ?? [];
  }
}

