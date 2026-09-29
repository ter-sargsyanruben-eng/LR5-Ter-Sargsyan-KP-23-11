from redundancy_guard import RedundancyGuard
from logger_utils import setup_logger
from pathlib import Path
import csv

def save_csv(results, path="output/results.csv"):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["container", "status", "violation", "redundant"])
        for item in results:
            writer.writerow([item["name"], item["status"], item["violation"], "Да" if item["redundant"] else "Нет"])

def main():
    logger = setup_logger()
    guard = RedundancyGuard("config.json")
    results = guard.check()

    print("=== Redundancy Guard — контроль системной избыточности УБИ.166 ===")
    print()
    print(f"{'Контейнер':<18} {'Статус':<28} {'Тип нарушения'}")
    print("-" * 85)

    for item in results:
        print(f"{item['name']:<18} {item['status']:<28} {item['violation']}")
        logger.info("%s | %s | %s", item["name"], item["status"], item["violation"])

    total = len(results)
    redundant = sum(1 for x in results if x["redundant"])
    allowed = total - redundant
    percent = round((redundant / total * 100), 2) if total else 0.0

    print()
    print("Сводка:")
    print(f"Всего запущено: {total}")
    print(f"Разрешенных: {allowed}")
    print(f"Избыточных: {redundant}")
    print(f"Доля избыточных, %: {percent}")
    print("Результат: Обнаружена системная избыточность" if redundant else "Результат: Нарушения не обнаружены")

    save_csv(results)
    print("Таблица сохранена: output/results.csv")
    print("Лог сохранен: logs/redundancy_guard.log")

if __name__ == "__main__":
    main()
