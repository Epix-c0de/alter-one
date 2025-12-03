import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:glassmorphism/glassmorphism.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/providers/services_providers.dart';
import '../../../core/models/app_media.dart';
import '../../../core/models/app_update.dart';
import '../../../core/models/subscription.dart';

class AuthSplashScreen extends ConsumerStatefulWidget {
  const AuthSplashScreen({super.key});

  @override
  ConsumerState<AuthSplashScreen> createState() => _AuthSplashScreenState();
}

class _AuthSplashScreenState extends ConsumerState<AuthSplashScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _waveController;
  AppMedia? _media;
  bool _checkingUpdate = true;
  bool _showUpdateDialog = false;
  Subscription? _subscription;
  AppUpdate? _latestUpdate;

  @override
  void initState() {
    super.initState();
    _waveController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat(reverse: true);

    _init();
  }

  Future<void> _init() async {
    final client = Supabase.instance.client;
    final mediaService = ref.read(mediaServiceProvider);
    final adminService = ref.read(adminServiceProvider);
    final subscriptionService = ref.read(subscriptionServiceProvider);

    // 1) Preload session
    final session = client.auth.currentSession;

    // 2) Fetch remote theme/media/update/subscription hints in parallel
    await Future.wait([
      _loadMedia(mediaService),
      _checkForUpdate(adminService),
      _loadSubscriptionState(subscriptionService, session),
      _preloadLocationAndChurchId(),
    ]);

    // 3) Small delay for splash feel + navigation logic
    await Future.delayed(const Duration(milliseconds: 1200));

    if (!mounted) return;

    if (_showUpdateDialog && _latestUpdate != null) {
      await _showUpdatePopup();
    }

    if (!mounted) return;

    if (_subscription?.trialExpired == true || _subscription?.active == false) {
      context.go('/subscription/paywall');
      return;
    }

    if (session == null) {
      context.go('/auth/login');
    } else {
      // Check if user has parish_id, if not go to parish selector
      final profileService = ref.read(profileServiceProvider);
      final profile = await profileService.getProfile(session.user.id);
      if (profile?.parishId == null) {
        context.go('/parish/select');
      } else if (profile?.localChurchId == null) {
        context.go('/local-church-id-request');
      } else {
        context.go('/');
      }
    }
  }

  Future<void> _loadMedia(mediaService) async {
    try {
      final media = await mediaService.getSplashMedia();
      if (!mounted) return;
      setState(() {
        _media = media;
      });
    } catch (_) {
      // Ignore – keep default UI
    }
  }

  Future<void> _checkForUpdate(adminService) async {
    try {
      const currentVersion = '1.0.0'; // Get from package_info_plus
      final update = await adminService.getLatestUpdate();

      if (!mounted) {
        setState(() => _checkingUpdate = false);
        return;
      }

      if (update != null) {
        setState(() {
          _latestUpdate = update;
          _checkingUpdate = false;
          _showUpdateDialog = update.isNewerThan(currentVersion) || update.mandatory;
        });
      } else {
        setState(() => _checkingUpdate = false);
      }
    } catch (_) {
      if (mounted) {
        setState(() => _checkingUpdate = false);
      }
    }
  }

  bool _isNewerVersion(String latest, String current) {
    try {
      List<int> parse(String v) =>
          v.split('.').map((e) => int.tryParse(e) ?? 0).toList();

      final l = parse(latest);
      final c = parse(current);
      for (var i = 0; i < 3; i++) {
        if ((l.length > i ? l[i] : 0) > (c.length > i ? c[i] : 0)) {
          return true;
        } else if ((l.length > i ? l[i] : 0) < (c.length > i ? c[i] : 0)) {
          return false;
        }
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  Future<void> _loadSubscriptionState(
      subscriptionService, Session? session) async {
    if (session == null) return;
    try {
      final subscription = await subscriptionService.getSubscription(session.user.id);
      if (!mounted) return;
      setState(() {
        _subscription = subscription;
      });
    } catch (_) {
      // Fallback: allow through
    }
  }

  Future<void> _preloadLocationAndChurchId() async {
    // Preload location permission status and cached church ID
    // This is non-blocking and can be done in background
    // Implementation would use geolocator and CacheService
  }

  Future<void> _showUpdatePopup() async {
    if (_latestUpdate == null) return;
    
    final isMandatory = _latestUpdate!.mandatory;
    
    await showDialog<void>(
      context: context,
      barrierDismissible: !isMandatory,
      builder: (context) {
        return AlertDialog(
          title: const Text('Update available'),
          content: Text(
            _latestUpdate!.description ?? 
            'A new version of Altar One is available. Please update to enjoy the latest features and fixes.',
          ),
          actions: [
            if (!isMandatory)
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('Later'),
              ),
            FilledButton(
              onPressed: () {
                // Open store link via url_launcher
                // final url = 'https://play.google.com/store/apps/details?id=...';
                // url_launcher.launchUrl(Uri.parse(url));
                Navigator.of(context).pop();
              },
              child: const Text('Update now'),
            ),
          ],
        );
      },
    );
  }

  @override
  void dispose() {
    _waveController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Scaffold(
      body: Stack(
        children: [
          // Animated gradient background
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  colorScheme.primary.withOpacity(0.9),
                  colorScheme.secondary.withOpacity(0.9),
                  const Color(0xFF050816),
                ],
              ),
            ),
          ).animate().fadeIn(duration: 800.ms),

          // Animated wave at bottom
          Align(
            alignment: Alignment.bottomCenter,
            child: AnimatedBuilder(
              animation: _waveController,
              builder: (context, child) {
                return ClipPath(
                  clipper: _WaveClipper(_waveController.value),
                  child: Container(
                    height: MediaQuery.of(context).size.height * 0.4,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          colorScheme.primary.withOpacity(0.7),
                          colorScheme.tertiary.withOpacity(0.8),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ).animate().slideY(begin: 0.4, end: 0, duration: 900.ms),
          ),

          // Particles / glow
          Positioned.fill(
            child: IgnorePointer(
              child: CustomPaint(
                painter: _ParticlesPainter(colorScheme.primary.withOpacity(0.15)),
              ),
            ),
          ),

          // Content
          SafeArea(
            child: Column(
              children: [
                const SizedBox(height: 24),
                // Logo + title
                Column(
                  children: [
                    Icon(
                      Icons.church_rounded,
                      size: 52,
                      color: Colors.white.withOpacity(0.95),
                    ).animate().scale(
                          duration: 1200.ms,
                          curve: Curves.easeOutBack,
                          begin: const Offset(0.7, 0.7),
                          end: const Offset(1, 1),
                        ).shimmer(duration: 2000.ms),
                    const SizedBox(height: 8),
                    Text(
                      'Altar One',
                      style: theme.textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        shadows: [
                          Shadow(
                            color: Colors.white.withOpacity(0.6),
                            blurRadius: 18,
                          ),
                        ],
                      ),
                    ).animate().fadeIn(duration: 900.ms).moveY(begin: 10, end: 0),
                    const SizedBox(height: 4),
                    Text(
                      'A unified digital altar for every parish.',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: Colors.white.withOpacity(0.85),
                      ),
                    ),
                    const SizedBox(height: 16),
                    // Rotating progress indicator
                    const SizedBox(
                      height: 28,
                      width: 28,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.6,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    ).animate().fadeIn(duration: 600.ms),
                  ],
                ),

                const Spacer(),

                // Media card (photo/video)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0),
                  child: GlassmorphicContainer(
                    width: double.infinity,
                    height: MediaQuery.of(context).size.height * 0.32,
                    borderRadius: 28,
                    blur: 24,
                    alignment: Alignment.center,
                    border: 1,
                    linearGradient: LinearGradient(
                      colors: [
                        Colors.white.withOpacity(0.20),
                        Colors.white.withOpacity(0.04),
                      ],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderGradient: LinearGradient(
                      colors: [
                        Colors.white.withOpacity(0.7),
                        Colors.white.withOpacity(0.1),
                      ],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(24),
                      child: _media == null
                          ? Icon(
                              Icons.church_outlined,
                              size: 72,
                              color: Colors.white.withOpacity(0.7),
                            )
                              .animate()
                              .fadeIn(delay: 400.ms, duration: 600.ms)
                              .moveY(begin: 16, end: 0)
                          : Stack(
                              fit: StackFit.expand,
                              children: [
                                // For now, treat both image/video URL as image preview.
                                Image.network(
                                  _media!.url,
                                  fit: BoxFit.cover,
                                ).animate().fadeIn(duration: 900.ms).slideY(
                                      begin: 0.08,
                                      end: 0,
                                      curve: Curves.easeOut,
                                    ),
                                if (_media!.type == 'video')
                                  Align(
                                    alignment: Alignment.center,
                                    child: Container(
                                      padding: const EdgeInsets.all(10),
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        color: Colors.black.withOpacity(0.5),
                                      ),
                                      child: const Icon(
                                        Icons.play_arrow_rounded,
                                        color: Colors.white,
                                        size: 32,
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                    ),
                  ).animate().fadeIn(duration: 900.ms).moveY(begin: 20, end: 0),
                ),

                const SizedBox(height: 32),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _WaveClipper extends CustomClipper<Path> {
  final double t;

  _WaveClipper(this.t);

  @override
  Path getClip(Size size) {
    final path = Path()..lineTo(0, 0);

    final waveHeight = 24.0;
    final yOffset = 40.0;

    path.lineTo(0, yOffset);

    final firstControlPoint = Offset(size.width * 0.25, yOffset + waveHeight * (0.5 - t));
    final firstEndPoint = Offset(size.width * 0.5, yOffset);

    final secondControlPoint = Offset(size.width * 0.75, yOffset - waveHeight * (0.5 - t));
    final secondEndPoint = Offset(size.width, yOffset);

    path.quadraticBezierTo(
      firstControlPoint.dx,
      firstControlPoint.dy,
      firstEndPoint.dx,
      firstEndPoint.dy,
    );
    path.quadraticBezierTo(
      secondControlPoint.dx,
      secondControlPoint.dy,
      secondEndPoint.dx,
      secondEndPoint.dy,
    );

    path
      ..lineTo(size.width, size.height)
      ..lineTo(0, size.height)
      ..close();

    return path;
  }

  @override
  bool shouldReclip(covariant _WaveClipper oldClipper) => oldClipper.t != t;
}

class _ParticlesPainter extends CustomPainter {
  final Color color;

  _ParticlesPainter(this.color);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 8);

    // simple static "particle" blobs
    canvas.drawCircle(Offset(size.width * 0.2, size.height * 0.25), 26, paint);
    canvas.drawCircle(Offset(size.width * 0.8, size.height * 0.15), 18, paint);
    canvas.drawCircle(Offset(size.width * 0.7, size.height * 0.5), 22, paint);
    canvas.drawCircle(Offset(size.width * 0.35, size.height * 0.7), 18, paint);
  }

  @override
  bool shouldRepaint(covariant _ParticlesPainter oldDelegate) =>
      oldDelegate.color != color;
}

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _loading = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    setState(() => _loading = true);
    final client = Supabase.instance.client;

    try {
      final email = _emailController.text.trim();
      final password = _passwordController.text;

      await client.auth.signInWithPassword(email: email, password: password);

      // Fetch user profile + parish + subscription + church id
      final user = client.auth.currentUser;
      if (user == null) {
        setState(() => _loading = false);
        return;
      }

      final profile = await client
          .from('user_profiles')
          .select<Map<String, dynamic>>()
          .eq('user_id', user.id)
          .maybeSingle();

      final parishId = profile?['parish_id'] as String?;
      final localChurchId = profile?['local_church_id'] as String?;
      final trialExpired = profile?['trial_expired'] as bool? ?? false;

      // Fetch GPS + assigned local church id if needed
      // TODO: plug in geolocation + polygon match if required here

      if (!mounted) return;

      if (trialExpired) {
        context.go('/subscription/paywall');
        return;
      }

      if (parishId == null) {
        context.go('/parish/select');
        return;
      }

      if (localChurchId == null) {
        context.go('/local-church-id-request');
        return;
      }

      context.go('/');
    } on AuthException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.message)),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Something went wrong. Please try again.')),
      );
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _signInWithGoogle() async {
    final client = Supabase.instance.client;
    try {
      await client.auth.signInWithOAuth(
        OAuthProvider.google,
        redirectTo: null, // configure for mobile if needed
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not start Google sign-in.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Scaffold(
      body: Stack(
        children: [
          // Background gradient
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  colorScheme.primary.withOpacity(0.95),
                  colorScheme.secondary.withOpacity(0.8),
                  Colors.black,
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
          ),
          // Blur overlay
          Container(
            color: Colors.black.withOpacity(0.35),
          ),

          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back_ios_new_rounded,
                        color: Colors.white),
                    onPressed: () => context.go('/auth/splash'),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Welcome back',
                    style: theme.textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Sign in to your parish space',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: Colors.white70,
                    ),
                  ),
                  const SizedBox(height: 32),

                  Expanded(
                    child: SingleChildScrollView(
                      child: Column(
                        children: [
                          GlassmorphicContainer(
                            width: double.infinity,
                            borderRadius: 28,
                            blur: 22,
                            border: 1,
                            linearGradient: LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: [
                                Colors.white.withOpacity(0.16),
                                Colors.white.withOpacity(0.04),
                              ],
                            ),
                            borderGradient: LinearGradient(
                              colors: [
                                Colors.white.withOpacity(0.6),
                                Colors.white.withOpacity(0.1),
                              ],
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(20),
                              child: Column(
                                children: [
                                  TextField(
                                    controller: _emailController,
                                    keyboardType: TextInputType.emailAddress,
                                    decoration: InputDecoration(
                                      labelText: 'Email or phone',
                                      prefixIcon: const Icon(
                                          Icons.mail_outline_rounded),
                                      filled: true,
                                      fillColor:
                                          Colors.black.withOpacity(0.12),
                                      labelStyle: const TextStyle(
                                        color: Colors.white70,
                                      ),
                                      border: OutlineInputBorder(
                                        borderRadius:
                                            BorderRadius.circular(18),
                                      ),
                                    ),
                                    style: const TextStyle(
                                      color: Colors.white,
                                    ),
                                  ),
                                  const SizedBox(height: 16),
                                  TextField(
                                    controller: _passwordController,
                                    obscureText: true,
                                    decoration: InputDecoration(
                                      labelText: 'Password',
                                      prefixIcon: const Icon(
                                          Icons.lock_outline_rounded),
                                      filled: true,
                                      fillColor:
                                          Colors.black.withOpacity(0.12),
                                      labelStyle: const TextStyle(
                                        color: Colors.white70,
                                      ),
                                      border: OutlineInputBorder(
                                        borderRadius:
                                            BorderRadius.circular(18),
                                      ),
                                    ),
                                    style: const TextStyle(
                                      color: Colors.white,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Align(
                                    alignment: Alignment.centerRight,
                                    child: TextButton(
                                      onPressed: () {
                                        // TODO: route to reset flow
                                      },
                                      child: const Text(
                                        'Forgot password?',
                                        style: TextStyle(color: Colors.white),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  SizedBox(
                                    width: double.infinity,
                                    child: FilledButton(
                                      onPressed:
                                          _loading ? null : _handleLogin,
                                      style: FilledButton.styleFrom(
                                        backgroundColor: Colors.white,
                                        foregroundColor: Colors.black,
                                        shape: RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(999),
                                        ),
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 32,
                                          vertical: 14,
                                        ),
                                      ),
                                      child: _loading
                                          ? const SizedBox(
                                              height: 18,
                                              width: 18,
                                              child:
                                                  CircularProgressIndicator(
                                                strokeWidth: 2,
                                              ),
                                            )
                                          : const Text('Sign in'),
                                    ),
                                  ),
                                  const SizedBox(height: 12),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Container(
                                          height: 1,
                                          color: Colors.white24,
                                        ),
                                      ),
                                      const Padding(
                                        padding:
                                            EdgeInsets.symmetric(horizontal: 8),
                                        child: Text(
                                          'or',
                                          style:
                                              TextStyle(color: Colors.white70),
                                        ),
                                      ),
                                      Expanded(
                                        child: Container(
                                          height: 1,
                                          color: Colors.white24,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  SizedBox(
                                    width: double.infinity,
                                    child: OutlinedButton.icon(
                                      onPressed: _signInWithGoogle,
                                      style: OutlinedButton.styleFrom(
                                        foregroundColor: Colors.white,
                                        side: const BorderSide(
                                          color: Colors.white54,
                                        ),
                                        shape: RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(999),
                                        ),
                                      ),
                                      icon: const Icon(Icons.g_mobiledata,
                                          size: 28),
                                      label: const Text(
                                        'Continue with Google',
                                        style: TextStyle(
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ).animate().fadeIn(duration: 600.ms).moveY(
                                begin: 20,
                                end: 0,
                                curve: Curves.easeOut,
                              ),
                          const SizedBox(height: 24),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              TextButton(
                                onPressed: () => context.go('/auth/signup'),
                                child: const Text(
                                  'Create account',
                                  style: TextStyle(color: Colors.white),
                                ),
                              ),
                              TextButton(
                                onPressed: () =>
                                    context.go('/auth/admin-login'),
                                child: const Text(
                                  'Admin login',
                                  style: TextStyle(color: Colors.white70),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'By continuing you agree to our Terms of Service and Privacy Policy.',
                            textAlign: TextAlign.center,
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: Colors.white60,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _useDeviceLocation = true;
  bool _loading = false;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleSignup() async {
    if (_passwordController.text != _confirmPasswordController.text) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Passwords do not match')),
      );
      return;
    }

    setState(() => _loading = true);
    final client = Supabase.instance.client;

    try {
      final email = _emailController.text.trim();
      final password = _passwordController.text;

      final authResponse = await client.auth.signUp(
        email: email,
        password: password,
        data: {
          'full_name': _nameController.text.trim(),
          'phone': _phoneController.text.trim(),
        },
      );

      final user = authResponse.user;
      if (user == null) {
        setState(() => _loading = false);
        return;
      }

      String? parishId;

      if (_useDeviceLocation) {
        // TODO: ask for location permission + get lat/lng with geolocator
        final lat = 0.0;
        final lng = 0.0;

        // Example RPC that returns closest parish polygon id
        final res = await client.rpc<Map<String, dynamic>>(
          'match_parish_polygon',
          params: {
            'lat': lat,
            'lng': lng,
          },
        );
        parishId = res?['parish_id'] as String?;
      }

      await client.from('user_profiles').upsert({
        'user_id': user.id,
        'full_name': _nameController.text.trim(),
        'phone': _phoneController.text.trim(),
        'email': email,
        'parish_id': parishId,
        'local_church_id': null,
      });

      if (!mounted) return;

      final result = await showDialog<bool>(
        context: context,
        barrierDismissible: false,
        builder: (context) {
          return AlertDialog(
            title: const Text('Request Local Church ID?'),
            content: const Text(
              'Request your Local Church ID from your Local Church Administrator?',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(false),
                child: const Text('Skip'),
              ),
              FilledButton(
                onPressed: () => Navigator.of(context).pop(true),
                child: const Text('Request ID'),
              ),
            ],
          );
        },
      );

      if (!mounted) return;

      if (result == true) {
        context.go('/local-church-id-request');
      } else {
        context.go('/');
      }
    } on AuthException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.message)),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Could not complete sign-up. Please try again.'),
        ),
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Scaffold(
      body: Stack(
        children: [
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  colorScheme.primary.withOpacity(0.95),
                  colorScheme.secondary.withOpacity(0.8),
                  Colors.black,
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
          ),
          Container(
            color: Colors.black.withOpacity(0.35),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back_ios_new_rounded,
                        color: Colors.white),
                    onPressed: () => context.go('/auth/login'),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Create account',
                    style: theme.textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Join your parish digital community.',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: Colors.white70,
                    ),
                  ),
                  const SizedBox(height: 24),
                  Expanded(
                    child: SingleChildScrollView(
                      child: GlassmorphicContainer(
                        width: double.infinity,
                        borderRadius: 28,
                        blur: 22,
                        border: 1,
                        linearGradient: LinearGradient(
                          colors: [
                            Colors.white.withOpacity(0.16),
                            Colors.white.withOpacity(0.04),
                          ],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderGradient: LinearGradient(
                          colors: [
                            Colors.white.withOpacity(0.6),
                            Colors.white.withOpacity(0.1),
                          ],
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            children: [
                              TextField(
                                controller: _nameController,
                                decoration: InputDecoration(
                                  labelText: 'Full name',
                                  prefixIcon:
                                      const Icon(Icons.person_outline_rounded),
                                  filled: true,
                                  fillColor: Colors.black.withOpacity(0.12),
                                  labelStyle:
                                      const TextStyle(color: Colors.white70),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(18),
                                  ),
                                ),
                                style: const TextStyle(color: Colors.white),
                              ),
                              const SizedBox(height: 16),
                              TextField(
                                controller: _emailController,
                                keyboardType: TextInputType.emailAddress,
                                decoration: InputDecoration(
                                  labelText: 'Email',
                                  prefixIcon:
                                      const Icon(Icons.mail_outline_rounded),
                                  filled: true,
                                  fillColor: Colors.black.withOpacity(0.12),
                                  labelStyle:
                                      const TextStyle(color: Colors.white70),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(18),
                                  ),
                                ),
                                style: const TextStyle(color: Colors.white),
                              ),
                              const SizedBox(height: 16),
                              TextField(
                                controller: _phoneController,
                                keyboardType: TextInputType.phone,
                                decoration: InputDecoration(
                                  labelText: 'Phone',
                                  prefixIcon:
                                      const Icon(Icons.phone_outlined),
                                  filled: true,
                                  fillColor: Colors.black.withOpacity(0.12),
                                  labelStyle:
                                      const TextStyle(color: Colors.white70),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(18),
                                  ),
                                ),
                                style: const TextStyle(color: Colors.white),
                              ),
                              const SizedBox(height: 16),
                              TextField(
                                controller: _passwordController,
                                obscureText: true,
                                decoration: InputDecoration(
                                  labelText: 'Password',
                                  prefixIcon:
                                      const Icon(Icons.lock_outline_rounded),
                                  filled: true,
                                  fillColor: Colors.black.withOpacity(0.12),
                                  labelStyle:
                                      const TextStyle(color: Colors.white70),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(18),
                                  ),
                                ),
                                style: const TextStyle(color: Colors.white),
                              ),
                              const SizedBox(height: 16),
                              TextField(
                                controller: _confirmPasswordController,
                                obscureText: true,
                                decoration: InputDecoration(
                                  labelText: 'Confirm password',
                                  prefixIcon:
                                      const Icon(Icons.lock_outline_rounded),
                                  filled: true,
                                  fillColor: Colors.black.withOpacity(0.12),
                                  labelStyle:
                                      const TextStyle(color: Colors.white70),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(18),
                                  ),
                                ),
                                style: const TextStyle(color: Colors.white),
                              ),
                              const SizedBox(height: 12),
                              SwitchListTile.adaptive(
                                value: _useDeviceLocation,
                                onChanged: (v) =>
                                    setState(() => _useDeviceLocation = v),
                                title: const Text(
                                  'Use device location to auto-detect parish',
                                  style: TextStyle(color: Colors.white),
                                ),
                                subtitle: const Text(
                                  'We will ask for location permission.',
                                  style: TextStyle(color: Colors.white70),
                                ),
                              ),
                              const SizedBox(height: 16),
                              SizedBox(
                                width: double.infinity,
                                child: FilledButton(
                                  onPressed:
                                      _loading ? null : _handleSignup,
                                  style: FilledButton.styleFrom(
                                    backgroundColor: Colors.white,
                                    foregroundColor: Colors.black,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(999),
                                    ),
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 32,
                                      vertical: 14,
                                    ),
                                  ),
                                  child: _loading
                                      ? const SizedBox(
                                          height: 18,
                                          width: 18,
                                          child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                          ),
                                        )
                                      : const Text('Create account'),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ).animate().fadeIn(duration: 600.ms).moveY(
                            begin: 20,
                            end: 0,
                            curve: Curves.easeOut,
                          ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class AdminLoginScreen extends StatelessWidget {
  const AdminLoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Text('Admin login – TODO: implement with role=admin'),
      ),
    );
  }
}

