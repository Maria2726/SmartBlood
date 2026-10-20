/// Экран 1. Home: приветствие, сводка последнего анализа, карточки
/// показателей с трендом и график глюкозы за 7 последних измерений.

import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

import '../models/measurement.dart';
import '../services/recommendation_service.dart';
import '../theme/app_theme.dart';
import '../utils/format.dart';
import '../widgets/status_badge.dart';

class HomeScreen extends StatelessWidget {
  final List<Measurement> history;
  final VoidCallback onStartMeasure;

  const HomeScreen({
    super.key,
    required this.history,
    required this.onStartMeasure,
  });

  @override
  Widget build(BuildContext context) {
    final latest = history.isNotEmpty ? history.last : null;

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
      children: [
        const Text(
          'SmartBlood',
          style: TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.w800,
            color: SbColors.primary,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Анализ крови за 5 минут — без лаборатории',
          style: TextStyle(fontSize: 15, color: SbColors.textSecondary),
        ),
        const SizedBox(height: 20),

        // Кнопка «Начать анализ» — main CTA
        ElevatedButton.icon(
          onPressed: onStartMeasure,
          icon: const Icon(Icons.water_drop),
          label: const Text('Начать анализ'),
        ),
        const SizedBox(height: 20),

        if (latest != null) ...[
          _SummaryCard(latest: latest),
          const SizedBox(height: 16),
        ],

        const Text(
          'Показатели',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 10),
        ...MetricKey.values.map(
          (key) => _MetricTile(
            key: key,
            history: history,
          ),
        ),

        const SizedBox(height: 20),
        if (history.length >= 2) _GlucoseChart(history: history),
      ],
    );
  }
}

/// Сводка последнего измерения: дата, число отклонений, вердикт ИИ.
class _SummaryCard extends StatelessWidget {
  final Measurement latest;

  const _SummaryCard({required this.latest});

  @override
  Widget build(BuildContext context) {
    final recommendation =
        RecommendationService.getRecommendations(latest.values);
    final isGood = recommendation.tone == RecommendationTone.good;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: SbColors.card,
        borderRadius: BorderRadius.circular(SbRadius.card),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Последний анализ',
                  style: TextStyle(fontWeight: FontWeight.w700)),
              Text(
                formatDateTimeRu(latest.date),
                style:
                    TextStyle(fontSize: 13, color: SbColors.textSecondary),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Icon(
                isGood ? Icons.check_circle : Icons.warning_amber_rounded,
                color: isGood ? SbColors.mint : SbColors.error,
                size: 20,
              ),
              const SizedBox(width: 6),
              Text(
                recommendation.title,
                style: const TextStyle(
                    fontSize: 16, fontWeight: FontWeight.w600),
              ),
            ],
          ),
          Text(
            'Отклонений: ${latest.deviationCount} из 6',
            style: TextStyle(fontSize: 13, color: SbColors.textSecondary),
          ),
        ],
      ),
    );
  }
}

/// Карточка показателя: последнее значение, норма, стрелка тренда.
class _MetricTile extends StatelessWidget {
  final MetricKey key;
  final List<Measurement> history;

  const _MetricTile({required this.key, required this.history});

  @override
  Widget build(BuildContext context) {
    final info = Norms.all[key]!;
    final status =
        history.isEmpty ? MetricStatus.normal : Norms.statusOf(key, history.last.values[key]!);

    String? trendLabel;
    IconData? trendIcon;
    Color? trendColor;
    if (history.length >= 2) {
      final prev = history[history.length - 2].values[key]!;
      final curr = history.last.values[key]!;
      if ((curr - prev).abs() > 0.01) {
        final up = curr > prev;
        trendIcon = up ? Icons.arrow_upward : Icons.arrow_downward;
        // Рост — не всегда «хорошо»: сравниваем с нормой
        trendColor = up
            ? (Norms.statusOf(key, curr) == MetricStatus.high
                ? SbColors.error
                : SbColors.mint)
            : (Norms.statusOf(key, curr) == MetricStatus.low
                ? SbColors.error
                : SbColors.mint);
        trendLabel = '${up ? '+' : '−'}'
            '${(curr - prev).abs().toStringAsFixed(info.decimals).replaceAll('.', ',')}';
      }
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: SbColors.card,
        borderRadius: BorderRadius.circular(SbRadius.card),
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
          if (history.isNotEmpty) ...[
            if (trendIcon != null) ...[
              Icon(trendIcon, size: 14, color: trendColor),
              Text(trendLabel!,
                  style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: trendColor)),
              const SizedBox(width: 8),
            ],
            Text(
              Norms.formatValue(key, history.last.values[key]!),
              style: const TextStyle(
                  fontSize: 22, fontWeight: FontWeight.w800),
            ),
            const SizedBox(width: 4),
            Text(info.unit,
                style:
                    TextStyle(fontSize: 11, color: SbColors.textSecondary)),
            const SizedBox(width: 10),
            StatusBadge(status: status),
          ] else
            Text('Нет данных',
                style: TextStyle(fontSize: 13, color: SbColors.textSecondary)),
        ],
      ),
    );
  }
}

/// График глюкозы за последние измерения (fl_chart, как в ТЗ).
class _GlucoseChart extends StatelessWidget {
  final List<Measurement> history;

  const _GlucoseChart({required this.history});

  @override
  Widget build(BuildContext context) {
    final info = Norms.all[MetricKey.glucose]!;
    final points = history
        .asMap()
        .entries
        .map((entry) => FlSpot(
              entry.key.toDouble(),
              entry.value.values[MetricKey.glucose]!,
            ))
        .toList();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: SbColors.card,
        borderRadius: BorderRadius.circular(SbRadius.card),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Глюкоза, ${info.unit}',
              style: const TextStyle(fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          Text(
            'Последние ${history.length} измерений',
            style: TextStyle(fontSize: 12, color: SbColors.textSecondary),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 160,
            child: LineChart(
              LineChartData(
                minY: info.chartMin,
                maxY: info.chartMax,
                gridData: const FlGridData(show: true, drawVerticalLine: false),
                titlesData: FlTitlesData(
                  leftTitles: const AxisTitles(
                    sideTitles: SideTitles(showTitles: true, reservedSize: 32),
                  ),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 24,
                      getTitlesWidget: (value, meta) => Padding(
                        padding: const EdgeInsets.only(top: 6),
                        child: Text(
                          formatDateShort(history[value.toInt()].date),
                          style: TextStyle(
                              fontSize: 10, color: SbColors.textSecondary),
                        ),
                      ),
                    ),
                  ),
                  topTitles: const AxisTitles(),
                  rightTitles: const AxisTitles(),
                ),
                borderData: FlBorderData(show: false),
                lineBarsData: [
                  LineChartBarData(
                    spots: points,
                    isCurved: true,
                    color: SbColors.mint,
                    barWidth: 3,
                    dotData: const FlDotData(show: true),
                    belowBarData: BarAreaData(
                      show: true,
                      color: SbColors.mint.withOpacity(0.12),
                    ),
                  ),
                ],
                lineTouchData: const LineTouchData(enabled: true),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
