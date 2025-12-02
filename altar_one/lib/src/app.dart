import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';

class AltarOneApp extends ConsumerWidget {
  const AltarOneApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = ref.watch(appThemeProvider);
    final router = ref.watch(appRouterProvider);

    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      title: 'Altar One',
      themeMode: theme.mode,
      theme: theme.lightTheme,
      darkTheme: theme.darkTheme,
      routerConfig: router,
      builder: (context, child) {
        // Ensure Supabase auth state is ready before showing the app
        return AuthStateListener(child: child);
      },
    );
  }
}

class AuthStateListener extends StatefulWidget {
  final Widget? child;
  const AuthStateListener({required this.child, super.key});

  @override
  State<AuthStateListener> createState() => _AuthStateListenerState();
}

class _AuthStateListenerState extends State<AuthStateListener> {
  RealtimeChannel? _channel;

  @override
  void initState() {
    super.initState();
    // Example: listen to app_updates table for live feature/theme changes
    _channel = Supabase.instance.client
        .channel('public:app_updates')
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'app_updates',
          callback: (_) {
            // In a more advanced setup, inject a notifier and trigger a soft reload / snackbar
          },
        )
        .subscribe();
  }

  @override
  void dispose() {
    _channel?.unsubscribe();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return widget.child ?? const SizedBox.shrink();
  }
}


