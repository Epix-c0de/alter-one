import 'package:flutter/material.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Wrap(
              spacing: 8,
              children: const [
                _FilterChip(label: 'Announcements'),
                _FilterChip(label: 'Livestream'),
                _FilterChip(label: 'Payments'),
                _FilterChip(label: 'Group mentions'),
              ],
            ),
          ),
          SwitchListTile(
            value: false,
            onChanged: (_) {
              // TODO: mute parish toggle
            },
            title: const Text('Mute parish'),
            subtitle: const Text('Mute all but critical messages.'),
          ),
          ListTile(
            title: const Text('Do Not Disturb'),
            subtitle: const Text('22:00 – 06:00'),
            onTap: () {
              // TODO: open DND scheduling UI
            },
          ),
          const Divider(),
          Expanded(
            child: ListView.builder(
              itemCount: 10,
              itemBuilder: (context, index) {
                return ListTile(
                  title: Text('Notification ${index + 1}'),
                  subtitle: const Text('Tap to open related content'),
                  trailing: Icon(
                    Icons.circle,
                    size: 10,
                    color: theme.colorScheme.primary,
                  ),
                  onTap: () {
                    // TODO: navigate based on notification payload
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;

  const _FilterChip({required this.label});

  @override
  Widget build(BuildContext context) {
    return FilterChip(
      label: Text(label),
      selected: true,
      onSelected: (_) {
        // TODO: filter notifications
      },
    );
  }
}


