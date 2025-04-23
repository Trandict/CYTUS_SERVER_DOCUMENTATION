async function loadSubPages() {
  const frontImage = document.querySelector('.front-image');
  const buttonContainer = frontImage.querySelector('.button-scroll-area');
  const body = document.body;

  try {
    const indexRes = await fetch('./subpages/index.json?_=${Date.now()}');
    const pages = await indexRes.json();

    pages.forEach(async (page, idx) => {
      const res = await fetch(`./subpages/${page.file}`);
      const config = await res.json();

      const btnTemplate = document.querySelector('.nav-button');
      const btn = btnTemplate.cloneNode(true);
      btn.style.left = config.buttonPosition.left;
      if (config.buttonPosition.top) {
        btn.style.top = config.buttonPosition.top;
      }
      const img = btn.querySelector('img');
      img.src = config.icon;
      const span = btn.querySelector('span');
      span.innerHTML = config.title.replace(/=/g, "<br>");;
      btn.style.display = 'block';

      btn.onclick = () => {
        document.querySelector('.front-image').style.opacity = 0;
        playSound(clickSound);
		if (config.bgm) {
		if (!window.pageBGM) {
		  window.pageBGM = new Audio();
		  window.pageBGM.loop = true;
		}
		pageBGM.src = config.bgm;
		pageBGM.volume = 0.8;
		pageBGM.play();
		bgMusic.pause();
	  }
        setTimeout(() => {
          document.getElementById(config.id).style.display = 'block';
          document.getElementById(config.id).style.opacity = 1;
          document.getElementById('pageTitle').innerText = config.pageTitle || config.title;
        }, 500);
      };

      buttonContainer.appendChild(btn);

      const targetPage = document.createElement('div');
      targetPage.className = 'targetPage';
      targetPage.id = config.id;
      targetPage.innerHTML = `
        <div class="front-image">
		${config.characterIcon ? `<img src="${config.characterIcon}" class="char" />` : ""}
          <img src="./res/OS.png">
          <div class="page-title">${config.pageTitle}</div>
          <div class="sectionA">${config.contentHTML}</div>
	
        </div>
        <img src="./res/back_button.png" class="back-button" onclick="hidePage('${config.id}')">
      `;
      body.appendChild(targetPage);
	  
// 图片全屏预览
targetPage.querySelectorAll('.img-template img').forEach((img, index) => {
  img.addEventListener('click', () => {
    const fullscreen = document.createElement('div');
    fullscreen.className = 'full-screen';
    fullscreen.style.opacity = 0;
    fullscreen.style.transition = 'opacity 0.3s';
    fullscreen.innerHTML = `
      <img src="${img.src}">
      <img src="./res/back_button.png" class="back-button" />
    `;
    document.body.appendChild(fullscreen);
    playSound(FSclickSound);

    // 延迟触发淡入动画
    requestAnimationFrame(() => {
      fullscreen.style.display = 'flex';
      fullscreen.style.opacity = 1;
    });

    fullscreen.querySelector('.back-button').addEventListener('click', () => {
      playSound(FSbackSound);
      fullscreen.style.opacity = 0;
      setTimeout(() => {
        fullscreen.remove();
      }, 300);
    });

  });
});

// 视频全屏预览
targetPage.querySelectorAll('.video-template img').forEach((img, index) => {
  img.addEventListener('click', () => {
    const videoSrc = img.getAttribute('data-src') || img.src.replace('.png', '.mp4');
    const fullscreen = document.createElement('div');
    fullscreen.className = 'full-screen';
    fullscreen.style.opacity = 0;
    fullscreen.style.transition = 'opacity 0.3s';
    fullscreen.innerHTML = `
      <video controls autoplay>
        <source src="${videoSrc}" type="video/mp4">
      </video>
      <img src="./res/back_button.png" class="back-button" />
    `;
    document.body.appendChild(fullscreen);
    playSound(FSclickSound);

    requestAnimationFrame(() => {
      fullscreen.style.display = 'flex';
      fullscreen.style.opacity = 1;
    });

    fullscreen.querySelector('.back-button').addEventListener('click', () => {
      playSound(FSbackSound);
      fullscreen.style.opacity = 0;
      setTimeout(() => {
        fullscreen.remove();
        bgMusic.muted = false;
      }, 300);
    });

    bgMusic.muted = true;
  });
});



      targetPage.querySelectorAll('.action-box').forEach(box => {
        box.style.cursor = 'pointer';
        box.addEventListener('click', () => {
          const soundSrc = box.getAttribute('data-sound');
          if (soundSrc) {
            const audio = new Audio(soundSrc);
            audio.play();
          }
        });
      });
    }); // ← 结束 forEach
  } catch (err) {
    console.error('加载子页面失败:', err);
  } // ✅ 这里是你之前漏掉的括号
}



