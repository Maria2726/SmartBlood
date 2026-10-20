/// ИИ-рекомендации: правила из ТЗ проекта.
/// Тексты синхронизированы со smartblood-ai/recommendations.py.

import '../models/measurement.dart';

enum RecommendationTone { good, warning, alert }

class Recommendation {
  final RecommendationTone tone;
  final String title;
  final List<String> advice;

  const Recommendation({
    required this.tone,
    required this.title,
    required this.advice,
  });
}

class RecommendationService {
  static Recommendation getRecommendations(Map<MetricKey, double> values) {
    final advice = <String>[];
    var alert = false;

    // Основные правила из ТЗ
    if (values[MetricKey.glucose]! > Norms.all[MetricKey.glucose]!.max) {
      alert = true;
      advice.add('Повышенный уровень сахара. Рекомендуем снизить потребление '
          'быстрых углеводов и проконсультироваться с эндокринологом.');
    }
    if (values[MetricKey.cholesterol]! > Norms.all[MetricKey.cholesterol]!.max) {
      advice.add('Повышен холестерин. Добавьте в рацион больше овощей, '
          'клетчатки и рыбы.');
    }
    if (values[MetricKey.crp]! > Norms.all[MetricKey.crp]!.max) {
      alert = true;
      advice.add('Признаки воспаления. Рекомендуем обратиться к врачу.');
    }

    // Дополнительные правила по остальным показателям
    if (values[MetricKey.triglycerides]! >
        Norms.all[MetricKey.triglycerides]!.max) {
      advice.add('Повышены триглицериды. Ограничьте сахар и алкоголь, '
          'добавьте регулярную аэробную нагрузку.');
    }
    if (values[MetricKey.uricAcid]! > Norms.all[MetricKey.uricAcid]!.max) {
      advice.add('Мочевая кислота выше нормы. Ограничьте красное мясо '
          'и пейте больше воды.');
    }
    final hemoglobin = values[MetricKey.hemoglobin]!;
    if (hemoglobin < Norms.all[MetricKey.hemoglobin]!.min) {
      advice.add('Гемоглобин ниже нормы. Добавьте в рацион продукты, богатые '
          'железом, и обсудите результат с терапевтом.');
    } else if (hemoglobin > Norms.all[MetricKey.hemoglobin]!.max) {
      advice.add('Гемоглобин выше нормы. Пейте достаточно воды и сообщите '
          'о результате врачу.');
    }

    if (advice.isEmpty) {
      return const Recommendation(
        tone: RecommendationTone.good,
        title: 'Ваши показатели в норме',
        advice: ['Продолжайте вести здоровый образ жизни!'],
      );
    }

    return Recommendation(
      tone: alert ? RecommendationTone.alert : RecommendationTone.warning,
      title: alert ? 'Требуется внимание к здоровью' : 'Есть отклонения от нормы',
      advice: advice,
    );
  }
}
