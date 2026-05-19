// Блок настройки цветов и порога уверенности
var bounding_box_colors = {};
var user_confidence = 0.6;

// Список цветов для рамок распознанных объектов
var color_choices = [
  "#C7FC00",
  "#FF00FF",
  "#8622FF",
  "#FE0056",
  "#00FFCE",
  "#FF8000",
  "#00B7EB",
  "#FFFF00",
  "#0E7AFE",
  "#FFABAB",
  "#0000FF",
  "#CCCCCC",
];

// Блок подготовки canvas для вывода рамок
var canvas_painted = false;
var canvas = document.getElementById("video_canvas");
var ctx = canvas.getContext("2d");

// Блок запуска Roboflow Inference Engine
const inferEngine = new inferencejs.InferenceEngine();
var modelWorkerId = null;

// Блок обработки видеокадров
function detectFrame() {
  // Если модель еще не загружена, ожидаем следующий кадр
  if (!modelWorkerId) return requestAnimationFrame(detectFrame);

  // Передаем текущий кадр с камеры в модель распознавания
  inferEngine.infer(modelWorkerId, new inferencejs.CVImage(video)).then(function(predictions) {

    // Первичная настройка canvas поверх видео
    if (!canvas_painted) {
      var video_start = document.getElementById("video1");

      canvas.top = video_start.top;
      canvas.left = video_start.left;
      canvas.style.top = video_start.top + "px";
      canvas.style.left = video_start.left + "px";
      canvas.style.position = "absolute";

      video_start.style.display = "block";
      canvas.style.display = "absolute";
      canvas_painted = true;

      // Скрываем индикатор загрузки
      var loading = document.getElementById("loading");
      loading.style.display = "none";
    }

    // Запрашиваем следующий кадр
    requestAnimationFrame(detectFrame);

    // Очищаем canvas перед новой отрисовкой
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем рамки вокруг найденных объектов
    if (video) {
      drawBoundingBoxes(predictions, ctx);
    }
  });
}

// Блок вывода результатов распознавания
function drawBoundingBoxes(predictions, ctx) {
  // Перебираем все найденные объекты
  for (var i = 0; i < predictions.length; i++) {
    var confidence = predictions[i].confidence;

    // Пропускаем объекты ниже выбранного порога уверенности
    if (confidence < user_confidence) {
      continue;
    }

    // Назначаем цвет рамки для каждого класса объекта
    if (predictions[i].class in bounding_box_colors) {
      ctx.strokeStyle = bounding_box_colors[predictions[i].class];
    } else {
      var color = color_choices[Math.floor(Math.random() * color_choices.length)];
      ctx.strokeStyle = color;
      color_choices.splice(color_choices.indexOf(color), 1);
      bounding_box_colors[predictions[i].class] = color;
    }

    // Получаем координаты найденного объекта
    var prediction = predictions[i];
    var x = prediction.bbox.x - prediction.bbox.width / 2;
    var y = prediction.bbox.y - prediction.bbox.height / 2;
    var width = prediction.bbox.width;
    var height = prediction.bbox.height;

    // Рисуем прозрачную область объекта
    ctx.rect(x, y, width, height);
    ctx.fillStyle = "rgba(0, 0, 0, 0)";
    ctx.fill();

    // Рисуем рамку и подпись объекта
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = "4";
    ctx.strokeRect(x, y, width, height);
    ctx.font = "25px Arial";
    ctx.fillText(
      prediction.class + " " + Math.round(confidence * 100) + "%",
      x,
      y - 10
    );
  }
}

// Блок подключения камеры и запуска модели
function webcamInference() {
  // Показываем сообщение о загрузке
  var loading = document.getElementById("loading");
  loading.style.display = "block";

  // Запрашиваем доступ к камере пользователя
  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "environment" } })
    .then(function(stream) {
      video = document.createElement("video");
      video.srcObject = stream;
      video.id = "video1";

      // Скрываем видео до полной загрузки
      video.style.display = "none";
      video.setAttribute("playsinline", "");

      document.getElementById("video_canvas").after(video);

      // Запускаем видеопоток
      video.onloadedmetadata = function() {
        video.play();
      };

      // Настраиваем размеры видео и canvas
      video.onplay = function() {
        height = video.videoHeight;
        width = video.videoWidth;

        video.width = width;
        video.height = height;
        video.style.width = 640 + "px";
        video.style.height = 480 + "px";

        canvas.style.width = 640 + "px";
        canvas.style.height = 480 + "px";
        canvas.width = width;
        canvas.height = height;

        document.getElementById("video_canvas").style.display = "block";
      };

      ctx.scale(1, 1);

      // Загружаем модель Roboflow и запускаем распознавание
      inferEngine.startWorker(
        MODEL_NAME,
        MODEL_VERSION,
        publishable_key,
        [{ scoreThreshold: CONFIDENCE_THRESHOLD }]
      ).then((id) => {
        modelWorkerId = id;
        detectFrame();
      });
    })
    .catch(function(err) {
      // Выводим ошибку при проблеме с камерой
      console.log(err);
    });
}

// Блок изменения Prediction Confidence
function changeConfidence() {
  user_confidence = document.getElementById("confidence").value / 100;
}

// Обновляем порог уверенности при изменении ползунка
document.getElementById("confidence").addEventListener("input", changeConfidence);

// Запускаем приложение
webcamInference();