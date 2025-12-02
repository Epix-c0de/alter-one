import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> with SingleTickerProviderStateMixin {
  late final TabController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TabController(length: 6, vsync: this);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin dashboard'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.go('/'),
        ),
        bottom: TabBar(
          controller: _controller,
          isScrollable: true,
          tabs: const [
            Tab(text: 'Content'),
            Tab(text: 'AI tools'),
            Tab(text: 'Theme'),
            Tab(text: 'Parish'),
            Tab(text: 'Livestream'),
            Tab(text: 'Analytics'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _controller,
        children: const [
          _ContentTab(),
          _AiToolsTab(),
          _ThemeTab(),
          _ParishSettingsTab(),
          _LivestreamTab(),
          _AnalyticsTab(),
        ],
      ),
      backgroundColor: theme.scaffoldBackgroundColor,
    );
  }
}

class _ContentTab extends StatelessWidget {
  const _ContentTab();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: const [
        _AdminTile(title: 'Songs', subtitle: 'Upload, edit, remove parish songs'),
        _AdminTile(title: 'Readings', subtitle: 'Manage Sunday and weekday readings'),
        _AdminTile(title: 'Prayers', subtitle: 'Create and categorize prayers'),
        _AdminTile(title: 'Announcements', subtitle: 'Schedule parish announcements'),
        _AdminTile(title: 'Events', subtitle: 'Create parish events and ticketing'),
        _AdminTile(title: 'Chat moderation', subtitle: 'Mute / remove users, pin messages'),
      ],
    );
  }
}

class _AiToolsTab extends StatelessWidget {
  const _AiToolsTab();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: const [
        _AdminTile(
          title: 'AI Song OCR',
          subtitle: 'Upload hymn sheet images – Edge Function extracts and saves lyrics.',
        ),
        _AdminTile(
          title: 'AI YouTube song importer',
          subtitle: 'Sync parish YouTube playlists into the Songs module.',
        ),
        _AdminTile(
          title: 'AI reading formatter',
          subtitle: 'Upload text or PDF – AI cleans into liturgical structure.',
        ),
        _AdminTile(
          title: 'AI prayer generator',
          subtitle: 'Enter a theme – AI drafts prayers for review.',
        ),
        _AdminTile(
          title: 'AI announcement assistant',
          subtitle: 'Enter topic / date / type – AI suggests announcement copy.',
        ),
      ],
    );
  }
}

class _ThemeTab extends StatelessWidget {
  const _ThemeTab();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: const [
        _AdminTile(title: 'Primary color', subtitle: 'Change primary accent for this parish'),
        _AdminTile(title: 'Dark / light mode', subtitle: 'Preferred theme for parish users'),
        _AdminTile(title: 'Splash media', subtitle: 'Upload intro image or video'),
        _AdminTile(title: 'Logo & branding', subtitle: 'Parish logo, title, and tagline'),
      ],
    );
  }
}

class _ParishSettingsTab extends StatelessWidget {
  const _ParishSettingsTab();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: const [
        _AdminTile(title: 'Parish profile', subtitle: 'Name, location, metadata'),
        _AdminTile(title: 'Admins', subtitle: 'Assign additional parish admins'),
        _AdminTile(title: 'Backup & export', subtitle: 'Export parish data as CSV/JSON'),
        _AdminTile(title: 'Backend config', subtitle: 'AI OCR mode, auto-approval, feature flags'),
      ],
    );
  }
}

class _LivestreamTab extends StatelessWidget {
  const _LivestreamTab();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: const [
        _AdminTile(title: 'Livestream URLs', subtitle: 'YouTube, Facebook, Vimeo, RTMP'),
        _AdminTile(title: 'Preferred source', subtitle: 'Choose primary livestream provider'),
        _AdminTile(title: 'Event integration', subtitle: 'Map events to livestreams'),
      ],
    );
  }
}

class _AnalyticsTab extends StatelessWidget {
  const _AnalyticsTab();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: const [
        _AdminTile(title: 'Active users', subtitle: 'View active parish members'),
        _AdminTile(title: 'Subscriptions', subtitle: 'Trial vs paid, revenue overview'),
        _AdminTile(title: 'Engagement', subtitle: 'Most-used modules and livestream stats'),
      ],
    );
  }
}

class _AdminTile extends StatelessWidget {
  final String title;
  final String subtitle;

  const _AdminTile({required this.title, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        title: Text(title, style: theme.textTheme.titleMedium),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.chevron_right_rounded),
        onTap: () {
          // TODO: navigate to detailed management screens
        },
      ),
    );
  }
}


