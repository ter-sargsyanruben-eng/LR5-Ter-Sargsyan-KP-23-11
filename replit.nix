# Блок настройки системного окружения Replit
{ pkgs }: {
  # Блок системных зависимостей проекта
  deps = [
    # Пакет для запуска Python 3.10 в Replit
    pkgs.replitPackages.prybar-python310

    # Пакет для корректного вывода ошибок в консоль
    pkgs.replitPackages.stderred
  ];
}