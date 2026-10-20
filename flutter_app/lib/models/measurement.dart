/// Модель данных: 6 показателей крови, нормы и статус отклонения.

enum MetricKey { glucose, cholesterol, triglycerides, hemoglobin, uricAcid, crp }

enum MetricStatus { normal, high, low }

class MetricInfo {
  final String name;
  final String unit;
  final double min;
  final double max;
  final int decimals;
  final double chartMin;
  final double chartMax;

  const MetricInfo({
    required this.name,
    required this.unit,
    required this.min,
    required this.max,
    required this.decimals,
    required this.chartMin,
    required this.chartMax,
  });
}

/// NORMS — единый источник норм для UI, графика и ИИ-рекомендаций.
class Norms {
  static const all = <MetricKey, MetricInfo>{
    MetricKey.glucose: MetricInfo(
      name: 'Глюкоза', unit: 'ммоль/л', min: 3.9, max: 6.1,
      decimals: 1, chartMin: 3, chartMax: 9,
    ),
    MetricKey.cholesterol: MetricInfo(
      name: 'Холестерин', unit: 'ммоль/л', min: 3.0, max: 5.2,
      decimals: 1, chartMin: 2.5, chartMax: 7.5,
    ),
    MetricKey.triglycerides: MetricInfo(
      name: 'Триглицериды', unit: 'ммоль/л', min: 0.5, max: 1.7,
      decimals: 1, chartMin: 0, chartMax: 3.5,
    ),
    MetricKey.hemoglobin: MetricInfo(
      name: 'Гемоглобин', unit: 'г/л', min: 120, max: 160,
      decimals: 0, chartMin: 100, chartMax: 185,
    ),
    MetricKey.uricAcid: MetricInfo(
      name: 'Мочевая кислота', unit: 'мкмоль/л', min: 210, max: 420,
      decimals: 0, chartMin: 120, chartMax: 540,
    ),
    MetricKey.crp: MetricInfo(
      name: 'С-реактивный белок', unit: 'мг/л', min: 0, max: 5,
      decimals: 1, chartMin: 0, chartMax: 12,
    ),
  };

  static MetricStatus statusOf(MetricKey key, double value) {
    final info = all[key]!;
    if (value > info.max) return MetricStatus.high;
    if (value < info.min) return MetricStatus.low;
    return MetricStatus.normal;
  }

  /// «5,8» — русская запись числа
  static String formatValue(MetricKey key, double value) =>
      value.toStringAsFixed(all[key]!.decimals).replaceAll('.', ',');

  /// «3,9–6,1 ммоль/л» — подпись нормы
  static String rangeLabel(MetricKey key) {
    final info = all[key]!;
    final from = info.min.toStringAsFixed(info.decimals).replaceAll('.', ',');
    final to = info.max.toStringAsFixed(info.decimals).replaceAll('.', ',');
    return '$from–$to ${info.unit}';
  }
}

class Measurement {
  final String id;
  final DateTime date;
  final Map<MetricKey, double> values;

  const Measurement({
    required this.id,
    required this.date,
    required this.values,
  });

  int get deviationCount => values.keys
      .where((key) => Norms.statusOf(key, values[key]!) != MetricStatus.normal)
      .length;

  Map<String, dynamic> toJson() => {
        'id': id,
        'date': date.toIso8601String(),
        'values': values.map((key, value) => MapEntry(key.name, value)),
      };

  factory Measurement.fromJson(Map<String, dynamic> json) => Measurement(
        id: json['id'] as String,
        date: DateTime.parse(json['date'] as String),
        values: {
          for (final entry
              in (json['values'] as Map<String, dynamic>).entries)
            MetricKey.values.byName(entry.key): (entry.value as num).toDouble(),
        },
      );
}
