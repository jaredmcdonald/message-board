let AppView = require('./view/app-view');

document.addEventListener('DOMContentLoaded', function initialize (event) {
  new AppView().initialize();
});
