import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final appThemeProvider = StateNotifierProvider<AppThemeController, AppThemeState>(
  (ref) => AppThemeController(),
);

class AppThemeState {
  final ThemeMode mode;
  final ThemeData lightTheme;
  final ThemeData darkTheme;

  const AppThemeState({
    required this.mode,
    required this.lightTheme,
    required this.darkTheme,
  });
}

class AppThemeController extends StateNotifier<AppThemeState> {
  AppThemeController()
      : super(
          AppThemeState(
            mode: ThemeMode.system,
            lightTheme: _buildLightTheme(),
            darkTheme: _buildDarkTheme(),
          ),
        );

  void setMode(ThemeMode mode) {
    state = AppThemeState(
      mode: mode,
      lightTheme: state.lightTheme,
      darkTheme: state.darkTheme,
    );
  }

  // Later we can load theme overrides per parish from Supabase `themes` table.
  void applyRemoteThemeOverrides({
    required Color primary,
    required Color accent,
    required bool dark,
  }) {
    state = AppThemeState(
      mode: dark ? ThemeMode.dark : ThemeMode.light,
      lightTheme: _buildLightTheme(primary: primary, accent: accent),
      darkTheme: _buildDarkTheme(primary: primary, accent: accent),
    );
  }
}

ThemeData _buildLightTheme({Color? primary, Color? accent}) {
  final base = ThemeData.light();
  final primaryColor = primary ?? const Color(0xFF5B8DEF);
  final accentColor = accent ?? const Color(0xFF8E54E9);

  return base.copyWith(
    colorScheme: ColorScheme.fromSeed(seedColor: primaryColor, brightness: Brightness.light),
    scaffoldBackgroundColor: const Color(0xFFF5F7FB),
    appBarTheme: const AppBarTheme(
      elevation: 0,
      backgroundColor: Colors.transparent,
      foregroundColor: Colors.black87,
    ),
    cardTheme: CardTheme(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      color: Colors.white.withOpacity(0.12),
      elevation: 0,
    ),
    useMaterial3: true,
  );
}

ThemeData _buildDarkTheme({Color? primary, Color? accent}) {
  final base = ThemeData.dark();
  final primaryColor = primary ?? const Color(0xFF5B8DEF);
  final accentColor = accent ?? const Color(0xFF8E54E9);

  return base.copyWith(
    colorScheme: ColorScheme.fromSeed(seedColor: primaryColor, brightness: Brightness.dark),
    scaffoldBackgroundColor: const Color(0xFF050816),
    appBarTheme: const AppBarTheme(
      elevation: 0,
      backgroundColor: Colors.transparent,
      foregroundColor: Colors.white,
    ),
    cardTheme: CardTheme(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      color: Colors.white.withOpacity(0.08),
      elevation: 0,
    ),
    useMaterial3: true,
  );
}


