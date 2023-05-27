// Q: When would you need me?
// A: You split your screen into more than two parts.
//
// Q: Where to execute these code?
// A: Chrome dev tool console.
//
a = document.querySelector("#masthead-container");
a.style.display = 'none';

a = document.querySelector("#below");
a.style.display = 'none';

a = document.querySelector("#page-manager");
a.style.marginTop = '0';

a = document.querySelector("#player-container-inner");
a.style.paddingTop = (window.innerHeight) + 'px';

a = document.querySelector("#speedyg");
a.style.display = 'none';

a = document.querySelector("#player-container-outer");
a.style.maxWidth = '100%';

a = document.querySelector("#primary.ytd-watch-flexy");
a.style.padding = 0;
a.style.margin = 0;

// 以下代码需要等广告结束才能执行
a = document.querySelector("#movie_player > div.html5-video-container > video");
b = document.querySelector("#player-container-inner");

oriWidth = a.offsetWidth;
oriHeight = a.offsetHeight;
newWidth = 0;
newHeight = 0;
if (oriWidth > oriHeight) {
  newHeight = window.innerHeight;
  newWidth = (oriWidth / oriHeight) * newHeight;
} else {
  newWidth = b.offsetWidth;
  newHeight = (oriHeight / oriWidth) * newWidth;
}
a.style.width = newWidth + 'px';
a.style.height = newHeight + 'px';
a.style.right = 0;
a.style.margin = '0 auto';

a = document.querySelector("#movie_player > div.ytp-iv-video-content");
a.style.right = 0;
a.style.margin = '0 auto';

a = document.querySelector("#movie_player > div.ytp-chrome-bottom");
a.style.right = 0;
a.style.margin = '0 auto';

a = document.querySelector("#movie_player > div.html5-video-container > video");
a.style.right = 0;
a.style.margin = '0 auto';

a = document.querySelector("#movie_player > div.ytp-chrome-bottom");
a.style.width = newWidth + 'px';
a.style.left = 0;
a.style.right = 0;
a.style.margin = '0 auto';

a = document.querySelector("#movie_player > div.ytp-chrome-bottom > div.ytp-progress-bar-container > div.ytp-progress-bar > div.ytp-chapters-container > div");
a.style.width = newWidth + 'px';

a = document.querySelector("#movie_player > div.ytp-chrome-bottom > div.ytp-progress-bar-container > div.ytp-heat-map-container > div.ytp-heat-map-chapter");
a.style.width = newWidth + 'px';
