import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/user_profile.dart';
import 'cache_service.dart';

class SupabaseProfileService {
  final SupabaseClient _client;

  SupabaseProfileService(this._client);

  Future<UserProfile?> getProfile(String userId) async {
    // Check cache first
    final cached = await CacheService.get<Map<String, dynamic>>('profile_$userId');
    if (cached != null) {
      return UserProfile.fromJson(cached);
    }

    try {
      final response = await _client
          .from('user_profiles')
          .select()
          .eq('user_id', userId)
          .maybeSingle();

      if (response == null) return null;

      final profile = UserProfile.fromJson(response as Map<String, dynamic>);
      
      // Cache for 1 hour
      await CacheService.set('profile_$userId', response, ttlHours: 1);
      
      return profile;
    } catch (e) {
      return null;
    }
  }

  Future<UserProfile?> updateProfile({
    required String userId,
    String? fullName,
    String? phone,
  }) async {
    final updates = <String, dynamic>{};
    if (fullName != null) updates['full_name'] = fullName;
    if (phone != null) updates['phone'] = phone;

    try {
      final response = await _client
          .from('user_profiles')
          .update(updates)
          .eq('user_id', userId)
          .select()
          .single();

      final profile = UserProfile.fromJson(response as Map<String, dynamic>);
      
      // Update cache
      await CacheService.set('profile_$userId', response, ttlHours: 1);
      
      return profile;
    } catch (e) {
      return null;
    }
  }

  Future<bool> updateParishId(String userId, String parishId) async {
    try {
      await _client
          .from('user_profiles')
          .update({'parish_id': parishId})
          .eq('user_id', userId);
      
      // Invalidate cache
      await CacheService.remove('profile_$userId');
      
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> updateLocalChurchId(String userId, String localChurchId) async {
    try {
      await _client
          .from('user_profiles')
          .update({'local_church_id': localChurchId})
          .eq('user_id', userId);
      
      // Invalidate cache
      await CacheService.remove('profile_$userId');
      
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> deleteAccount(String userId) async {
    try {
      // This will cascade delete user_profiles due to FK constraint
      await _client.auth.admin.deleteUser(userId);
      await CacheService.remove('profile_$userId');
      return true;
    } catch (e) {
      return false;
    }
  }
}

