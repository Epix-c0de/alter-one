import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../features/auth/presentation/auth_screens.dart';
import '../../features/home/presentation/home_screens.dart';
import '../../features/admin/presentation/admin_dashboard_screen.dart';
import '../../features/parish/presentation/parish_selector_screen.dart';
import '../../features/subscriptions/presentation/subscription_paywall_screen.dart';

// Simple auth + parish + subscription guards
String? _redirectLogic(BuildContext context, GoRouterState state) {
  final session = Supabase.instance.client.auth.currentSession;
  final isLoggedIn = session != null;
  final isAuthRoute = state.matchedLocation.startsWith('/auth');

  if (!isLoggedIn && !isAuthRoute) {
    return '/auth/login';
  }

  // Parish & subscription checks are handled via nested routes/shells.
  return null;
}

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    debugLogDiagnostics: true,
    initialLocation: '/auth/splash',
    redirect: _redirectLogic,
    routes: [
      GoRoute(
        path: '/auth/splash',
        builder: (context, state) => const AuthSplashScreen(),
      ),
      GoRoute(
        path: '/auth/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/auth/signup',
        builder: (context, state) => const SignupScreen(),
      ),
      GoRoute(
        path: '/auth/admin-login',
        builder: (context, state) => const AdminLoginScreen(),
      ),
      GoRoute(
        path: '/parish/select',
        builder: (context, state) => const ParishSelectorScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) => HomeShellScreen(child: child),
        routes: [
          GoRoute(
            path: '/',
            name: 'home',
            builder: (context, state) => const HomeDashboardScreen(),
          ),
          GoRoute(
            path: '/songs',
            builder: (context, state) => const SongsScreen(),
          ),
          GoRoute(
            path: '/readings',
            builder: (context, state) => const ReadingsScreen(),
          ),
          GoRoute(
            path: '/prayers',
            builder: (context, state) => const PrayersScreen(),
          ),
          GoRoute(
            path: '/livestream',
            builder: (context, state) => const LivestreamScreen(),
          ),
          GoRoute(
            path: '/announcements',
            builder: (context, state) => const AnnouncementsScreen(),
          ),
          GoRoute(
            path: '/chat',
            builder: (context, state) => const ChatScreen(),
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfileScreen(),
          ),
          GoRoute(
            path: '/subscription/paywall',
            builder: (context, state) => const SubscriptionPaywallScreen(),
          ),
        ],
      ),
      GoRoute(
        path: '/admin',
        builder: (context, state) => const AdminDashboardScreen(),
      ),
    ],
  );
});


