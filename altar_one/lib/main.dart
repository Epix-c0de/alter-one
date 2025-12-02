import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'src/app.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // TODO: Replace with your real Supabase credentials
  const supabaseUrl = String.fromEnvironment('SUPABASE_URL', defaultValue: 'https://YOUR-PROJECT.supabase.co');
  const supabaseAnonKey = String.fromEnvironment('SUPABASE_ANON_KEY', defaultValue: 'YOUR-ANON-KEY');

  await Supabase.initialize(
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    // authOptions: const FlutterAuthClientOptions(autoRefreshToken: true),
  );

  runApp(const AltarOneApp());
}


