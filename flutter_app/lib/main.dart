/// Точка входа SmartBlood MVP (Flutter, по исходному ТЗ).
/// Каркас: телефонный фрейм, нижняя навигация (Home / Measure / History),
/// полноэкранный Result и AppState (ChangeNotifier + Provider).

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'models/measurement.dart';
import 'screens/history_screen.dart';
import 'screens/home_screen.dart';
import 'screens/measure_screen.dart';
import 'screens/result_screen.dart';
import 'services/history_storage.dart';
import 'services/simulator_service.dart';
import 'theme/app_theme.dart';

void main() {
  runApp(const SmartBloodApp());
}

enum TabId { home, measure, history }

/// Состояние приложения: история измерений, текущая вкладка,
/// pending-результат до сохранения в историю.
class AppState extends ChangeNotifier {
  List<Measurement> history = [];
  Measurement? pending;
  TabId currentTab = TabId.home;
  bool _loaded = false;

  Future<void> loadHistory() async {
    if (_loaded) return;
    _loaded = true;
    final stored = await HistoryStorage.loadHistory();
    if (stored != null && stored.isNotEmpty) {
      history = stored;
    } else {
      // Первый запуск: демо-история, чтобы прототип был показательным
      history = SimulatorService.seedHistory();
      await HistoryStorage.saveHistory(history);
    }
    notifyListeners();
  }

  void switchTab(TabId tab) {
    currentTab = tab;
    notifyListeners();
  }

  void completeMeasure(Measurement measurement) {
    pending = measurement;
    notifyListeners();
  }

  Future<void> savePending() async {
    if (pending == null) return;
    history = [...history, pending!]
      ..sort((a, b) => a.date.compareTo(b.date));
    pending = null;
    currentTab = TabId.home;
    notifyListeners();
    await HistoryStorage.saveHistory(history);
  }

  void discardPending() {
    pending = null;
    currentTab = TabId.home;
    notifyListeners();
  }
}

/// Телефонный фрейм: прототип показывается в корпусе смартфона.
class PhoneFrame extends StatelessWidget {
  final Widget child;

  const PhoneFrame({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        width: 390,
        height: 844,
        margin: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(48),
          border: Border.all(color: const Color(0xFF1E293B), width: 10),
          color: SbColors.background,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.25),
              blurRadius: 40,
              offset: const Offset(0, 16),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(38),
          child: child,
        ),
      ),
    );
  }
}

class SmartBloodApp extends StatelessWidget {
  const SmartBloodApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AppState()..loadHistory(),
      child: MaterialApp(
        title: 'SmartBlood MVP',
        debugShowCheckedModeBanner: false,
        theme: buildSmartBloodTheme(),
        home: const PhoneFrame(child: _Shell()),
      ),
    );
  }
}

class _Shell extends StatelessWidget {
  const _Shell();

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();

    // Полноэкранный Result поверх вкладок
    if (state.pending != null) {
      return ResultScreen(
        measurement: state.pending!,
        onSave: state.savePending,
        onDiscard: state.discardPending,
      );
    }

    return Scaffold(
      backgroundColor: SbColors.background,
      body: SafeArea(
        child: switch (state.currentTab) {
          TabId.home => HomeScreen(
              history: state.history,
              onStartMeasure: () => state.switchTab(TabId.measure),
            ),
          TabId.measure => MeasureScreen(
              onComplete: state.completeMeasure,
              onCancel: () => state.switchTab(TabId.home),
            ),
          TabId.history => HistoryScreen(
              history: state.history,
              onOpenMeasurement: state.completeMeasure,
            ),
        },
      ),
      bottomNavigationBar: _BottomNav(state: state),
    );
  }
}

/// Нижняя навигация: Главная / Анализ (центральная кнопка) / История.
class _BottomNav extends StatelessWidget {
  final AppState state;

  const _BottomNav({required this.state});

  @override
  Widget build(BuildContext context) {
    return BottomAppBar(
      color: Colors.white,
      elevation: 0,
      child: SizedBox(
        height: 64,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _NavItem(
              icon: Icons.home_outlined,
              activeIcon: Icons.home,
              label: 'Главная',
              active: state.currentTab == TabId.home,
              onTap: () => state.switchTab(TabId.home),
            ),
            _NavItem(
              label: 'Анализ',
              active: state.currentTab == TabId.measure,
              isCenter: true,
              onTap: () => state.switchTab(TabId.measure),
            ),
            _NavItem(
              icon: Icons.history,
              label: 'История',
              active: state.currentTab == TabId.history,
              onTap: () => state.switchTab(TabId.history),
            ),
          ],
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData? icon;
  final IconData? activeIcon;
  final String label;
  final bool active;
  final bool isCenter;
  final VoidCallback onTap;

  const _NavItem({
    this.icon,
    this.activeIcon,
    required this.label,
    required this.active,
    required this.onTap,
    this.isCenter = false,
  });

  @override
  Widget build(BuildContext context) {
    final color = active ? SbColors.primary : SbColors.textSecondary;
    final visual = isCenter
        ? Container(
            width: 56,
            height: 56,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              color: SbColors.mint,
            ),
            child: const Icon(Icons.water_drop, color: Colors.white),
          )
        : Icon(active ? (activeIcon ?? icon) : icon, color: color);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            visual,
            Text(label,
                style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: color)),
          ],
        ),
      ),
    );
  }
}
