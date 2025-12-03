# Altar One - Complete Flutter App with Supabase Backend

## Overview

Altar One is a comprehensive multi-parish church application built with Flutter and Supabase. It provides features for daily readings, hymns, prayers, livestreams, announcements, group chat, and subscription management.

## Architecture

### Backend (Supabase)
- **Database**: PostgreSQL with PostGIS extension for geospatial queries
- **Authentication**: Supabase Auth (email/password + OAuth)
- **Realtime**: Supabase Realtime for chat and live updates
- **Storage**: Supabase Storage for media files
- **Edge Functions**: For payment processing (M-Pesa, Stripe)

### Frontend (Flutter)
- **State Management**: Riverpod
- **Routing**: go_router
- **Caching**: shared_preferences with TTL support
- **UI**: Glassmorphism design with Material 3

## Setup Instructions

### 1. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor and run the complete schema:
   ```bash
   # Run: supabase_schema_complete.sql
   ```
   This creates all tables, RLS policies, RPC functions, and triggers.

3. Configure Authentication:
   - Enable Email/Password authentication
   - Configure OAuth providers (Google) if needed
   - Set up email templates

4. Set up Storage buckets:
   - Create bucket: `media` (public)
   - Create bucket: `songs` (public)
   - Create bucket: `prayers` (public)

5. Configure Edge Functions (optional, for payments):
   - Deploy M-Pesa STK push function
   - Deploy Stripe checkout function
   - Set up webhooks

### 2. Flutter App Setup

1. Install dependencies:
   ```bash
   cd altar_one
   flutter pub get
   ```

2. Configure Supabase credentials:
   - Update `lib/main.dart` with your Supabase URL and anon key:
   ```dart
   const supabaseUrl = 'https://YOUR-PROJECT.supabase.co';
   const supabaseAnonKey = 'YOUR-ANON-KEY';
   ```

3. Run the app:
   ```bash
   flutter run
   ```

## Database Schema

### Core Tables
- `parishes` - Parish information with geospatial boundaries
- `local_churches` - Local churches within parishes
- `user_profiles` - Extended user profile data
- `users` - User role management

### Content Tables
- `parish_readings` - Daily readings by parish and date
- `parish_hymns` - Hymns organized by category
- `mass_responses` - Mass responses (English & Kiswahili)
- `prayers` - Prayer content by category
- `songs` - General songs (parish/archdiocese/universal)
- `livestreams` - Livestream URLs and status
- `announcements` - Parish announcements

### Communication Tables
- `chat_messages` - Group chat messages with reactions and read receipts
- `notifications` - In-app notifications
- `notification_preferences` - User notification settings

### Subscription Tables
- `subscriptions` - User subscription status and trial info
- `payment_history` - Payment transaction records

### Configuration Tables
- `app_media` - Splash/home/banner media
- `app_theme` - Dynamic theme configuration
- `app_updates` - App version updates
- `local_church_id_requests` - Requests for local church ID assignment

## RPC Functions

### Location Matching
```sql
SELECT match_parish_polygon(lat, lng);
-- Returns: parish_id (uuid)
```

### Local Church ID Requests
```sql
SELECT request_local_church_id(user_id, parish_id, local_church_id);
SELECT approve_local_church_id(request_id, local_church_id);
SELECT reject_local_church_id(request_id);
```

### Admin Functions
```sql
SELECT toggle_live_status(livestream_id, is_live);
SELECT admin_update_theme(parish_id, primary_color, accent_color, ...);
```

## Services Architecture

All services are located in `lib/src/core/services/`:

- `supabase_auth_service.dart` - Authentication (login, signup, OAuth)
- `supabase_profile_service.dart` - User profile management
- `supabase_parish_service.dart` - Parish and local church data
- `supabase_readings_service.dart` - Daily readings with caching
- `supabase_hymns_service.dart` - Hymns by category
- `supabase_responses_service.dart` - Mass responses (English/Kiswahili)
- `supabase_prayers_service.dart` - Prayers by category
- `supabase_songs_service.dart` - Songs player content
- `supabase_livestream_service.dart` - Livestream management
- `supabase_announcements_service.dart` - Announcements with pagination
- `supabase_chat_service.dart` - Real-time chat with Supabase Realtime
- `supabase_subscription_service.dart` - Subscription and payment management
- `supabase_media_service.dart` - App media (splash, banners)
- `supabase_admin_service.dart` - Admin operations

