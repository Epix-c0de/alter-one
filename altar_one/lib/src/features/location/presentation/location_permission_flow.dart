import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class LocationPermissionDialog extends StatelessWidget {
  const LocationPermissionDialog({super.key});

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Allow location access?'),
      content: const Text(
        'To auto‑assign your parish and show local content, we need access to your device location. '
        'Your location will only be used to assign your local church and will not be shared.',
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(false),
          child: const Text('Ask me later'),
        ),
        FilledButton(
          onPressed: () => Navigator.of(context).pop(true),
          child: const Text('Allow'),
        ),
      ],
    );
  }
}

class LocationResolvingScreen extends StatelessWidget {
  const LocationResolvingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // TODO: request permission, get lat/lon, call POST /api/location/resolve
    Future<void>.microtask(() async {
      await Future<void>.delayed(const Duration(seconds: 2));
      if (!context.mounted) return;
      showDialog<void>(
        context: context,
        builder: (_) => AlertDialog(
          title: const Text('Parish detected'),
          content: const Text(
            'We detected Holy Trinity Parish, St. Mary\'s Local Church. Use this parish?',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel'),
            ),
            FilledButton(
              onPressed: () {
                Navigator.of(context).pop();
                context.go('/');
              },
              child: const Text('Confirm'),
            ),
          ],
        ),
      );
    });

    return const Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 16),
            Text('Detecting nearest parish...'),
          ],
        ),
      ),
    );
  }
}


