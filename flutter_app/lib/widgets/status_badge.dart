/// Бейдж статуса показателя: «Норма» / «Высокий» / «Низкий».

import 'package:flutter/material.dart';

import '../models/measurement.dart';
import '../theme/app_theme.dart';

class StatusBadge extends StatelessWidget {
  final MetricStatus status;

  const StatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final (label, color) = switch (status) {
      MetricStatus.normal => ('Норма', SbColors.mint),
      MetricStatus.high => ('Высокий', SbColors.error),
      MetricStatus.low => ('Низкий', SbColors.error),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: color,
        ),
      ),
    );
  }
}
