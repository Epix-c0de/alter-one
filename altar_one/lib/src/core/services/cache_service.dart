import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class CacheService {
  static const String _prefix = 'altar_one_cache_';
  static const String _ttlPrefix = 'altar_one_ttl_';
  static const int _defaultTtlHours = 24;

  static Future<void> set(String key, dynamic value, {int? ttlHours}) async {
    final prefs = await SharedPreferences.getInstance();
    final jsonValue = jsonEncode(value);
    await prefs.setString('$_prefix$key', jsonValue);
    
    if (ttlHours != null) {
      final expiry = DateTime.now().add(Duration(hours: ttlHours));
      await prefs.setString('$_ttlPrefix$key', expiry.toIso8601String());
    }
  }

  static Future<T?> get<T>(String key) async {
    final prefs = await SharedPreferences.getInstance();
    
    // Check TTL
    final ttlStr = prefs.getString('$_ttlPrefix$key');
    if (ttlStr != null) {
      final expiry = DateTime.parse(ttlStr);
      if (DateTime.now().isAfter(expiry)) {
        await remove(key);
        return null;
      }
    }
    
    final jsonStr = prefs.getString('$_prefix$key');
    if (jsonStr == null) return null;
    
    try {
      return jsonDecode(jsonStr) as T;
    } catch (e) {
      return null;
    }
  }

  static Future<void> remove(String key) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('$_prefix$key');
    await prefs.remove('$_ttlPrefix$key');
  }

  static Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    final keys = prefs.getKeys();
    for (final key in keys) {
      if (key.startsWith(_prefix) || key.startsWith(_ttlPrefix)) {
        await prefs.remove(key);
      }
    }
  }
}

