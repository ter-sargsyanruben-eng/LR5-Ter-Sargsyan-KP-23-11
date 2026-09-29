import logging
from pathlib import Path

def setup_logger():
    Path("logs").mkdir(exist_ok=True)
    logger = logging.getLogger("redundancy_guard")
    logger.setLevel(logging.INFO)
    if not logger.handlers:
        handler = logging.FileHandler("logs/redundancy_guard.log", encoding="utf-8")
        handler.setFormatter(logging.Formatter("%(asctime)s | %(levelname)s | %(message)s"))
        logger.addHandler(handler)
    return logger
