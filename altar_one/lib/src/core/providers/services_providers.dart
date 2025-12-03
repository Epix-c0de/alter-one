import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../services/supabase_auth_service.dart';
import '../services/supabase_profile_service.dart';
import '../services/supabase_parish_service.dart';
import '../services/supabase_readings_service.dart';
import '../services/supabase_hymns_service.dart';
import '../services/supabase_responses_service.dart';
import '../services/supabase_prayers_service.dart';
import '../services/supabase_livestream_service.dart';
import '../services/supabase_announcements_service.dart';
import '../services/supabase_chat_service.dart';
import '../services/supabase_subscription_service.dart';
import '../services/supabase_media_service.dart';
import '../services/supabase_admin_service.dart';
import '../services/supabase_songs_service.dart';

final supabaseClientProvider = Provider<SupabaseClient>((ref) {
  return Supabase.instance.client;
});

// Auth Service
final authServiceProvider = Provider<SupabaseAuthService>((ref) {
  return SupabaseAuthService(ref.watch(supabaseClientProvider));
});

// Profile Service
final profileServiceProvider = Provider<SupabaseProfileService>((ref) {
  return SupabaseProfileService(ref.watch(supabaseClientProvider));
});

// Parish Service
final parishServiceProvider = Provider<SupabaseParishService>((ref) {
  return SupabaseParishService(ref.watch(supabaseClientProvider));
});

// Readings Service
final readingsServiceProvider = Provider<SupabaseReadingsService>((ref) {
  return SupabaseReadingsService(ref.watch(supabaseClientProvider));
});

// Hymns Service
final hymnsServiceProvider = Provider<SupabaseHymnsService>((ref) {
  return SupabaseHymnsService(ref.watch(supabaseClientProvider));
});

// Responses Service
final responsesServiceProvider = Provider<SupabaseResponsesService>((ref) {
  return SupabaseResponsesService(ref.watch(supabaseClientProvider));
});

// Prayers Service
final prayersServiceProvider = Provider<SupabasePrayersService>((ref) {
  return SupabasePrayersService(ref.watch(supabaseClientProvider));
});

// Livestream Service
final livestreamServiceProvider = Provider<SupabaseLivestreamService>((ref) {
  return SupabaseLivestreamService(ref.watch(supabaseClientProvider));
});

// Announcements Service
final announcementsServiceProvider = Provider<SupabaseAnnouncementsService>((ref) {
  return SupabaseAnnouncementsService(ref.watch(supabaseClientProvider));
});

// Chat Service
final chatServiceProvider = Provider<SupabaseChatService>((ref) {
  return SupabaseChatService(ref.watch(supabaseClientProvider));
});

// Subscription Service
final subscriptionServiceProvider = Provider<SupabaseSubscriptionService>((ref) {
  return SupabaseSubscriptionService(ref.watch(supabaseClientProvider));
});

// Media Service
final mediaServiceProvider = Provider<SupabaseMediaService>((ref) {
  return SupabaseMediaService(ref.watch(supabaseClientProvider));
});

// Admin Service
final adminServiceProvider = Provider<SupabaseAdminService>((ref) {
  return SupabaseAdminService(ref.watch(supabaseClientProvider));
});

// Songs Service
final songsServiceProvider = Provider<SupabaseSongsService>((ref) {
  return SupabaseSongsService(ref.watch(supabaseClientProvider));
});

