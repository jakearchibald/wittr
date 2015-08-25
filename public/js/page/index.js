import postTemplate from './../../../templates/post.hbs';
import toArray from 'lodash/lang/toArray';
import parseHTML from './../utils/parseHTML';
import humanReadableTimeDiff from './../utils/humanReadableTimeDiff';

function UserPosts(container) {
  var userPosts = this;

  this._container = container;
  this._scroller = container.querySelector('.posts');
  this._lastTimeUpdate = 0;
  this._newPostAlert = container.querySelector('.posts-alert');
  this._scrollUpdatePending = false;
  
  this._timesUpdate();
  this._openSocket();

  // update times on an interval
  setInterval(function() {
    requestAnimationFrame(function() {
      userPosts._softTimesUpdate();
    });
  }, 1000 * 30);

  // listen to scrolling
  this._scroller.addEventListener('scroll', function(event) {
    if (userPosts._scrollUpdatePending) return;
    userPosts._scrollUpdatePending = true;
    requestAnimationFrame(function() {
      userPosts._onScroll();
      userPosts._scrollUpdatePending = false;
    });
  });
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
      userPosts._onSocketMessage(event.data);
    });
  });

  ws.addEventListener('close', function(event) {
    // try and reconnect in 5 seconds
    setTimeout(function() {
      userPosts._openSocket();
    }, 5000);
  });
};

// called when the web socket sends message data
UserPosts.prototype._onSocketMessage = function(data) {
  var messages = JSON.parse(data);
  this._addPosts(messages);
};

// called as the scroll position changes
UserPosts.prototype._onScroll = function() {
  if (this._scroller.scrollTop < 60) {
    this._newPostAlert.classList.remove('active');
  }
};

// processes an array of objects representing messages,
// creates html for them, and adds them to the page
UserPosts.prototype._addPosts = function(messages) {
  // create html for new posts
  var oldLatestPost = this._scroller.querySelector('.post');
  var oldLatestPostOldPosition = oldLatestPost && oldLatestPost.getBoundingClientRect();
  var htmlString = messages.map(function(message) {
    return postTemplate(message);
  }).join('');

  // add to the dom
  var nodes = parseHTML(htmlString);
  this._scroller.insertBefore(nodes, this._scroller.firstChild);
  
  // remove really old posts to avoid too much content
  var posts = toArray(this._scroller.querySelectorAll('.post'));

  posts.slice(30).forEach(function(post) {
    post.parentNode.removeChild(post);
  });

  // move scrolling position to make it look like nothing happened
  if (oldLatestPost) {
    var oldLatestPostNewPosition = oldLatestPost.getBoundingClientRect();
    this._scroller.scrollTop = this._scroller.scrollTop + (oldLatestPostNewPosition.top - oldLatestPostOldPosition.top);
  }

  this._newPostAlert.classList.add('active');
  this._timesUpdate();
};

var userPosts = new UserPosts(document.querySelector('.main'));