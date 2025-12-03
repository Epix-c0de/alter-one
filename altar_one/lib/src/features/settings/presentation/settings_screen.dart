import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: ListView(
        children: [
          const ListTile(
            title: Text('Account'),
          ),
          ListTile(
            title: const Text('Name, email, phone'),
            subtitle: const Text('Update your profile details'),
            onTap: () {
              // TODO: open profile edit page
            },
          ),
          ListTile(
            title: const Text('Change password'),
            onTap: () {
              // TODO: open change password flow
            },
          ),
          const Divider(),
          const ListTile(
            title: Text('Subscription'),
          ),
          ListTile(
            title: const Text('Manage subscription'),
            subtitle: const Text('View trial and payments'),
            onTap: () => context.go('/subscription/paywall'),
          ),
          const Divider(),
          const ListTile(
            title: Text('Notifications'),
          ),
          SwitchListTile(
            value: true,
            onChanged: (_) {
              // TODO: toggle notifications
            },
            title: const Text('Parish announcements'),
          ),
          SwitchListTile(
            value: true,
            onChanged: (_) {},
            title: const Text('Livestream alerts'),
          ),
          const Divider(),
          const ListTile(
            title: Text('Privacy'),
          ),
          SwitchListTile(
            value: true,
            onChanged: (_) {},
            title: const Text('Allow location for auto-assign'),
            subtitle: const Text(
              'If disabled, you will need to select parish manually.',
            ),
          ),
          SwitchListTile(
            value: true,
            onChanged: (_) {},
            title: const Text('Allow anonymous analytics'),
          ),
          const Divider(),
          const ListTile(
            title: Text('Language'),
          ),
          ListTile(
            title: const Text('Language'),
            subtitle: const Text('English / Kiswahili'),
            onTap: () {
              // TODO: open language selector dialog
            },
          ),
          const Divider(),
          const ListTile(
            title: Text('Theme'),
          ),
          ListTile(
            title: const Text('Theme mode'),
            subtitle: const Text('Light / Dark / Follow Master Theme'),
            onTap: () {
              // TODO: hook into appThemeProvider
            },
          ),
          SwitchListTile(
            value: true,
            onChanged: (_) {},
            title: const Text('Use Master Theme'),
            subtitle: const Text(
              'Override device theme with parish master theme when set.',
            ),
          ),
          const Divider(),
          const ListTile(
            title: Text('About'),
          ),
          ListTile(
            title: const Text('Version'),
            subtitle: Text(
              '0.1.0',
              style: theme.textTheme.bodyMedium,
            ),
          ),
          ListTile(
            title: const Text('Terms & Privacy'),
            onTap: () {
              // TODO: open terms/privacy page or webview
            },
          ),
          ListTile(
            title: const Text('Contact support'),
            subtitle:
                const Text('In-app chat or email to parish/master admins.'),
            onTap: () {
              // TODO: open support chat / compose email
            },
          ),
          const Divider(),
          ListTile(
            title: const Text('Delete account'),
            textColor: theme.colorScheme.error,
            iconColor: theme.colorScheme.error,
            trailing: const Icon(Icons.delete_forever_rounded),
            onTap: () async {
              final confirmed = await showDialog<bool>(
                context: context,
                builder: (_) => AlertDialog(
                  title: const Text('Delete account?'),
                  content: const Text(
                    'This action will request deletion of your account. An admin may need to approve it.',
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.of(context).pop(false),
                      child: const Text('Cancel'),
                    ),
                    TextButton(
                      onPressed: () => Navigator.of(context).pop(true),
                      child: const Text('Request delete'),
                    ),
                  ],
                ),
              );
              if (confirmed == true) {
                // TODO: POST /api/users/{id}/request-delete
              }
            },
          ),
        ],
      ),
    );
  }
}


