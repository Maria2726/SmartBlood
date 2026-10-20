/// Дизайн-токены и тема SmartBlood.
/// Цвета из ТЗ: Primary #0A2540, акцент Mint #00C48C, Error #FF4D4F.

import 'package:flutter/material.dart';

class SbColors {
  static const primary = Color(0xFF0A2540);
  static const mint = Color(0xFF00C48C);
  static const error = Color(0xFFFF4D4F);
  static const background = Color(0xFFF5F7FA);
  static const card = Colors.white;
  static const textSecondary = Color(0xFF64748B);
}

class SbRadius {
  static const card = 16.0;
  static const button = 16.0;
}

ThemeData buildSmartBloodTheme() {
  final base = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: SbColors.primary,
      primary: SbColors.primary,
      secondary: SbColors.mint,
      error: SbColors.error,
    ),
    scaffoldBackgroundColor: SbColors.background,
  );

  return base.copyWith(
    textTheme: base.textTheme.apply(
      bodyColor: SbColors.primary,
      displayColor: SbColors.primary,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.transparent,
      foregroundColor: SbColors.primary,
      elevation: 0,
      centerTitle: false,
    ),
    cardTheme: CardTheme(
      color: SbColors.card,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(SbRadius.card),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: SbColors.mint,
        foregroundColor: Colors.white,
        minimumSize: const Size.fromHeight(52),
        textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(SbRadius.button),
        ),
      ),
    ),
  );
}
