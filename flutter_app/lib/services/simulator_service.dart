/// Симулятор устройства: генерация измерения и демо-история.
/// Аналог dart:math Random() из ТЗ — без реального Bluetooth.

import 'dart:math';

import '../models/measurement.dart';

class SimulatorService {
  static final _random = Random();

  /// Одно измерение: базовый уровень ± случайное отклонение,
  /// иногда заметный выход за норму, чтобы ИИ-блок был показательным.
  static Measurement createMeasurement({DateTime? date}) {
    final now = date ?? DateTime.now();
    double jitter(double base, double spread) =>
        base + (_random.nextDouble() * 2 - 1) * spread;

    double withSpike({
      required double base,
      required double spread,
      required double normMax,
      required double spike,
      required int spikeChancePercent,
    }) {
      final value = jitter(base, spread);
      return _random.nextInt(100) < spikeChancePercent
          ? normMax + spike + _random.nextDouble() * spike * 0.5
          : value;
    }

    return Measurement(
      id: '${now.millisecondsSinceEpoch}-${_random.nextInt(1 << 32)}',
      date: now,
      values: {
        MetricKey.glucose: withSpike(
          base: 5.2, spread: 0.7, normMax: 6.1,
          spike: 1.2, spikeChancePercent: 25,
        ),
        MetricKey.cholesterol: withSpike(
          base: 4.4, spread: 0.7, normMax: 5.2,
          spike: 1.1, spikeChancePercent: 25,
        ),
        MetricKey.triglycerides: withSpike(
          base: 1.2, spread: 0.35, normMax: 1.7,
          spike: 0.6, spikeChancePercent: 20,
        ),
        MetricKey.hemoglobin: withSpike(
          base: 142, spread: 11, normMax: 160,
          spike: 14, spikeChancePercent: 15,
        ),
        MetricKey.uricAcid: withSpike(
          base: 330, spread: 55, normMax: 420,
          spike: 70, spikeChancePercent: 20,
        ),
        MetricKey.crp: withSpike(
          base: 2.2, spread: 1.4, normMax: 5,
          spike: 3.5, spikeChancePercent: 20,
        ),
      },
    );
  }

  /// Демо-история: 7 измерений за последние 7 дней, чтобы графики
  /// и тренды были заполнены сразу после первого запуска.
  static List<Measurement> seedHistory() {
    final now = DateTime.now();
    return List.generate(7, (index) {
      final date = now.subtract(Duration(days: 6 - index, hours: 3));
      return createMeasurement(date: date);
    });
  }
}
