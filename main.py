# Блок подключения библиотеки Flask
# Flask используется для создания веб-приложения, а render_template — для вывода HTML-шаблона.
from flask import Flask, render_template

# Блок создания экземпляра приложения
# app содержит объект Flask-приложения.
app = Flask(__name__)

# Блок маршрутизации
# Декоратор @app.route('/') задает обработчик главной страницы.
@app.route('/')
def hello_world():
    # Функция возвращает HTML-шаблон index.html из папки templates.
    return render_template("index.html")

# Блок запуска сервера
# Адрес 0.0.0.0 используется для доступа к приложению в среде Replit.
app.run("0.0.0.0")