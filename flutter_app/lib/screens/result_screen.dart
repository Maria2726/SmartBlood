/// Экран 3. Result: все 6 показателей с нормами, блок «Рекомендация ИИ»
/// и сохранение в историю.

import 'package:flutter/material.dart';

import '../models/measurement.dart';
import '../services/recommendation_service.dart';
import '../theme/app_theme.dart';
import '../utils/format.dart';
import '../widgets/status_badge.dart';

class ResultScreen extends StatelessWidget {
  final Measurement measurement;
  final VoidCallback onSave;
  final VoidCallback onDiscard;

  const ResultScreen({
    super.key,
    required this.measurement,
    required this.onSave,
    required this.onDiscard,
  });

  @override
  Widget build(BuildContext context) {
    final recommendation =
        RecommendationService.getRecommendations(measurement.values);
    final isGood = recommendation.tone == RecommendationTone.good;
    final isAlert = recommendation.tone == RecommendationTone.alert;
    final badgeColor = isGood
        ? SbColors.mint
        : isAlert
            ? SbColors.error
            : Colors.orange;

    return Scaffold(
      backgroundColor: SbColors.background,
      appBar: AppBar(title: const Text('Результат анализа')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
        children: [
          Text(
            formatDateTimeRu(measurement.date),
            style: TextStyle(fontSize: 13, color: SbColors.textSecondary),
          ),
          const SizedBox(height: 12),

          // Карточка показателей: 6 строк «название / значение / статус»
          Container(
            decoration: BoxDecoration(
              color: SbColors.card,
              borderRadius: BorderRadius.circular(SbRadius.card),
            ),
            child: Column(
              children: [
                for (final key in MetricKey.values)
                  _MetricRow(key: key, values: measurement.values),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Блок «Рекомендация ИИ»
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: isAlert
                    ? const [Color(0xFF5C1220), SbColors.primary]
                    : const [SbColors.primary, Color(0xFF0E3A5C)],
              ),
              borderRadius: BorderRadius.circular(SbRadius.card),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.auto_awesome,
                        color: SbColors.mint, size: 20),
                    const SizedBox(width: 8),
                    const Text('Рекомендация ИИ',
                        style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                            fontSize: 16)),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: badgeColor.withOpacity(0.25),
                        borderRadius: BorderRadius.circular(999),
                      ),
                      child: Text(
                        measurement.deviationCount == 0
                            ? 'Все в норме'
                            : 'Отклонений: ${measurement.deviationCount}',
                        style: TextStyle(
                            color: badgeColor,
                            fontSize: 12,
                            fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(recommendation.title,
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w700)),
                const SizedBox(height: 8),
                for (final item in recommendation.advice)
                  Padding(
                    padding: const EdgeInsets.only(top: 6),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Padding(
                          padding: EdgeInsets.only(top: 7),
                          child: Icon(Icons.circle,
                              size: 6, color: SbColors.mint),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(item,
                              style: TextStyle(
                                  color: Colors.white.withOpacity(0.85),
                                  fontSize: 14,
                                  height: 1.4)),
                        ),
                      ],
                    ),
                  ),
                const SizedBox(height: 12),
                Text(
                  'Рекомендации не являются медицинской консультацией. '
                  'При отклонениях обратитесь к врачу.',
                  style: TextStyle(
                      color: Colors.white.withOpacity(0.5), fontSize: 11),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Кнопки сохранения
          ElevatedButton(
            onPressed: onSave,
            child: const Text('Сохранить в историю'),
          ),
          const SizedBox(height: 8),
          TextButton(
            onPressed: onDiscard,
            child: const Text('Закрыть без сохранения'),
          ),
        ],
      ),
    );
  }
}

class _MetricRow extends StatelessWidget {
  final MetricKey key;
  final Map<MetricKey, double> values;

  const _MetricRow({required this.key, required this.values});

  @override
  Widget build(BuildContext context) {
    final info = Norms.all[key]!;
    final value = values[key]!;
    final status = Norms.statusOf(key, value);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: Color(0xFFF1F5F9))),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(info.name,
                    style: const TextStyle(fontWeight: FontWeight.w600)),
                Text('Норма: ${Norms.rangeLabel(key)}',
                    style: TextStyle(
                        fontSize: 12, color: SbColors.textSecondary)),
              ],
            ),
          ),
          Text(
            Norms.formatValue(key, value),
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800),
          ),
          const SizedBox(width: 4),
          Text(info.unit,
              style: TextStyle(fontSize: 11, color: SbColors.textSecondary)),
          const SizedBox(width: 10),
          StatusBadge(status: status),
        ],
      ),
    );
  }
}
