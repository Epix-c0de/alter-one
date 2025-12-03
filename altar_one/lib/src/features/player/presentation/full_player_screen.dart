import 'package:flutter/material.dart';

class FullPlayerScreen extends StatelessWidget {
  final String title;

  const FullPlayerScreen({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Now Playing'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Container(
              width: 220,
              height: 220,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(24),
                color: theme.colorScheme.primary.withOpacity(0.2),
              ),
              child: const Icon(Icons.music_note_rounded, size: 64),
            ),
            const SizedBox(height: 16),
            Text(
              title,
              style: theme.textTheme.titleLarge
                  ?.copyWith(fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            const Text('Choir / Artist'),
            const SizedBox(height: 24),
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
              child: const Center(child: Text('Waveform animation – TODO')),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(
                  icon: const Icon(Icons.skip_previous_rounded),
                  onPressed: () {
                    // TODO: previous in queue
                  },
                ),
                FilledButton(
                  onPressed: () {
                    // TODO: play/pause
                  },
                  child: const Icon(Icons.play_arrow_rounded),
                ),
                IconButton(
                  icon: const Icon(Icons.skip_next_rounded),
                  onPressed: () {
                    // TODO: next in queue
                  },
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(
                  icon: const Icon(Icons.loop_rounded),
                  onPressed: () {
                    // TODO: loop
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.shuffle_rounded),
                  onPressed: () {
                    // TODO: shuffle
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.queue_music_rounded),
                  onPressed: () {
                    // TODO: open queue
                  },
                ),
              ],
            ),
            const SizedBox(height: 16),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton.icon(
                onPressed: () {
                  // TODO: open on YouTube
                },
                icon: const Icon(Icons.open_in_new_rounded),
                label: const Text('Open on YouTube'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}


