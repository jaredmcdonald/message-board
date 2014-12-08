let Request = require('./request'),
    templates = require('../../templates/dist/templates');

document.addEventListener('DOMContentLoaded', initialize);

function initialize (event) {
  new Request('/api/v1/comment/root')
    .error(console.error.bind(console))
    .success(renderIndex)
    .send();

  watchUserDetailsEvents();
}

function renderIndex (response) {
  let $content = document.querySelector('.content');

  $content.innerHTML = templates.index.render({
    items: response.data
  });

  $content.addEventListener('click', clickStoryListener);
}

function watchUserDetailsEvents () {
  document.getElementById('userDetails').addEventListener('click', function (event) {

    if (/login/.test(event.target.className)) {
      event.preventDefault();
      renderLoginForm();

    } else if (/logout/.test(event.target.className)) {
      event.preventDefault();
      logout();
    }

  });
}

function renderLoginForm () {
  document.querySelector('.content').innerHTML = templates.login.render();

  var $form = document.getElementById('loginForm');
  document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    login({
      username : event.target[0].value,
      password : event.target[1].value
    })

  })
}

function login (data) {
  new Request('/api/v1/user/login', 'POST')
    .error(console.error.bind(console))
    .success(function () { console.log('login success')})
    .send(data);
}

function logout () {
  new Request('/api/v1/user/logout', 'POST')
    .error(console.error.bind(console))
    .success(function () { console.log('login success')})
    .send({});
}

// Add delegated click listeners for .content here.
function clickStoryListener (event) {

  if (/item-link/.test(event.target.className)) {
    event.preventDefault();
    getThread(event.target.dataset.id);
  }

}

function getThread (id) {
  new Request(`/api/v1/comment/${id}/thread`)
    .error(console.error.bind(console))
    .success(renderThread)
    .send();
}

function renderThread (response) {
  document.querySelector('.content').innerHTML = generateThreadHtml(response.data);
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
