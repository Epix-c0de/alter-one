import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class SubscriptionPaywallScreen extends StatefulWidget {
  const SubscriptionPaywallScreen({super.key});

  @override
  State<SubscriptionPaywallScreen> createState() =>
      _SubscriptionPaywallScreenState();
}

class _SubscriptionPaywallScreenState extends State<SubscriptionPaywallScreen> {
  bool _mpesaLoading = false;
  bool _cardLoading = false;
  bool _legalAccepted = false;
  int _trialDaysRemaining = 14; // TODO: load from Supabase `subscriptions`

  Future<void> _startMpesa() async {
    if (!_legalAccepted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please confirm you have permission to pay.'),
        ),
      );
      return;
    }

    setState(() => _mpesaLoading = true);

    try {
      final client = Supabase.instance.client;
      final user = client.auth.currentUser;
      if (user == null) throw Exception('Not authenticated');

      // TODO: fetch user phone from profile
      final phone = '2547XXXXXXXX';

      // Call Edge Function: POST /edge/pay/mpesa/stk_push
      // Example using Supabase functions.invoke (configure path accordingly)
      final res = await client.functions.invoke(
        'pay-mpesa-stk-push',
        body: {
          'user_id': user.id,
          'amount': 100,
          'phone': phone,
          'meta': {
            'source': 'mobile_app',
          },
        },
      );

      final requestId = (res.data as Map?)?['request_id'] as String?;
      if (requestId == null) {
        throw Exception('Could not initiate payment.');
      }

      if (!mounted) return;
      await showDialog<void>(
        context: context,
        barrierDismissible: false,
        builder: (_) => _MpesaPollingDialog(requestId: requestId),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('M‑Pesa init failed: $e')),
      );
    } finally {
      if (mounted) setState(() => _mpesaLoading = false);
    }
  }

  Future<void> _startCardPayment() async {
    if (!_legalAccepted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please confirm you have permission to pay.'),
        ),
      );
      return;
    }

    setState(() => _cardLoading = true);
    try {
      final client = Supabase.instance.client;
      final user = client.auth.currentUser;
      if (user == null) throw Exception('Not authenticated');

      // Call Edge Function to create Stripe checkout session
      final res = await client.functions.invoke(
        'pay-card-checkout',
        body: {
          'user_id': user.id,
          'amount': 100,
          'currency': 'KES',
        },
      );

      final url = (res.data as Map?)?['checkout_url'] as String?;
      if (url == null) throw Exception('Could not start card payment.');

      // TODO: open url in in-app browser / external browser and rely on webhook to update subscription
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Card payment error: $e')),
      );
    } finally {
      if (mounted) setState(() => _cardLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final progress = (_trialDaysRemaining.clamp(0, 14)) / 14.0;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Subscription'),
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Column(
                  children: [
                    SizedBox(
                      height: 100,
                      width: 100,
                      child: Stack(
                        fit: StackFit.expand,
                        children: [
                          CircularProgressIndicator(
                            value: progress,
                            strokeWidth: 8,
                          ),
                          Center(
                            child: Text(
                              '$_trialDaysRemaining',
                              style: theme.textTheme.headlineSmall?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ).animate().scale(
                          duration: 500.ms,
                          curve: Curves.easeOutBack,
                        ),
                    const SizedBox(height: 8),
                    const Text('Days remaining in your free trial'),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              Card(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Unlock lifetime access — KES 100',
                        style: theme.textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        '14‑day free trial — You’ll only be charged after trial ends unless canceled.',
                      ),
                      const SizedBox(height: 16),
                      const ListTile(
                        dense: true,
                        leading: Icon(Icons.check_circle_rounded,
                            color: Colors.green),
                        title: Text('Unlimited access to parish content'),
                      ),
                      const ListTile(
                        dense: true,
                        leading: Icon(Icons.check_circle_rounded,
                            color: Colors.green),
                        title:
                            Text('Livestreams, songs, prayers, and chat'),
                      ),
                      const ListTile(
                        dense: true,
                        leading: Icon(Icons.check_circle_rounded,
                            color: Colors.green),
                        title: Text(
                            'Supports your parish\'s digital mission'),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              CheckboxListTile(
                value: _legalAccepted,
                onChanged: (v) => setState(() => _legalAccepted = v ?? false),
                title: const Text(
                  'I confirm I have permission to pay on behalf of my account.',
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: FilledButton.icon(
                  icon: _mpesaLoading
                      ? const SizedBox(
                          height: 18,
                          width: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.phone_android_rounded),
                  label: const Text('Pay with M‑Pesa'),
                  onPressed: _mpesaLoading ? null : _startMpesa,
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  icon: _cardLoading
                      ? const SizedBox(
                          height: 18,
                          width: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.credit_card_rounded),
                  label: const Text('Pay with Card'),
                  onPressed: _cardLoading ? null : _startCardPayment,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'Payment history',
                style: theme.textTheme.titleMedium
                    ?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              _PaymentHistoryTable(),
            ],
          ),
        ),
      ),
    );
  }
}

class _PaymentHistoryTable extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    // TODO: load from /api/user/{id}/payments
    final theme = Theme.of(context);
    return Card(
      child: Column(
        children: [
          ListTile(
            title: Text(
              'Transaction',
              style: theme.textTheme.bodySmall
                  ?.copyWith(fontWeight: FontWeight.bold),
            ),
            trailing: Text(
              'Status',
              style: theme.textTheme.bodySmall
                  ?.copyWith(fontWeight: FontWeight.bold),
            ),
          ),
          const Divider(height: 1),
          ListTile(
            title: const Text('TX12345678'),
            subtitle: const Text('2025‑01‑01'),
            trailing: const Text('Success'),
            onTap: () {
              showDialog<void>(
                context: context,
                builder: (_) => const _ReceiptDialog(),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _ReceiptDialog extends StatelessWidget {
  const _ReceiptDialog();

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Payment receipt'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: const [
          Text('Reference: TX12345678'),
          Text('Amount: KES 100'),
          Text('Date: 2025‑01‑01'),
          Text('Parish: Holy Trinity Parish'),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () {
            // TODO: download PDF via backend link
          },
          child: const Text('Download PDF'),
        ),
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Close'),
        ),
      ],
    );
  }
}

class _MpesaPollingDialog extends StatefulWidget {
  final String requestId;

  const _MpesaPollingDialog({required this.requestId});

  @override
  State<_MpesaPollingDialog> createState() => _MpesaPollingDialogState();
}

class _MpesaPollingDialogState extends State<_MpesaPollingDialog> {
  String _statusText = 'STK push initiated. Waiting for confirmation...';
  Timer? _timer;
  int _attempt = 0;

  @override
  void initState() {
    super.initState();
    _poll();
  }

  Future<void> _poll() async {
    final client = Supabase.instance.client;
    const maxDuration = Duration(minutes: 2);
    final start = DateTime.now();

    while (mounted &&
        DateTime.now().difference(start) < maxDuration) {
      try {
        _attempt++;
        setState(() {
          _statusText = 'Checking payment status (attempt $_attempt)...';
        });

        final res = await client.functions.invoke(
          'pay-mpesa-status',
          body: {'request_id': widget.requestId},
        );
        final data = res.data as Map?;
        final status = data?['status'] as String?;

        if (status == 'success') {
          if (!mounted) return;
          Navigator.of(context).pop();
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text(
                'Payment received — thank you! Your account is now unlocked.',
              ),
            ),
          );
          return;
        } else if (status == 'failed') {
          if (!mounted) return;
          Navigator.of(context).pop();
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'Payment failed: ${data?['reason'] ?? 'Unknown error'}',
              ),
            ),
          );
          return;
        }
      } catch (_) {
        // ignore transient errors; keep polling
      }

      final delay = Duration(
        seconds: (2 * _attempt).clamp(2, 15),
      );
      await Future.delayed(delay);
    }

    if (!mounted) return;
    setState(() {
      _statusText =
          'No response yet. You can close this dialog and tap "Verify payment" later.';
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Processing payment'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const CircularProgressIndicator(),
          const SizedBox(height: 16),
          Text(_statusText),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Close'),
        ),
      ],
    );
  }
}

