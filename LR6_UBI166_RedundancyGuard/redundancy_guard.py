import json

class RedundancyGuard:
    """Контейнер контроля системной избыточности по УБИ.166."""

    def __init__(self, config_path: str):
        self.config_path = config_path
        self.config = self._load_config()

    def _load_config(self):
        # Блок ввода данных
        with open(self.config_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def _classify(self, name: str):
        # Блок классификации компонента
        allowed = set(self.config["allowed_components"])
        obsolete = set(self.config["obsolete_components"])

        if name in allowed:
            return {"status": "Разрешенный компонент", "violation": "нет", "redundant": False}
        if name in obsolete:
            return {"status": "Устаревший компонент", "violation": "компонент устаревшей задачи", "redundant": True}
        return {"status": "Неразрешенный компонент", "violation": "неразрешенный компонент", "redundant": True}

    def check(self):
        # Блок контроля полного состава
        results = []
        for name in self.config["running_components"]:
            result = self._classify(name)
            result["name"] = name
            results.append(result)
        return results
