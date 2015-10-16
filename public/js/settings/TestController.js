import MaterialTextfield from './mdl/textfield';
import simpleTransition from 'simple-transition';
import SpinnerView from './views/spinner';

const appOrigin = new URL(location.href);
appOrigin.port = self.config.appPort;

function figureOutConnectionType() {
  const start = performance.now();

  return Promise.race([
    fetch(new URL('/ping', appOrigin)),
    new Promise(r => setTimeout(r, 4000))
  ]).then(_ => {
    const duration = performance.now() - start;

    if (duration < 3000) {
      return 'perfect';
    }
    if (duration < 3500) {
      return 'slow';
    }
    return 'lie-fi';
  }, _ => {
    return 'offline';
  });
}

const tests = {
  demo() {
    return Promise.resolve(["Yep, the demo's working!", 'demo.gif', true]);
  },
  offline() {
    return figureOutConnectionType().then(type => {
      if (type == 'offline') {
        return ["Yep! The server is totally dead!", '1.gif', true];
      }
      return ["Hmm, no, looks like the server is still up", 'nope.gif', false];
    });
  },
  'lie-fi': function() {
    return figureOutConnectionType().then(type => {
      switch(type) {
        case "lie-fi":
          return ["Yeeeep, that's lie-fi alright.", '2.gif', true];
        case "offline":
          return ["Hmm, no, looks like the server is down.", 'nope.gif', false];
        default:
          return ["The server responded way too fast for lie-fi.", 'not-quite.gif', false];
      }
    });
  }
};

export default class TestController {
  constructor(container) {
    this._memeContainer = container.querySelector('.meme-container');
    this._memeImgContainer = container.querySelector('.meme-img-container');
    this._feedbackText = container.querySelector('.feedback-text');
    this._form = container.querySelector('.test-form');
    this._currentMemeImg = null;
    this._spinner = new SpinnerView();

    this._memeContainer.appendChild(this._spinner.container);

    new MaterialTextfield(container.querySelector('.mdl-js-textfield'));
    this._form.addEventListener('submit', e => this._onSubmit(e));
    this._form.testId.addEventListener('input', e => this._onInput(e));

  }

  _onInput(event) {
    if (!this._form.testId.value.trim()) {
      this._removeCurrentFeedback();
    }
  }

  _onSubmit(event) {
    event.preventDefault();
    const val = this._form.testId.value.trim().toLowerCase();
    this._form.testId.blur();
    
    this._removeCurrentFeedback();
    simpleTransition(this._memeContainer, {opacity: 1}, 0.3);
    this._spinner.show(800);

    if (!tests[val]) {
      this._displayFeedback("Didn't recognise that test ID", 'mistake.gif', false);
      return;
    }

    tests[val]().then(args => {
      this._displayFeedback(...args);
    }).catch(err => {
      this._displayFeedback("Oh dear, something went really wrong", 'mistake.gif', false);
      throw err;
    });
  }

  _removeCurrentFeedback() {
    this._feedbackText.textContent = '';
    this._memeContainer.style.opacity = '';
    this._spinner.hide();

    if (this._currentMemeImg) {
      URL.revokeObjectURL(this._currentMemeImg.href);
      this._memeImgContainer.removeChild(this._currentMemeImg);
      this._currentMemeImg = undefined;
    }
  }

  _displayFeedback(text, url, winning) {
    this._feedbackText.textContent = text;
    this._spinner.hide();

    if (winning) {
      this._feedbackText.classList.remove('fail');
    }
    else {
      this._feedbackText.classList.add('fail');
    }

    return fetch(`/imgs/test-memes/${url}`).then(r => r.blob()).then(blob => {
      this._currentMemeImg = new Image();
      // hahaha, yes, I know
      this._currentMemeImg.src = URL.createObjectURL(blob.slice(1));
      this._memeImgContainer.appendChild(this._currentMemeImg);
    });
  }
}