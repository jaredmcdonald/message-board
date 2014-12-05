let Request = require('./request'),
    templates = require('../../templates/dist/templates');

document.addEventListener('DOMContentLoaded', initialize);

function initialize (event) {
  new Request('/api/v1/comment/root')
    .error(console.error.bind(console))
    .success(renderIndex)
    .send();
}

function renderIndex (data) {
  let $content = document.querySelector('.content');
  $content.innerHTML = templates.index.render({
    items: data
  })

  $content.addEventListener('click', clickStoryListener)
}

// Add delegated event listeners here.
function clickStoryListener (event) {
  if (/item/.test(event.target.className)) {
    getThread(event.target.dataset.id)
  }
}

function getThread (id) {
  new Request(`/api/v1/comment/${id}/thread`)
    .error(console.error.bind(console))
    .success(renderThread)
    .send();
}

function renderThread (thread) {
  let $content = document.querySelector('.content');
  document.querySelector('.content').innerHTML = generateThreadHtml(thread);
}

// Recursively build up nested HTML structure.
function generateThreadHtml (item) {
  if (!item.children) {
    return templates.thread.render({ content : item.content });
  }

  return templates.thread.render({
    content : item.content,
    nested : item.children.reduce((str, current) => str + generateThreadHtml(current), '')
  });
}
