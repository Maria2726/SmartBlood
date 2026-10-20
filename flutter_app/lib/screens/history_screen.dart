/// Экран 4. History: список измерений с датой, сводкой и отклонениями.

import 'package:flutter/material.dart';

import '../models/measurement.dart';
import '../services/recommendation_service.dart';
import '../theme/app_theme.dart';
import '../utils/format.dart';

class HistoryScreen extends StatelessWidget {
  final List<Measurement> history;
  final ValueChanged<Measurement> onOpenMeasurement;

  const HistoryScreen({
    super.key,
    required this.history,
    required this.onOpenMeasurement,
  });

  @override
  Widget build(BuildContext context) {
    // Свежие сверху
    final sorted = [...history.reversed];

    return Scaffold(
      backgroundColor: SbColors.background,
      appBar: AppBar(title: const Text('История измерений')),
      body: sorted.isEmpty
          ? Center(
              child: Text('Пока нет измерений',
                  style: TextStyle(color: SbColors.textSecondary)),
            )
          : ListView.builder(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
              itemCount: sorted.length,
              itemBuilder: (context, index) {
                final measurement = sorted[index];
                final recommendation = RecommendationService.getRecommendations(
                    measurement.values);
                final isGood =
                    recommendation.tone == RecommendationTone.good;

                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  decoration: BoxDecoration(
                    color: SbColors.card,
                    borderRadius: BorderRadius.circular(SbRadius.card),
                  ),
                  child: ListTile(
                    onTap: () => onOpenMeasurement(measurement),
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 6),
                    leading: CircleAvatar(
                      backgroundColor: isGood
                          ? SbColors.mint.withOpacity(0.15)
                          : SbColors.error.withOpacity(0.15),
                      child: Icon(
                        isGood
                            ? Icons.check_circle_outline
                            : Icons.warning_amber_rounded,
                        color: isGood ? SbColors.mint : SbColors.error,
                      ),
                    ),
                    title: Text(formatDateTimeRu(measurement.date),
                        style: const TextStyle(fontWeight: FontWeight.w600)),
                    subtitle: Text(
                      recommendation.title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                          fontSize: 13, color: SbColors.textSecondary),
                    ),
                    trailing: Text(
                      'Откл.: ${measurement.deviationCount}',
                      style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: isGood ? SbColors.mint : SbColors.error),
                    ),
                  ),
                );
              },
            ),
    );
  }
}
