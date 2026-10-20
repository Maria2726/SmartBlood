"""SmartBlood — ИИ-рекомендации по 6 показателям крови.

Референсная логика персональных рекомендаций для MVP-приложения.
Правила синхронизированы с TypeScript-портом: src/lib/smartblood/recommendations.ts

Запуск демо:
    python smartblood-ai/recommendations.py
"""

NORMS = {
    "glucose": {"name": "Глюкоза", "unit": "ммоль/л", "min": 3.9, "max": 6.1},
    "cholesterol": {"name": "Холестерин", "unit": "ммоль/л", "min": 3.0, "max": 5.2},
    "triglycerides": {"name": "Триглицериды", "unit": "ммоль/л", "min": 0.5, "max": 1.7},
    "hemoglobin": {"name": "Гемоглобин", "unit": "г/л", "min": 120, "max": 160},
    "uric_acid": {"name": "Мочевая кислота", "unit": "мкмоль/л", "min": 210, "max": 420},
    "crp": {"name": "С-реактивный белок", "unit": "мг/л", "min": 0.0, "max": 5.0},
}


def get_recommendations(data: dict) -> str:
    """Возвращает текст персональных рекомендаций по 6 показателям.

    :param data: словарь вида {"glucose": 5.4, "cholesterol": 4.8,
                                "triglycerides": 1.2, "hemoglobin": 140,
                                "uric_acid": 320, "crp": 2.1}
    :return: человекочитаемый текст рекомендации
    """

    def over(key: str) -> bool:
        return data.get(key, 0) > NORMS[key]["max"]

    tips = []

    # Основные правила из ТЗ
    if over("glucose"):
        tips.append(
            "Повышенный уровень сахара. Рекомендуем снизить потребление "
            "быстрых углеводов и проконсультироваться с эндокринологом."
        )
    if over("cholesterol"):
        tips.append(
            "Повышен холестерин. Добавьте в рацион больше овощей, "
            "клетчатки и рыбы."
        )
    if over("crp"):
        tips.append("Признаки воспаления. Рекомендуем обратиться к врачу.")

    # Дополнительные правила по остальным показателям
    if over("triglycerides"):
        tips.append(
            "Повышены триглицериды. Ограничьте сахар и алкоголь, "
            "добавьте регулярную аэробную нагрузку."
        )
    if over("uric_acid"):
        tips.append(
            "Мочевая кислота выше нормы. Ограничьте красное мясо "
            "и пейте больше воды."
        )

    hemoglobin = data.get("hemoglobin", NORMS["hemoglobin"]["min"])
    if hemoglobin < NORMS["hemoglobin"]["min"]:
        tips.append(
            "Гемоглобин ниже нормы. Добавьте в рацион продукты, богатые "
            "железом, и обсудите результат с терапевтом."
        )
    elif hemoglobin > NORMS["hemoglobin"]["max"]:
        tips.append(
            "Гемоглобин выше нормы. Пейте достаточно воды и сообщите "
            "о результате врачу."
        )

    if not tips:
        return "Ваши показатели в норме. Продолжайте вести здоровый образ жизни!"

    return "\n".join(f"• {tip}" for tip in tips)


def _demo() -> None:
    healthy = {
        "glucose": 5.2,
        "cholesterol": 4.6,
        "triglycerides": 1.1,
        "hemoglobin": 142,
        "uric_acid": 330,
        "crp": 1.8,
    }
    risky = {
        "glucose": 7.3,
        "cholesterol": 6.1,
        "triglycerides": 2.4,
        "hemoglobin": 138,
        "uric_acid": 450,
        "crp": 7.2,
    }
    for title, sample in (("Здоровый профиль", healthy), ("Требует внимания", risky)):
        print(f"--- {title} ---")
        print(get_recommendations(sample))
        print()


if __name__ == "__main__":
    _demo()
