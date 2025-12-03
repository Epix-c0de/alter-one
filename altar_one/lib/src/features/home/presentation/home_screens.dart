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
        context.go('/prayers');
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
              _NavItem(icon: Icons.music_note_rounded, label: 'Music', index: 1, currentIndex: _index, onTap: _onTap),
              _NavItem(icon: Icons.live_tv_rounded, label: 'Livestream', index: 2, currentIndex: _index, onTap: _onTap),
              _NavItem(icon: Icons.menu_book_rounded, label: 'Prayers', index: 3, currentIndex: _index, onTap: _onTap),
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
    final colorScheme = theme.colorScheme;
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              GlassmorphicContainer(
                width: double.infinity,
                height: 150,
                borderRadius: 28,
                blur: 20,
                border: 1,
                linearGradient: LinearGradient(
                  colors: [
                    Colors.white.withOpacity(0.18),
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
                child: Padding(
                  padding: const EdgeInsets.all(16),
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
                                'St. Mary\'s Local Church',
                                style: theme.textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Holy Trinity Parish · Nairobi Archdiocese',
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: Colors.white70,
                                ),
                              ),
                            ],
                          ),
                          IconButton(
                            onPressed: () => context.go('/parish/select'),
                            icon: const Icon(
                              Icons.church_rounded,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                      const Spacer(),
                      Row(
                        children: [
                          Container(
                            width: 28,
                            height: 28,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: LinearGradient(
                                colors: [
                                  colorScheme.primary,
                                  colorScheme.secondary,
                                ],
                              ),
                            ),
                            child: const Icon(
                              Icons.church_outlined,
                              color: Colors.white,
                              size: 18,
                            ),
                          ).animate().scale(
                                duration: 1200.ms,
                                begin: const Offset(0.9, 0.9),
                                end: const Offset(1, 1),
                              ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: SizedBox(
                              height: 20,
                              child: Marquee(
                                text:
                                    'Next: Youth Mass – Sunday 9:00 AM · Family Rosary every Friday at 7:00 PM · Catechism classes every Saturday 10:00 AM',
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: Colors.white70,
                                ),
                              ),
                            ),
                          ),
                        ],
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
                    _HomeTile(
                      icon: Icons.menu_book_rounded,
                      label: 'Daily Readings',
                      route: '/readings',
                    ),
                    _HomeTile(
                      icon: Icons.library_music_rounded,
                      label: 'Sunday Hymns',
                      route: '/hymns',
                    ),
                    _HomeTile(
                      icon: Icons.record_voice_over_rounded,
                      label: 'Mass Responses',
                      route: '/mass-responses',
                    ),
                    _HomeTile(
                      icon: Icons.favorite_rounded,
                      label: 'Prayers',
                      route: '/prayers',
                    ),
                    _HomeTile(
                      icon: Icons.live_tv_rounded,
                      label: 'Livestream',
                      route: '/livestream',
                    ),
                    _HomeTile(
                      icon: Icons.music_note_rounded,
                      label: 'Songs Player',
                      route: '/songs',
                    ),
                    _HomeTile(
                      icon: Icons.notifications_active_rounded,
                      label: 'Announcements',
                      route: '/announcements',
                    ),
                    _HomeTile(
                      icon: Icons.forum_rounded,
                      label: 'Groups / Chat',
                      route: '/chat',
                    ),
                    _HomeTile(
                      icon: Icons.palette_rounded,
                      label: 'Theme',
                      route: '/profile',
                    ),
                    _HomeTile(
                      icon: Icons.badge_rounded,
                      label: 'Local Church ID',
                      route: '/local-church-id-request',
                    ),
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
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Songs Player'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Playlists',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Expanded(
              child: ListView(
                children: const [
                  _PlaylistTile(title: 'Parish Songs'),
                  _PlaylistTile(title: 'Archdiocese Songs'),
                  _PlaylistTile(title: 'Universal Church Songs'),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Container(
              height: 80,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(24),
                gradient: LinearGradient(
                  colors: [
                    theme.colorScheme.primary.withOpacity(0.3),
                    theme.colorScheme.secondary.withOpacity(0.4),
                  ],
                ),
              ),
              child: const Center(
                child: Text('Waveform & lyrics sync – TODO (Supabase audio)'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PlaylistTile extends StatelessWidget {
  final String title;

  const _PlaylistTile({required this.title});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        title: Text(title),
        subtitle: const Text('Tap to open playlist'),
        onTap: () {
          // TODO: load playlist songs from Supabase
        },
      ),
    );
  }
}

class ReadingsScreen extends StatelessWidget {
  const ReadingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Daily Readings'),
        actions: [
          IconButton(
            onPressed: () {
              // TODO: share reading
            },
            icon: const Icon(Icons.share_rounded),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  'Today',
                  style: theme.textTheme.titleMedium
                      ?.copyWith(fontWeight: FontWeight.bold),
                ),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.text_increase_rounded),
                  onPressed: () {
                    // TODO: text size increase
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.brightness_4_rounded),
                  onPressed: () {
                    // TODO: toggle dark/light
                  },
                ),
              ],
            ),
            const SizedBox(height: 8),
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text(
                      'First Reading',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Reading content loaded from parish_readings – TODO (Supabase).',
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class PrayersScreen extends StatelessWidget {
  const PrayersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Prayers'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            'Holy Rosary',
            style: theme.textTheme.titleMedium
                ?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Card(
            child: ListTile(
              title: const Text('Start Rosary'),
              subtitle: const Text('Bead‑by‑bead guided animation – TODO'),
              onTap: () {
                // TODO: open rosary flow
              },
            ),
          ),
          const SizedBox(height: 16),
          const ListTile(
            title: Text('Divine Mercy Chaplet'),
          ),
          const ListTile(
            title: Text('St. Michael Prayer'),
          ),
          const ListTile(
            title: Text('Morning & Evening Prayers'),
          ),
          const ListTile(
            title: Text('Novenas'),
          ),
          const ListTile(
            title: Text('Litany Playlists'),
          ),
          const ListTile(
            title: Text('Custom Parish Prayers'),
          ),
        ],
      ),
    );
  }
}

