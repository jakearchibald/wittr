import postTemplate from './../../../templates/post.hbs';
import toArray from 'lodash/lang/toArray';
import parseHTML from './../utils/parseHTML';
import humanReadableTimeDiff from './../utils/humanReadableTimeDiff';

function UserPosts(container) {
  var userPosts = this;

  this._container = container;
  this._lastTimeUpdate = 0;
  
  this._timesUpdate();
  this._openSocket();

  // update times on an interval
  setInterval(function() {
    requestAnimationFrame(function() {
      userPosts._softTimesUpdate();
    });
  }, 1000 * 30);
}

// update all the <time> elements, unless we've 
// already done so within the last 10 seconds
UserPosts.prototype._softTimesUpdate = function() {
  if (Date.now() - this._lastTimeUpdate < 1000 * 10) return;
  this._timesUpdate();
};

// update all the <time> elements
UserPosts.prototype._timesUpdate = function() {
  var postTimeEls = toArray(this._container.querySelectorAll('.post-time'));
  postTimeEls.forEach(function(timeEl) {
    var postDate = new Date(timeEl.getAttribute('datetime'));
    timeEl.textContent = humanReadableTimeDiff(postDate);
  });
  this._lastTimeUpdate = Date.now();
};

// open a connection to the server for live updates
UserPosts.prototype._openSocket = function() {
  var userPosts = this;
  var latestPost = this._container.querySelector('.post-time');

  // create a url pointing to /updates with the ws protocol
  var socketUrl = new URL('/updates', window.location);
  socketUrl.protocol = 'ws';

  if (latestPost) {
    var lastPostTime = new Date(latestPost.getAttribute('datetime'));
    socketUrl.search = 'since=' + lastPostTime.valueOf();
  }

  var ws = new WebSocket(socketUrl.href);

  // add listeners
  ws.addEventListener('message', function(event) {
    requestAnimationFrame(function() {
      var data = JSON.parse(event.data);
      userPosts._addPosts(data);
    });
  });

  ws.addEventListener('close', function(event) {
    // try and reconnect in 5 seconds
    setTimeout(function() {
      userPosts._openSocket();
    }, 5000);
  });
};

UserPosts.prototype._addPosts = function(datas) {
  // create html for new posts
  var htmlString = datas.map(function(data) {
    return postTemplate(data);
  }).join('');

  // add to the dom
  var nodes = parseHTML(htmlString);
  this._container.insertBefore(nodes, this._container.firstChild);
  
  // remove really old posts to avoid too much content
  var posts = toArray(this._container.querySelectorAll('.post'));

  posts.slice(30).forEach(function(post) {
    post.parentNode.removeChild(post);
  });

  this._timesUpdate();
};

var userPosts = new UserPosts(document.querySelector('.main'));