import 'package:flutter/material.dart';

class SongDetailScreen extends StatelessWidget {
  final String songId;

  const SongDetailScreen({super.key, required this.songId});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    // TODO: fetch song via GET /api/songs/{id}
    return Scaffold(
      appBar: AppBar(
        title: const Text('Song'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    color: theme.colorScheme.primary.withOpacity(0.1),
                  ),
                  child: const Icon(Icons.music_note_rounded, size: 32),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        'Song title',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      SizedBox(height: 4),
                      Text('Choir / Artist'),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                ElevatedButton.icon(
                  onPressed: () {
                    // TODO: YouTube/audio playback
                  },
                  icon: const Icon(Icons.play_arrow_rounded),
                  label: const Text('Play'),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.favorite_border_rounded),
                  onPressed: () {
                    // TODO: add to favorites
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.share_rounded),
                  onPressed: () {
                    // TODO: deep link + QR share
                  },
                ),
              ],
            ),
            const SizedBox(height: 16),
            SwitchListTile(
              value: false,
              onChanged: (_) {
                // TODO: toggle chords view if available
              },
              title: const Text('Show chords'),
            ),
            const SizedBox(height: 16),
            Text(
              'Lyrics',
              style: theme.textTheme.titleMedium
                  ?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'Lyrics go here. If none available, show "No lyrics available — request to admin".',
            ),
            const SizedBox(height: 24),
            ListTile(
              leading: const Icon(Icons.flag_outlined),
              title: const Text('Report issue'),
              subtitle: const Text('Copyright dispute or incorrect lyrics.'),
              onTap: () {
                // TODO: open report form
              },
            ),
            ListTile(
              leading: const Icon(Icons.download_for_offline_rounded),
              title: const Text('Request offline for this song'),
              subtitle: const Text(
                'Disabled unless admin allowed offline download for this song.',
              ),
              enabled: false,
            ),
          ],
        ),
      ),
    );
  }
}


