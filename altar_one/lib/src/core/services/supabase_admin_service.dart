import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/app_update.dart';

class SupabaseAdminService {
  final SupabaseClient _client;

  SupabaseAdminService(this._client);

  Future<AppUpdate?> getLatestUpdate() async {
    try {
      final response = await _client
          .from('app_updates')
          .select()
          .order('release_date', ascending: false)
          .limit(1)
          .maybeSingle();

      if (response == null) return null;
      return AppUpdate.fromJson(response as Map<String, dynamic>);
    } catch (e) {
      return null;
    }
  }

  Future<bool> createParishReading({
    required String parishId,
    required DateTime date,
    required String title,
    String? firstReading,
    String? secondReading,
    String? psalm,
    String? gospel,
  }) async {
    try {
      await _client.from('parish_readings').insert({
        'parish_id': parishId,
        'date': date.toIso8601String().split('T')[0],
        'title': title,
        'first_reading': firstReading,
        'second_reading': secondReading,
        'psalm': psalm,
        'gospel': gospel,
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> createParishHymn({
    required String parishId,
    required String category,
    required String title,
    String? lyrics,
    String? audioUrl,
    String? youtubeId,
  }) async {
    try {
      await _client.from('parish_hymns').insert({
        'parish_id': parishId,
        'category': category,
        'title': title,
        'lyrics': lyrics,
        'audio_url': audioUrl,
        'youtube_id': youtubeId,
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> createPrayer({
    required String parishId,
    required String category,
    required String title,
    required String content,
  }) async {
    try {
      await _client.from('prayers').insert({
        'parish_id': parishId,
        'category': category,
        'title': title,
        'content': content,
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> createAnnouncement({
    required String parishId,
    required String title,
    required String body,
    String? localChurchId,
    String? category,
    bool pinned = false,
  }) async {
    try {
      await _client.from('announcements').insert({
        'parish_id': parishId,
        'local_church_id': localChurchId,
        'title': title,
        'body': body,
        'category': category,
        'pinned': pinned,
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> approveLocalChurchIdRequest(String requestId, String localChurchId) async {
    try {
      await _client.rpc('approve_local_church_id', params: {
        'p_request_id': requestId,
        'p_local_church_id': localChurchId,
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> rejectLocalChurchIdRequest(String requestId) async {
    try {
      await _client.rpc('reject_local_church_id', params: {
        'p_request_id': requestId,
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> updateTheme({
    required String parishId,
    required String primaryColor,
    required String accentColor,
    String? backgroundColor,
  }) async {
    try {
      await _client.rpc('admin_update_theme', params: {
        'p_parish_id': parishId,
        'p_primary_color': primaryColor,
        'p_accent_color': accentColor,
        'p_background_color': backgroundColor,
      });
      return true;
    } catch (e) {
      return false;
    }
  }
}

