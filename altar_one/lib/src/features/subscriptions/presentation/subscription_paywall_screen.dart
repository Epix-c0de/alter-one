import 'package:flutter/material.dart';

class SubscriptionPaywallScreen extends StatelessWidget {
  const SubscriptionPaywallScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              IconButton(
                icon: const Icon(Icons.close_rounded),
                onPressed: () => Navigator.of(context).pop(),
              ),
              const SizedBox(height: 16),
              Text(
                'Continue your journey',
                style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                'After your 14-day free trial, unlock full access to your parish for a one-time KSh 100.',
                style: theme.textTheme.bodyMedium,
              ),
              const SizedBox(height: 24),
              ListTile(
                leading: const Icon(Icons.check_circle_rounded, color: Colors.green),
                title: const Text('Unlimited access to parish content'),
              ),
              const ListTile(
                leading: Icon(Icons.check_circle_rounded, color: Colors.green),
                title: Text('Livestreams, songs, prayers, and chat'),
              ),
              const ListTile(
                leading: Icon(Icons.check_circle_rounded, color: Colors.green),
                title: Text('Supports your parish\'s digital mission'),
              ),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: () {
                    // TODO: Trigger M-Pesa STK push / Stripe via Supabase Edge Function
                  },
                  child: const Text('Pay KSh 100'),
                ),
              ),
              const SizedBox(height: 12),
              Center(
                child: Text(
                  'Powered by secure payments',
                  style: theme.textTheme.bodySmall,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}


