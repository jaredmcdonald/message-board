let Request = require('./request'),
    AppView = require('./view/app-view'),
    templates = require('../../templates/dist/templates');

document.addEventListener('DOMContentLoaded', initialize);

function initialize (event) {
  new AppView(Request, templates).initialize();

  new Request('/api/v1/comment/root')
    .error(console.error.bind(console))
    .handler(renderIndex)
    .send();
}

function renderIndex (response) {
  let $content = document.querySelector('.content');

  $content.innerHTML = templates.index.render({
    items: response.data
  });

  $content.addEventListener('click', clickStoryListener.bind(undefined, $content));

  $content.addEventListener('submit', submitReplyListener);
}

function submitReplyListener (event) {
  event.preventDefault();

  var parentId = event.target.previousSibling.dataset.id;

  new Request('/api/v1/comment', 'POST')
    .error(console.error.bind(console))
    .handler(submitReplyHandler.bind(undefined, event.target.parentElement.parentElement.parentElement, parentId))
    .send({
      content: event.target[0].value,
      parentId
    });
}

function submitReplyHandler (element, parentId, response) {
  getThread(parentId, element);
}

// Add delegated click event listeners for .content here.
function clickStoryListener ($content, event) {

  if (/item-link/.test(event.target.className)) {
    event.preventDefault();
    getThread(event.target.dataset.id, $content);
  } else if (/reply-link/.test(event.target.className)) {
    event.preventDefault();
    createReplyForm(event.target);
  }

}

function createReplyForm (element) {
  element.parentElement.innerHTML += templates.submit.render();
}

function getThread (id, $container) {
  new Request(`/api/v1/comment/${id}/thread`)
    .error(console.error.bind(console))
    .handler(renderThread.bind(undefined, $container))
    .send();
}

function renderThread ($container, response) {
  $container.innerHTML = generateThreadHtml(response.data);
}

// Recursively build up nested HTML structure.
function generateThreadHtml (item) {
  if (!item.children) {
    return templates.thread.render({ item });
  }

  return templates.thread.render({
    item,
    nested : item.children.reduce((str, current) => str + generateThreadHtml(current), '')
  });
}
