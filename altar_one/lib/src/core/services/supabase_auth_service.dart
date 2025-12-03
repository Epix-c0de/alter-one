import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/user_profile.dart';
import 'cache_service.dart';

class SupabaseAuthService {
  final SupabaseClient _client;

  SupabaseAuthService(this._client);

  Future<AuthResponse> signInWithPassword(String email, String password) async {
    final response = await _client.auth.signInWithPassword(
      email: email,
      password: password,
    );
    
    if (response.user != null) {
      await _cacheUserSession(response.user!.id);
    }
    
    return response;
  }

  Future<bool> signUp({
    required String email,
    required String password,
    required String fullName,
    String? phone,
  }) async {
    final response = await _client.auth.signUp(
      email: email,
      password: password,
      data: {
        'full_name': fullName,
        'phone': phone,
      },
    );

    if (response.user != null) {
      await _cacheUserSession(response.user!.id);
      return true;
    }
    
    return false;
  }

  Future<bool> signInWithOAuth(OAuthProvider provider) async {
    try {
      await _client.auth.signInWithOAuth(provider);
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<void> signOut() async {
    await _client.auth.signOut();
    await CacheService.clear();
  }

  Future<void> resetPassword(String email) async {
    await _client.auth.resetPasswordForEmail(email);
  }

  User? get currentUser => _client.auth.currentUser;

  Stream<AuthState> get authStateChanges => _client.auth.onAuthStateChange;

  Future<void> _cacheUserSession(String userId) async {
    await CacheService.set('current_user_id', userId);
  }

  Future<String?> getCachedUserId() async {
    return await CacheService.get<String>('current_user_id');
  }
}

