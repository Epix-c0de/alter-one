import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/subscription.dart';
import 'cache_service.dart';

class SupabaseSubscriptionService {
  final SupabaseClient _client;

  SupabaseSubscriptionService(this._client);

  Future<Subscription?> getSubscription(String userId) async {
    final cacheKey = 'subscription_$userId';
    final cached = await CacheService.get<Map<String, dynamic>>(cacheKey);
    if (cached != null) {
      return Subscription.fromJson(cached);
    }

    try {
      final response = await _client
          .from('subscriptions')
          .select()
          .eq('user_id', userId)
          .maybeSingle();

      if (response == null) return null;

      final subscription = Subscription.fromJson(response as Map<String, dynamic>);
      
      // Cache for 1 hour
      await CacheService.set(cacheKey, response, ttlHours: 1);
      
      return subscription;
    } catch (e) {
      return null;
    }
  }

  Future<bool> createTrialSubscription(String userId, String parishId) async {
    try {
      final trialStart = DateTime.now();
      final trialEnd = trialStart.add(const Duration(days: 14));

      await _client.from('subscriptions').insert({
        'user_id': userId,
        'parish_id': parishId,
        'active': false,
        'trial_expired': false,
        'trial_start': trialStart.toIso8601String().split('T')[0],
        'trial_end': trialEnd.toIso8601String().split('T')[0],
      });

      // Invalidate cache
      await CacheService.remove('subscription_$userId');

      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> updateSubscriptionAfterPayment({
    required String userId,
    required String paymentReference,
    required String paymentMethod,
    required double amount,
  }) async {
    try {
      await _client
          .from('subscriptions')
          .update({
            'active': true,
            'trial_expired': false,
            'payment_reference': paymentReference,
            'payment_method': paymentMethod,
            'amount_paid': amount,
          })
          .eq('user_id', userId);

      // Invalidate cache
      await CacheService.remove('subscription_$userId');

      return true;
    } catch (e) {
      return false;
    }
  }

  Future<List<Map<String, dynamic>>> getPaymentHistory(String userId) async {
    try {
      final response = await _client
          .from('payment_history')
          .select()
          .eq('user_id', userId)
          .order('created_at', ascending: false);

      return (response as List).cast<Map<String, dynamic>>();
    } catch (e) {
      return [];
    }
  }
}

