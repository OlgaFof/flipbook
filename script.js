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
  pdfDoc.getPage(num).then(page => {
    const viewport = page.getViewport({ scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };

    const renderTask = page.render(renderContext);

    renderTask.promise.then(() => {
      pageRendering = false;
      if (pageNumPending !== null) {
        renderPage(pageNumPending);
        pageNumPending = null;
      }
    });

    document.getElementById('page-info').textContent = `${num} / ${pdfDoc.numPages}`;
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

if (document.getElementById('prev-page')) {
  document.getElementById('prev-page').addEventListener('click', onPrevPage);
}

if (document.getElementById('next-page')) {
  document.getElementById('next-page').addEventListener('click', onNextPage);
}

pdfjsLib.getDocument(BOOK_URL).promise.then(pdfDoc_ => {
  pdfDoc = pdfDoc_;
  renderPage(pageNum);
}).catch(error => {
  console.error('Ошибка загрузки PDF:', error);
  const errorMessage = document.createElement('div');
  errorMessage.textContent = 'Не удалось загрузить книгу. Проверьте путь к файлу.';
  errorMessage.style.color = 'red';
  document.body.appendChild(errorMessage);
});
