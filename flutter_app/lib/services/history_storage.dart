/// Хранение истории через shared_preferences (аналог ТЗ).

import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../models/measurement.dart';

class HistoryStorage {
  static const _storageKey = 'smartblood.history.v1';

  /// Загружает историю; при первом запуске возвращает null —
  /// вызывающий код сеет демо-историю.
  static Future<List<Measurement>?> loadHistory() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_storageKey);
    if (raw == null) return null;
    try {
      final decoded = jsonDecode(raw) as List<dynamic>;
      return decoded
          .map((item) =>
              Measurement.fromJson(item as Map<String, dynamic>))
          .toList();
    } catch (_) {
      return null;
    }
  }

  static Future<void> saveHistory(List<Measurement> history) async {
    final prefs = await SharedPreferences.getInstance();
    final raw = jsonEncode(
      history.map((item) => item.toJson()).toList(),
    );
    await prefs.setString(_storageKey, raw);
  }
}