function playSound(audioElement) {
  if (!audioElement) return;

  const source = audioElement.querySelector('source');
  const src = source ? source.src : audioElement.src;

  if (!src) return;

  const temp = new Audio(src);
  temp.volume = audioElement.volume;
  temp.play().catch(() => {});
}





document.addEventListener('DOMContentLoaded', () => {
	
  // 初始化背景音乐
  const bgMusic = document.getElementById('bgMusic');
  const clickSound = document.getElementById('clickSound');
  const backSound = document.getElementById('backSound');
  const FSclickSound = document.getElementById('FSclickSound');
  const FSbackSound = document.getElementById('FSbackSound');

  bgMusic.volume = 0.8;
  bgMusic.muted = false;

  // 尝试播放音乐（有些浏览器需要用户交互）
  bgMusic.play().catch(err => {
    console.warn('背景音乐自动播放失败，可能需要用户交互：', err);
  });

  // 自动播放背景视频
  const bgVideo = document.querySelector('.bg-video');
  if (bgVideo) {
    bgVideo.play().catch(err => {
      console.warn('背景视频自动播放失败：', err);
    });
  }

  // 禁止缩放
  document.addEventListener('touchmove', e => { if (e.scale !== 1) e.preventDefault(); }, { passive: false });
  window.addEventListener('keydown', e => {
    if (e.ctrlKey && ['+', '-', '0'].includes(e.key)) e.preventDefault();
  });
  window.addEventListener('wheel', e => {
    if (e.ctrlKey) e.preventDefault();
  }, { passive: false });

  // 示例按钮事件
  const menuButton = document.getElementById('menuButton');
  if (menuButton) {
    menuButton.onclick = () => {
      playSound(clickSound);
      document.querySelector('.front-image').style.opacity = 0;
      setTimeout(() => {
        document.getElementById('targetPage').style.display = 'block';
        document.getElementById('targetPage').style.opacity = 1;
        document.getElementById('pageTitle').innerText = '2018_02_25_9A.log';
      }, 500);
    };
  }

  // 图片全屏预览
  const imgThumb = document.getElementById('imgThumb');
  if (imgThumb) {
    imgThumb.onclick = () => {
      document.getElementById('imgDetail1').style.display = 'flex';
    };
  }

  const videoThumb = document.getElementById('videoThumb');
  if (videoThumb) {
    videoThumb.onclick = () => {
      document.getElementById('videoDetail1').style.display = 'flex';
      bgMusic.muted = true;
    };
  }

  window.closeDetail = function(id) {
    document.getElementById(id).style.display = 'none';
    bgMusic.muted = false;
  };

  window.hidePage = function(pageId) {
    playSound(backSound);
    const page = document.getElementById(pageId);
    page.style.opacity = 0;
	if (window.pageBGM) {
    pageBGM.pause();
    pageBGM.src = "";
	bgMusic.play();
  }
    setTimeout(() => {
      page.style.display = 'none';
      document.querySelector('.front-image').style.opacity = 1;
      document.getElementById('pageTitle').innerText = '[CLIENT DOCUMENTATION]';
    }, 500);
  };

  // 加载子页面按钮和内容
  loadSubPages();
});
