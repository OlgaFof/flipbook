pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.js';

const BOOK_URL = 'assets/book1.pdf';
const container = document.getElementById('flipbook');
const loadingText = document.createElement('div');
loadingText.style.color = 'white';
loadingText.style.padding = '1rem';
loadingText.innerText = 'Загрузка страницы...';
container.appendChild(loadingText);

const pageFlip = new St.PageFlip(container, {
  width: 900,
  height: 1273,
  size: 'stretch',
  showCover: false,
  drawShadow: true,
  flippingTime: 600,
  useMouseEvents: true,
  usePortrait: true,
  autoSize: true
});

async function loadBook() {
  try {
    const pdf = await pdfjsLib.getDocument(BOOK_URL).promise;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const scale = 1.5 * dpr;
    const pages = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext('2d');

      await page.render({ canvasContext: context, viewport }).promise;

      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      pages.push(dataUrl);
    }

    pageFlip.loadFromImages(pages);
    document.getElementById('prev').addEventListener('click', () => pageFlip.flipPrev());
    document.getElementById('next').addEventListener('click', () => pageFlip.flipNext());
    pageFlip.on('flip', e => {
      document.getElementById('page').innerText = `${e.data + 1} / ${pageFlip.getPageCount()}`;
    });
    loadingText.remove();
  } catch (err) {
    container.innerHTML = `<div style="color:red;padding:1rem">Ошибка: ${err.message}</div>`;
    console.error(err);
  }
}

loadBook();
