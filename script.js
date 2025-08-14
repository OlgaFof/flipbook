const totalPages = 12; // Укажи точное количество страниц (изображений)

const flipbook = $("#flipbook");

// Генерируем страницы
for (let i = 1; i <= totalPages; i++) {
  const img = `<div class="page"><img src="pages/page${i}.jpg" style="width:100%; height:100%; object-fit:cover;" /></div>`;
  flipbook.append(img);
}

// Инициализация книги
flipbook.turn({
  width: 1200,
  height: 800,
  autoCenter: true,
  elevation: 50,
  gradients: true,
  display: 'double', // Развороты по две
  pages: totalPages
});

// Кнопки
document.getElementById("prev").onclick = () => flipbook.turn("previous");
document.getElementById("next").onclick = () => flipbook.turn("next");
