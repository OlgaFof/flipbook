const BOOK_URL = 'assets/book1.pdf';

let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
const scale = 1.2; // Уменьшен масштаб для влезания страниц

const canvasLeft = document.createElement('canvas');
const canvasRight = document.createElement('canvas');
canvasLeft.id = 'pdf-canvas-left';
canvasRight.id = 'pdf-canvas-right';

const container = document.getElementById('pdf-canvas-container');
container.innerHTML = '';
container.appendChild(canvasLeft);
container.appendChild(canvasRight);

const ctxLeft = canvasLeft.getContext('2d');
const ctxRight = canvasRight.getContext('2d');

function renderPagePair(startPage) {
  pageRendering = true;
  const promises = [pdfDoc.getPage(startPage)];

  if (startPage + 1 <= pdfDoc.numPages) {
    promises.push(pdfDoc.getPage(startPage + 1));
  }

  Promise.all(promises).then(pages => {
    pages.forEach((page, index) => {
      const viewport = page.getViewport({ scale });
      const canvas = index === 0 ? canvasLeft : canvasRight;
      const ctx = index === 0 ? ctxLeft : ctxRight;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };

      page.render(renderContext);
    });

    pageRendering = false;
    document.getElementById('page-info').textContent = `${startPage}–${Math.min(startPage + 1, pdfDoc.numPages)} / ${pdfDoc.numPages}`;

    if (pageNumPending !== null) {
      renderPagePair(pageNumPending);
      pageNumPending = null;
    }
  });
}

function queueRenderPagePair(num) {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPagePair(num);
  }
}

function onPrevPage() {
  if (pageNum <= 2) return;
  pageNum -= 2;
  queueRenderPagePair(pageNum);
}

function onNextPage() {
  if (pageNum + 1 >= pdfDoc.numPages) return;
  pageNum += 2;
  queueRenderPagePair(pageNum);
}

// Кнопки
if (document.getElementById('prev-page')) {
  document.getElementById('prev-page').addEventListener('click', onPrevPage);
}

if (document.getElementById('next-page')) {
  document.getElementById('next-page').addEventListener('click', onNextPage);
}

// Загрузка PDF
pdfjsLib.getDocument(BOOK_URL).promise.then(pdfDoc_ => {
  pdfDoc = pdfDoc_;
  pageNum = 1;
  renderPagePair(pageNum);
}).catch(error => {
  console.error('Ошибка загрузки PDF:', error);
  const errorMessage = document.createElement('div');
  errorMessage.textContent = 'Не удалось загрузить книгу. Проверьте путь к файлу.';
  errorMessage.style.color = 'red';
  document.body.appendChild(errorMessage);
});
