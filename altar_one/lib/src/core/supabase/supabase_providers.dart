import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

final supabaseClientProvider = Provider<SupabaseClient>(
  (ref) => Supabase.instance.client,
);

// Simple user-parish model
class ParishUser {
  final String id;
  final String parishId;
  final String role;

  ParishUser({
    required this.id,
    required this.parishId,
    required this.role,
  });
}

final currentUserProvider = FutureProvider<ParishUser?>((ref) async {
  final client = ref.watch(supabaseClientProvider);
  final user = client.auth.currentUser;
  if (user == null) return null;

  final result = await client
      .from('users')
      .select<Map<String, dynamic>>()
      .eq('user_id', user.id)
      .maybeSingle();

  if (result == null) return null;

  return ParishUser(
    id: result['user_id'] as String,
    parishId: result['parish_id'] as String,
    role: result['role'] as String,
  );
});


