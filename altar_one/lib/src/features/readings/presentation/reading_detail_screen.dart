import 'package:flutter/material.dart';

class ReadingDetailScreen extends StatelessWidget {
  final String readingId;

  const ReadingDetailScreen({super.key, required this.readingId});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    // TODO: GET /api/readings/{id}
    return Scaffold(
      appBar: AppBar(
        title: const Text('Reading'),
        actions: [
          IconButton(
            icon: const Icon(Icons.copy_rounded),
            onPressed: () {
              // TODO: copy text
            },
          ),
          IconButton(
            icon: const Icon(Icons.share_rounded),
            onPressed: () {
              // TODO: share text
            },
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Title of the Day',
              style:
                  theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            const Text('Lectionary Cycle A · 2025-01-01'),
            const SizedBox(height: 16),
            Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.text_decrease_rounded),
                  onPressed: () {
                    // TODO: smaller font
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.text_increase_rounded),
                  onPressed: () {
                    // TODO: larger font
                  },
                ),
              ],
            ),
            const SizedBox(height: 16),
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
                    Text('First reading text...'),
                    SizedBox(height: 16),
                    Text(
                      'Responsorial Psalm',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 8),
                    Text('Psalm text...'),
                    SizedBox(height: 16),
                    Text(
                      'Gospel',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 8),
                    Text('Gospel text...'),
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


