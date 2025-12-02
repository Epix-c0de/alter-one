import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:glassmorphism/glassmorphism.dart';
import 'package:go_router/go_router.dart';

class HomeShellScreen extends StatefulWidget {
  final Widget child;
  const HomeShellScreen({required this.child, super.key});

  @override
  State<HomeShellScreen> createState() => _HomeShellScreenState();
}

class _HomeShellScreenState extends State<HomeShellScreen> {
  int _index = 0;

  void _onTap(int index) {
    setState(() => _index = index);
    switch (index) {
      case 0:
        context.go('/');
        break;
      case 1:
        context.go('/songs');
        break;
      case 2:
        context.go('/livestream');
        break;
      case 3:
        context.go('/chat');
        break;
      case 4:
        context.go('/profile');
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true,
      body: widget.child,
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        child: GlassmorphicContainer(
          width: double.infinity,
          height: 72,
          borderRadius: 40,
          blur: 18,
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
              Colors.white.withOpacity(0.5),
              Colors.transparent,
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _NavItem(icon: Icons.dashboard_rounded, label: 'Home', index: 0, currentIndex: _index, onTap: _onTap),
              _NavItem(icon: Icons.music_note_rounded, label: 'Songs', index: 1, currentIndex: _index, onTap: _onTap),
              _NavItem(icon: Icons.live_tv_rounded, label: 'Live', index: 2, currentIndex: _index, onTap: _onTap),
              _NavItem(icon: Icons.forum_rounded, label: 'Chat', index: 3, currentIndex: _index, onTap: _onTap),
              _NavItem(icon: Icons.person_rounded, label: 'Profile', index: 4, currentIndex: _index, onTap: _onTap),
            ],
          ),
        ).animate().fadeIn(duration: 600.ms).moveY(begin: 30, end: 0),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.go('/announcements'),
        icon: const Icon(Icons.notifications_active_rounded),
        label: const Text('Announcements'),
      ).animate().scale(begin: const Offset(0.8, 0.8), duration: 400.ms),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final int index;
  final int currentIndex;
  final ValueChanged<int> onTap;

  const _NavItem({
    required this.icon,
    required this.label,
    required this.index,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isActive = index == currentIndex;
    final color = isActive ? Colors.white : Colors.white70;

    return GestureDetector(
      onTap: () => onTap(index),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 220),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? Colors.white.withOpacity(0.18) : Colors.transparent,
          borderRadius: BorderRadius.circular(999),
        ),
        child: Row(
          children: [
            Icon(icon, size: 22, color: color),
            if (isActive) ...[
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(color: color, fontWeight: FontWeight.w600),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class HomeDashboardScreen extends StatelessWidget {
  const HomeDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Good evening,',
                        style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant),
                      ),
                      Text(
                        'Parish member',
                        style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  IconButton(
                    onPressed: () => context.go('/parish/select'),
                    icon: const Icon(Icons.church_rounded),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              GlassmorphicContainer(
                width: double.infinity,
                height: 120,
                borderRadius: 24,
                blur: 18,
                border: 1,
                linearGradient: LinearGradient(
                  colors: [
                    Colors.white.withOpacity(0.22),
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
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Today\'s Livestream',
                        style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Starts in 01:24:36',
                        style: theme.textTheme.bodyMedium,
                      ),
                      const Spacer(),
                      Align(
                        alignment: Alignment.bottomRight,
                        child: FilledButton.icon(
                          onPressed: () => context.go('/livestream'),
                          icon: const Icon(Icons.play_arrow_rounded),
                          label: const Text('Join'),
                        ),
                      ),
                    ],
                  ),
                ),
              ).animate().fadeIn(duration: 500.ms).moveY(begin: 10, end: 0),
              const SizedBox(height: 20),
              Expanded(
                child: GridView.count(
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  children: const [
                    _HomeTile(icon: Icons.menu_book_rounded, label: 'Readings', route: '/readings'),
                    _HomeTile(icon: Icons.favorite_rounded, label: 'Prayers', route: '/prayers'),
                    _HomeTile(icon: Icons.music_note_rounded, label: 'Songs', route: '/songs'),
                    _HomeTile(icon: Icons.event_rounded, label: 'Events', route: '/events'),
                    _HomeTile(icon: Icons.notifications_rounded, label: 'Announcements', route: '/announcements'),
                    _HomeTile(icon: Icons.palette_rounded, label: 'Theme', route: '/profile'),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _HomeTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String route;

  const _HomeTile({required this.icon, required this.label, required this.route});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.go(route),
      child: GlassmorphicContainer(
        width: double.infinity,
        height: double.infinity,
        borderRadius: 24,
        blur: 18,
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
            Colors.white.withOpacity(0.4),
            Colors.white.withOpacity(0.1),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 28, color: Colors.white),
            const SizedBox(height: 8),
            Text(
              label,
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
            ),
          ],
        ),
      ).animate().fadeIn(duration: 500.ms).scale(begin: const Offset(0.95, 0.95)),
    );
  }
}

class SongsScreen extends StatelessWidget {
  const SongsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Songs – parish-scoped list (Supabase) – TODO')),
    );
  }
}

class ReadingsScreen extends StatelessWidget {
  const ReadingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Readings – parish-scoped list – TODO')),
    );
  }
}

class PrayersScreen extends StatelessWidget {
  const PrayersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Prayers – parish-scoped list – TODO')),
    );
  }
}

class LivestreamScreen extends StatelessWidget {
  const LivestreamScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Livestream – embed parish livestream URL – TODO')),
    );
  }
}

class AnnouncementsScreen extends StatelessWidget {
  const AnnouncementsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Announcements – parish-scoped, with ticker – TODO')),
    );
  }
}

class ChatScreen extends StatelessWidget {
  const ChatScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Group chat – Supabase realtime – TODO')),
    );
  }
}

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Profile & theme selector – TODO')),
    );
  }
}


