/// Форматирование дат по-русски без intl (для MVP).

const _months = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

/// «12 мая»
String formatDateRu(DateTime date) => '${date.day} ${_months[date.month - 1]}';

/// «12 мая, 09:30»
String formatDateTimeRu(DateTime date) =>
    '${formatDateRu(date)}, ${date.hour.toString().padLeft(2, '0')}:'
    '${date.minute.toString().padLeft(2, '0')}';

/// «12.05» — подпись оси графика
String formatDateShort(DateTime date) =>
    '${date.day.toString().padLeft(2, '0')}.'
    '${date.month.toString().padLeft(2, '0')}';