class LivestreamScreen extends StatelessWidget {
  const LivestreamScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Livestream'),
      ),
      body: Column(
        children: [
          AspectRatio(
            aspectRatio: 16 / 9,
            child: Container(
              color: Colors.black,
              child: const Center(
                child: Text(
                  'Parish livestream player – TODO (Supabase videos)',
                  style: TextStyle(color: Colors.white),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.fiber_manual_record_rounded,
                  color: theme.colorScheme.error, size: 16),
              const SizedBox(width: 4),
              const Text('Live status · parish only'),
            ],
          ),
          const Divider(),
          const Expanded(
            child: Center(
              child: Text('Live chat – parish only – TODO (Supabase realtime)'),
            ),
          ),
        ],
      ),
    );
  }
}

class AnnouncementsScreen extends StatelessWidget {
  const AnnouncementsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Announcements'),
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemBuilder: (context, index) {
          return ListTile(
            title: Text('Announcement ${index + 1}'),
            subtitle: const Text(
              'Parish‑scoped content loaded from Supabase – offline cached.',
            ),
            trailing: index == 0
                ? Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Text(
                      'Pinned',
                      style: TextStyle(
                        color: theme.colorScheme.primary,
                        fontSize: 11,
                      ),
                    ),
                  )
                : null,
          );
        },
        separatorBuilder: (_, __) => const Divider(),
        itemCount: 10,
      ),
    );
  }
}