### Caching Strategy

Services use `CacheService` with TTL:
- Readings: 24 hours
- Hymns: 24 hours
- Mass Responses: 7 days (static content)
- Prayers: 24 hours
- Songs: 24 hours
- Announcements: 1 hour
- Profile: 1 hour
- Subscription: 1 hour

## Screen Implementation Status

### ✅ Completed
- Database schema (complete SQL with RLS)
- All DTO models
- All service classes with caching
- Riverpod providers
- Splash screen (partially wired)
- Login screen (partially wired)
- Signup screen (partially wired)

### 🔄 In Progress / Needs Completion
- **Splash Screen**: Wire media service, subscription check, update check
- **Login Screen**: Wire auth service, profile loading, navigation logic
- **Signup Screen**: Wire location matching, parish assignment, local church ID request
- **Home Dashboard**: Wire parish data, ticker announcements, menu tiles
- **Daily Readings**: Wire readings service, date filtering, bookmarks
- **Sunday Hymns**: Wire hymns service, category filtering, search
- **Mass Responses**: Wire responses service, language tabs, search
- **Prayers**: Wire prayers service, category filtering, offline support
- **Livestream**: Wire livestream service, video player, realtime chat
- **Songs Player**: Wire songs service, playlists, favorites
- **Announcements**: Wire announcements service, pagination, filters
- **Chat**: Wire chat service, Supabase Realtime subscription, message sending
- **Local Church ID Request**: Wire request RPC, status checking
- **Profile**: Wire profile service, subscription status, settings

## Wiring Screens - Example

Here's how to wire a screen using services:

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/providers/services_providers.dart';
import '../../core/models/reading.dart';

class ReadingsScreen extends ConsumerWidget {
  const ReadingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final readingsService = ref.watch(readingsServiceProvider);
    final profile = ref.watch(currentUserProvider);
    
    return FutureBuilder<ParishReading?>(
      future: profile.when(
        data: (user) => user != null 
          ? readingsService.getReadingByDate(user.parishId, DateTime.now())
          : null,
        loading: () => null,
        error: (_, __) => null,
      ),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        
        final reading = snapshot.data;
        if (reading == null) {
          return const Center(child: Text('No reading available today'));
        }
        
        return Scaffold(
          // ... UI implementation
        );
      },
    );
  }
}
```

## Realtime Chat Implementation

Chat uses Supabase Realtime:

```dart
final chatService = ref.watch(chatServiceProvider);
final channel = chatService.subscribeToMessages(
  groupType: 'parish',
  groupId: parishId,
  onNewMessage: (message) {
    // Update UI with new message
  },
);

// Cleanup on dispose
channel.unsubscribe();
```

## Payment Integration

### M-Pesa STK Push
1. Call Edge Function: `POST /edge/pay/mpesa/stk_push`
2. Poll status: `GET /edge/pay/mpesa/status?request_id={id}`
3. On success, update subscription via `subscriptionService.updateSubscriptionAfterPayment()`

### Stripe
1. Create checkout session via Edge Function
2. Handle webhook callback
3. Update subscription status

## Admin Panel

Admin features are accessible via `SupabaseAdminService`:
- Create/update readings, hymns, prayers, announcements
- Approve/reject local church ID requests
- Toggle livestream status
- Update theme
- Manage app media

## Testing

### Unit Tests
```bash
flutter test
```

### Integration Tests
Test flows:
1. Signup → Location → Parish Assignment → Request Local Church ID
2. Login → Load Home → View Reading → Bookmark
3. Chat → Send Message → Receive Realtime Update

### E2E Tests
Test on device/emulator:
- Payment flow (M-Pesa simulation)
- Realtime chat
- Offline caching

## Deployment

### Supabase
1. Run migrations in production
2. Set up Edge Functions
3. Configure environment variables
4. Set up webhooks

### Flutter
1. Build release APK/IPA:
   ```bash
   flutter build apk --release
   flutter build ios --release
   ```
2. Configure app signing
3. Upload to Play Store / App Store

## Environment Variables

Set these in your Supabase project:
- `MPESA_CONSUMER_KEY`
- `MPESA_CONSUMER_SECRET`
- `MPESA_PASSKEY`
- `MPESA_SHORTCODE`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Support & Documentation

- Supabase Docs: https://supabase.com/docs
- Flutter Docs: https://flutter.dev/docs
- Riverpod Docs: https://riverpod.dev

## License

[Your License Here]

