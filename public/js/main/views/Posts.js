import postTemplate from './../../../../templates/post.hbs';
import toArray from 'lodash/lang/toArray';
import parseHTML from './../../utils/parseHTML';
import humanReadableTimeDiff from './../../utils/humanReadableTimeDiff';

const maxMessages = 30;

export default function Posts(container) {
  var posts = this;

  this._container = container;
  this._scroller = container.querySelector('.posts');
  this._lastTimeUpdate = 0;
  this._newPostAlert = container.querySelector('.posts-alert');
  this._scrollUpdatePending = false;
  
  this._timesUpdate();

  // update times on an interval
  setInterval(function() {
    requestAnimationFrame(function() {
      posts._softTimesUpdate();
    });
  }, 1000 * 30);

  // listen to scrolling
  this._scroller.addEventListener('scroll', function(event) {
    if (posts._scrollUpdatePending) return;
    posts._scrollUpdatePending = true;
    requestAnimationFrame(function() {
      posts._onScroll();
      posts._scrollUpdatePending = false;
    });
  });
}

// update all the <time> elements, unless we've 
// already done so within the last 10 seconds
Posts.prototype._softTimesUpdate = function() {
  if (Date.now() - this._lastTimeUpdate < 1000 * 10) return;
  this._timesUpdate();
};

// update all the <time> elements
Posts.prototype._timesUpdate = function() {
  var postTimeEls = toArray(this._container.querySelectorAll('.post-time'));
  postTimeEls.forEach(function(timeEl) {
    var postDate = new Date(timeEl.getAttribute('datetime'));
    timeEl.textContent = humanReadableTimeDiff(postDate);
  });
  this._lastTimeUpdate = Date.now();
};

// called as the scroll position changes
Posts.prototype._onScroll = function() {
  if (this._scroller.scrollTop < 60) {
    this._newPostAlert.classList.remove('active');
  }
};

// processes an array of objects representing messages,
// creates html for them, and adds them to the page
Posts.prototype.addPosts = function(messages) {
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

  posts.slice(maxMessages).forEach(function(post) {
    post.parentNode.removeChild(post);
  });

  // move scrolling position to make it look like nothing happened
  if (oldLatestPost) {
    var oldLatestPostNewPosition = oldLatestPost.getBoundingClientRect();
    this._scroller.scrollTop = this._scroller.scrollTop + (Math.round(oldLatestPostNewPosition.top) - Math.round(oldLatestPostOldPosition.top));
    this._newPostAlert.classList.add('active');
  }

  this._timesUpdate();
};

// get the date of the latest post, or null if there are no posts
Posts.prototype.getLatestPostDate = function(messages) {
  var timeEl = this._container.querySelector('.post-time');
  if (!timeEl) return null;
  return new Date(timeEl.getAttribute('datetime'));
};

// Any there any posts in the view?
Posts.prototype.showingPosts = function(messages) {
  return !!this._container.querySelector('.post');
};