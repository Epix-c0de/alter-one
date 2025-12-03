import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/livestream.dart';

class SupabaseLivestreamService {
  final SupabaseClient _client;

  SupabaseLivestreamService(this._client);

  Future<List<Livestream>> getLivestreams(String parishId, {String? localChurchId}) async {
    try {
      var query = _client
          .from('livestreams')
          .select()
          .eq('parish_id', parishId);

      if (localChurchId != null) {
        query = query.eq('local_church_id', localChurchId);
      }

      final response = await query.order('created_at', ascending: false);

      return (response as List)
          .map((json) => Livestream.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      return [];
    }
  }

  Future<Livestream?> getActiveLivestream(String parishId, {String? localChurchId}) async {
    try {
      var query = _client
          .from('livestreams')
          .select()
          .eq('parish_id', parishId)
          .eq('is_live', true);

      if (localChurchId != null) {
        query = query.eq('local_church_id', localChurchId);
      }

      final response = await query.order('created_at', ascending: false).limit(1).maybeSingle();

      if (response == null) return null;
      return Livestream.fromJson(response as Map<String, dynamic>);
    } catch (e) {
      return null;
    }
  }

  Future<bool> toggleLiveStatus(String livestreamId, bool isLive) async {
    try {
      await _client.rpc('toggle_live_status', params: {
        'p_livestream_id': livestreamId,
        'p_is_live': isLive,
      });
      return true;
    } catch (e) {
      return false;
    }
  }
}

