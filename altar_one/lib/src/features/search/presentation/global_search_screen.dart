import 'dart:async';

import 'package:flutter/material.dart';

class GlobalSearchScreen extends StatefulWidget {
  const GlobalSearchScreen({super.key});

  @override
  State<GlobalSearchScreen> createState() => _GlobalSearchScreenState();
}

class _GlobalSearchScreenState extends State<GlobalSearchScreen> {
  final TextEditingController _controller = TextEditingController();
  Timer? _debounce;
  String _scope = 'songs';
  bool _loading = false;

  @override
  void dispose() {
    _controller.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  void _onChanged(String value) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), () async {
      if (value.isEmpty) return;
      setState(() => _loading = true);
      try {
        // TODO: call GET /api/search?q=...&scope=...&parish_id=...
        await Future<void>.delayed(const Duration(milliseconds: 500));
      } finally {
        if (mounted) setState(() => _loading = false);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Search'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                TextField(
                  controller: _controller,
                  onChanged: _onChanged,
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.search_rounded),
                    suffixIcon: _loading
                        ? const Padding(
                            padding: EdgeInsets.all(8.0),
                            child: SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            ),
                          )
                        : IconButton(
                            icon: const Icon(Icons.mic_none_rounded),
                            onPressed: () {
                              // TODO: voice search permission + input
                            },
                          ),
                    hintText: 'Search songs, readings, prayers...',
                  ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: [
                    _ScopeChip(
                      label: 'Songs',
                      selected: _scope == 'songs',
                      onTap: () => setState(() => _scope = 'songs'),
                    ),
                    _ScopeChip(
                      label: 'Readings',
                      selected: _scope == 'readings',
                      onTap: () => setState(() => _scope = 'readings'),
                    ),
                    _ScopeChip(
                      label: 'Prayers',
                      selected: _scope == 'prayers',
                      onTap: () => setState(() => _scope = 'prayers'),
                    ),
                    _ScopeChip(
                      label: 'Announcements',
                      selected: _scope == 'announcements',
                      onTap: () => setState(() => _scope = 'announcements'),
                    ),
                    _ScopeChip(
                      label: 'Groups',
                      selected: _scope == 'groups',
                      onTap: () => setState(() => _scope = 'groups'),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: ListView.builder(
              itemCount: 5,
              itemBuilder: (context, index) {
                return ListTile(
                  title: Text('Result ${index + 1}'),
                  subtitle: const Text('Matching text with highlighted keyword'),
                  onTap: () {
                    // TODO: open the correct detail screen based on result type
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

class _ScopeChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _ScopeChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ChoiceChip(
      label: Text(label),
      selected: selected,
      onSelected: (_) => onTap(),
    );
  }
}


