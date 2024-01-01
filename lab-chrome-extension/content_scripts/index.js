document.addEventListener('keyup', function(event) {
  if (event.keyCode === 72) {
    event.preventDefault();
    document.getElementById('chrome-extension-lab').classList.toggle('hidden');
  }
});

const link = document.createElement('link');
link.href = chrome.runtime.getURL('content_scripts/style.css');
link.type = 'text/css';
link.rel = 'stylesheet';
document.head.appendChild(link);

setTimeout(async () => {
  const response = await fetch(chrome.runtime.getURL('content_scripts/injected.html'));
  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  document.body.appendChild(doc.body.firstChild);
}, 0);
