import toArray from 'lodash/lang/toArray';

const settingsForm = document.querySelector('.settings-form');

settingsForm.addEventListener('change', event => {
  fetch(settingsForm.action, {
    method: settingsForm.method,
    body: new FormData(settingsForm)
  });
});
