import 'package:flutter/material.dart';

class MiniPlayer extends StatelessWidget {
  final String title;
  final bool isPlaying;
  final VoidCallback onPlayPause;
  final VoidCallback onOpen;

  const MiniPlayer({
    super.key,
    required this.title,
    required this.isPlaying,
    required this.onPlayPause,
    required this.onOpen,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SafeArea(
      child: Container(
        margin: const EdgeInsets.all(12),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface.withOpacity(0.92),
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              blurRadius: 12,
              color: Colors.black.withOpacity(0.2),
            ),
          ],
        ),
        child: Row(
          children: [
            IconButton(
              icon: Icon(isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded),
              onPressed: onPlayPause,
            ),
            Expanded(
              child: Text(
                title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            IconButton(
              icon: const Icon(Icons.open_in_full_rounded),
              onPressed: onOpen,
            ),
          ],
        ),
      ),
    );
  }
}


