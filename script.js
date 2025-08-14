const BOOK_URL = 'assets/book1.pdf';

let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
const scale = 1.5;

const canvas = document.getElementById('pdf-canvas');
const ctx = canvas.getContext('2d');

function renderPage(num) {
  pageRendering = true;

  pdfDoc.getPage(num).then(function (page) {
    const viewport = page.getViewport({ scale: scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
    };
    const renderTask = page.render(renderContext);

    renderTask.promise.then(function () {
      pageRendering = false;
      document.getElementById('page-info').textContent = `${pageNum} / ${pdfDoc.numPages}`;

      if (pageNumPending !== null) {
        renderPage(pageNumPending);
        pageNumPending = null;
      }
    });
  });
}

function queueRenderPage(num) {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
}

function onPrevPage() {
  if (pageNum <= 1) return;
  pageNum--;
  queueRenderPage(pageNum);
}

function onNextPage() {
  if (pageNum >= pdfDoc.numPages) return;
  pageNum++;
  queueRenderPage(pageNum);
}

// Слушатели кнопок
document.getElementById('prev-page').addEventListener('click', onPrevPage);
document.getElementById('next-page').addEventListener('click', onNextPage);

// Загрузка PDF
pdfjsLib.getDocument(BOOK_URL).promise.then(function (pdfDoc_) {
  pdfDoc = pdfDoc_;
  document.getElementById('page-info').textContent = `1 / ${pdfDoc.numPages}`;
  renderPage(pageNum);
}).catch(function (error) {
  console.error('Ошибка загрузки PDF:', error);
});
