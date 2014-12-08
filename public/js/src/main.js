let Request = require('./request'),
    templates = require('../../templates/dist/templates');

document.addEventListener('DOMContentLoaded', initialize);

function initialize (event) {
  new Request('/api/v1/comment/root')
    .error(console.error.bind(console))
    .success(renderIndex)
    .send();

  new Request('/api/v1/user/login')
    .error(console.error.bind(console))
    .success(initUserDetails)
    .send();
}

function initUserDetails (response) {
  let $details = document.querySelector('.user-details');
  watchUserDetailsEvents($details);
  renderUserDetails(response);
}

function renderUserDetails (response) {
  document.querySelector('.user-details').innerHTML = templates.login.render(response.data);
}

function renderIndex (response) {
  let $content = document.querySelector('.content');

  $content.innerHTML = templates.index.render({
    items: response.data
  });

  $content.addEventListener('click', clickStoryListener);
}

function watchUserDetailsEvents ($details) {
  $details.addEventListener('click', function (event) {

    if (/logout/.test(event.target.className)) {
      event.preventDefault();
      logout();
    }

  });

  $details.addEventListener('submit', function (event) {
    event.preventDefault();

    login({
      username : event.target[0].value,
      password : event.target[1].value
    });
  })
}

function login (data) {
  new Request('/api/v1/user/login', 'POST')
    .error(console.error.bind(console))
    .success(loginHandler)
    .send(data);
}

function loginHandler (response) {
  if (response.statusCode === 401) {
    response.data = {
      authFailed: true,
      loggedIn: false
    }
  }
  renderUserDetails(response);
}

function logout () {
  new Request('/api/v1/user/logout', 'POST')
    .error(console.error.bind(console))
    .success(loginHandler.bind(undefined, { data : { authFailed: false, loggedIn: false }}))
    .send({});
}

// Add delegated click listeners for .content here.
function clickStoryListener (event) {

  if (/item-link/.test(event.target.className)) {
    event.preventDefault();
    getThread(event.target.dataset.id);
  } else if (/reply-link/.test(event.target.className)) {
    event.preventDefault();
    createReplyForm(event.target);
  }

}

function createReplyForm (element) {
  element.parentElement.innerHTML += templates.submit.render({});
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
