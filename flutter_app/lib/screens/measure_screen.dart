/// Экран 2. Measure: имитация анализа устройством — 5 секунд прогресса
/// (аналог Future.delayed(Duration(seconds: 5)) из ТЗ, время сжато для демо).

import 'dart:async';

import 'package:flutter/material.dart';

import '../models/measurement.dart';
import '../services/simulator_service.dart';
import '../theme/app_theme.dart';

class MeasureScreen extends StatefulWidget {
  final ValueChanged<Measurement> onComplete;
  final VoidCallback onCancel;

  const MeasureScreen({
    super.key,
    required this.onComplete,
    required this.onCancel,
  });

  @override
  State<MeasureScreen> createState() => _MeasureScreenState();
}

class _MeasureScreenState extends State<MeasureScreen> {
  static const _duration = Duration(seconds: 5);
  static const _tick = Duration(milliseconds: 100);

  double _progress = 0;
  Timer? _timer;

  static const _stages = [
    ('Забор капли крови (10 мкл)', 0.34),
    ('Оптический анализ образца', 0.67),
    ('Расчёт показателей', 1.01),
  ];

  String get _stageLabel => _stages
      .firstWhere((stage) => _progress < stage.$2, orElse: () => _stages.last)
      .$1;

  @override
  void initState() {
    super.initState();
    final startedAt = DateTime.now();
    _timer = Timer.periodic(_tick, (timer) {
      final elapsed = DateTime.now().difference(startedAt);
      final value =
          (elapsed.inMilliseconds / _duration.inMilliseconds).clamp(0.0, 1.0);
      if (value >= 1) {
        timer.cancel();
        widget.onComplete(SimulatorService.createMeasurement());
      }
      setState(() => _progress = value);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final secondsLeft =
        ((1 - _progress) * _duration.inSeconds).ceil();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const _PulsingDrop(),
          const SizedBox(height: 40),
          const Text(
            'Приложите палец к устройству SmartBlood',
            textAlign: TextAlign.center,
            style: TextStyle(
                fontSize: 24, fontWeight: FontWeight.w700, height: 1.25),
          ),
          const SizedBox(height: 12),
          Text(_stageLabel,
              style:
                  TextStyle(fontSize: 16, color: SbColors.textSecondary)),
          const SizedBox(height: 40),
          ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: LinearProgressIndicator(
              value: _progress,
              minHeight: 12,
              backgroundColor: const Color(0xFFE2E8F0),
              valueColor: const AlwaysStoppedAnimation(SbColors.mint),
            ),
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('${(_progress * 100).round()}%',
                  style: const TextStyle(fontWeight: FontWeight.w600)),
              Text('осталось $secondsLeft с',
                  style: TextStyle(
                      fontSize: 14, color: SbColors.textSecondary)),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'В реальном устройстве анализ занимает 5 минут. '
            'В прототипе время сокращено до 5 секунд.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 12, color: SbColors.textSecondary),
          ),
          const SizedBox(height: 32),
          TextButton(
            onPressed: widget.onCancel,
            child: const Text('Отменить'),
          ),
        ],
      ),
    );
  }
}

/// Капля крови с пульсацией (AnimationController + scale/opacity).
class _PulsingDrop extends StatefulWidget {
  const _PulsingDrop();

  @override
  State<_PulsingDrop> createState() => _PulsingDropState();
}

class _PulsingDropState extends State<_PulsingDrop>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1200),
  )..repeat(reverse: true);

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: Tween(begin: 0.95, end: 1.05)
          .animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut)),
      child: Container(
        width: 140,
        height: 140,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: SbColors.error.withOpacity(0.12),
          boxShadow: [
            BoxShadow(
              color: SbColors.error.withOpacity(0.25),
              blurRadius: 32,
              spreadRadius: 4,
            ),
          ],
        ),
        child: const Icon(Icons.water_drop, size: 72, color: SbColors.error),
      ),
    );
  }
}