class HymnsScreen extends StatelessWidget {
  const HymnsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Sunday Hymns'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              decoration: const InputDecoration(
                prefixIcon: Icon(Icons.search_rounded),
                hintText: 'Search lyrics...',
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: ListView(
                children: [
                  Text(
                    'Entrada',
                    style: theme.textTheme.titleMedium
                        ?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const ListTile(
                    title: Text('Entrance Hymn'),
                    subtitle: Text(
                      'Lyrics loaded from parish hymns table – OCR generated – TODO.',
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Gloria',
                    style: theme.textTheme.titleMedium
                        ?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const ListTile(
                    title: Text('Gloria Hymn'),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Responsorial Psalm',
                    style: theme.textTheme.titleMedium
                        ?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  const ListTile(
                    title: Text('Psalm Response'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class MassResponsesScreen extends StatelessWidget {
  const MassResponsesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Mass Responses'),
          bottom: const TabBar(
            tabs: [
              Tab(text: 'English'),
              Tab(text: 'Kiswahili'),
            ],
          ),
        ),
        body: const TabBarView(
          children: [
            _MassResponsesTab(language: 'English'),
            _MassResponsesTab(language: 'Kiswahili'),
          ],
        ),
      ),
    );
  }
}

class _MassResponsesTab extends StatelessWidget {
  final String language;

  const _MassResponsesTab({required this.language});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(8.0),
          child: TextField(
            decoration: InputDecoration(
              prefixIcon: const Icon(Icons.search_rounded),
              hintText: 'Search $language responses...',
            ),
          ),
        ),
        Expanded(
          child: ListView(
            children: const [
              ExpansionTile(
                title: Text('Introductory Rites'),
                children: [
                  ListTile(
                    title: Text('The Lord be with you...'),
                  ),
                ],
              ),
              ExpansionTile(
                title: Text('Liturgy of the Word'),
                children: [
                  ListTile(
                    title: Text('The Word of the Lord...'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class ChatScreen extends StatelessWidget {
  const ChatScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Groups / Community Chat'),
      ),
      body: Column(
        children: [
          const ListTile(
            leading: CircleAvatar(child: Icon(Icons.group_rounded)),
            title: Text('My Local Church Group'),
            subtitle: Text('WhatsApp‑style group for your local church.'),
          ),
          const ListTile(
            leading: CircleAvatar(child: Icon(Icons.group_work_rounded)),
            title: Text('Parish Global Group'),
            subtitle: Text('Parish‑wide announcements and fellowship.'),
          ),
          const Divider(),
          const Expanded(
            child: Center(
              child: Text('Realtime messages, typing, receipts – TODO'),
            ),
          ),
        ],
      ),
    );
  }
}

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Row(
            children: [
              const CircleAvatar(
                radius: 32,
                child: Icon(Icons.person_rounded, size: 32),
              ),
              const SizedBox(width: 16),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text('User Name'),
                  SizedBox(height: 4),
                  Text('user@example.com'),
                ],
              ),
            ],
          ),
          const SizedBox(height: 24),
          ListTile(
            title: const Text('Parish'),
            subtitle: const Text('Holy Trinity Parish'),
            trailing: const Icon(Icons.chevron_right_rounded),
            onTap: () {
              // maybe open parish selector
            },
          ),
          const ListTile(
            title: Text('Local Church'),
            subtitle: Text('St. Mary\'s Local Church'),
          ),
          const Divider(),
          const ListTile(
            title: Text('Subscription status'),
            subtitle: Text('Trial – 7 days remaining'),
          ),
          ListTile(
            title: const Text('Change theme'),
            subtitle:
                const Text('User‑level theme customization (local only).'),
            trailing: const Icon(Icons.palette_rounded),
            onTap: () {
              // TODO: integrate with appThemeProvider
            },
          ),
          const Divider(),
          ListTile(
            title: const Text('Change password'),
            trailing: const Icon(Icons.chevron_right_rounded),
            onTap: () {
              // TODO: password flow
            },
          ),
          ListTile(
            title: const Text('Log out'),
            trailing: const Icon(Icons.logout_rounded),
            onTap: () {
              // TODO: Supabase sign out
            },
          ),
          ListTile(
            title: const Text('Delete account'),
            trailing: const Icon(Icons.delete_forever_rounded),
            onTap: () {
              // TODO: account deletion confirmation
            },
          ),
          ListTile(
            title: const Text('Support'),
            subtitle: const Text('Contact support or open help center.'),
            trailing: const Icon(Icons.support_agent_rounded),
            onTap: () {
              // TODO: support flow
            },
          ),
        ],
      ),
    );
  }
}

class LocalChurchIdRequestScreen extends StatelessWidget {
  const LocalChurchIdRequestScreen({super.key});

  Future<void> _requestId(BuildContext context) async {
    // TODO: Call Supabase RPC to notify junior admin bot
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Request sent to your Local Church Admin.')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Request Local Church ID'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.badge_rounded,
                size: 56,
                color: theme.colorScheme.primary,
              ),
              const SizedBox(height: 16),
              const Text(
                'Request your Local Church ID from your Local Church Administrator.',
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: () => _requestId(context),
                child: const Text('Request ID'),
              ),
              const SizedBox(height: 16),
              const Text('Status: Pending / Approved / Rejected (TODO)'),
            ],
          ),
        ),
      ),
    );
  }
}

class Marquee extends StatefulWidget {
  final String text;
  final TextStyle? style;
  final double velocity;

  const Marquee({
    super.key,
    required this.text,
    this.style,
    this.velocity = 40,
  });

  @override
  State<Marquee> createState() => _MarqueeState();
}

class _MarqueeState extends State<Marquee>
    with SingleTickerProviderStateMixin {
  late final ScrollController _controller;
  late final AnimationController _animController;

  @override
  void initState() {
    super.initState();
    _controller = ScrollController();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 20),
    )..addStatusListener((status) {
        if (status == AnimationStatus.completed) {
          _animController.repeat();
        }
      });
    _animController.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      controller: _controller,
      scrollDirection: Axis.horizontal,
      physics: const NeverScrollableScrollPhysics(),
      children: [
        Center(
          child: Text(
            widget.text,
            style: widget.style,
          ),
        ),
      ],
    );
  }
}



