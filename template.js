const initStates = ['Initializing...', 'Downloading..', 'Starting..'];

// var scriptUrls = "dont modify this commented line scripts";

// var otherUrls = "dont modify this commented line others";

// var saltyFile = "dont modify this commented line saltyFile";

let totalDownloads = 0;
let completed = 0;
let progressBar;
let progressBarTitle;
let progressBarValue;

function update(up) {
  completed++;
  // progressBarValue.innerText = `${completed}/${totalDownloads}`;
  if (progressBar) {
    progressBar.style.width = `${completed / totalDownloads * 100}%`;
  }
  if (completed === totalDownloads) {
    setTimeout(function() {
      if (progressBarTitle && progressBarValue) {
        progressBarTitle.innerText = initStates[2];
        progressBarValue.innerText = ''
      }
      setTimeout(function() {
        let spContainer = document.querySelector('.splash-screen-container');
        let lContainer = document.querySelector('.loading-overlay');
        spContainer.parentNode.removeChild(spContainer)
        lContainer.parentNode.removeChild(lContainer)
      }, 1000)
    }, 1000)
  }
}

function moduleJSInjector (scriptObjects, update) {
  let totalDownloads = scriptObjects.length;
  for (let index = 0; index < totalDownloads; index++) {
    const scriptObject = scriptObjects[index];
    let script = document.createElement('script');
    for (const index in scriptObject) {
      script[index] = scriptObject[index]
    }
    script.onload = function(e) {
      update(1)
    }
    script.onerror = function(e) {
      console.log('onerror: ', script.src);
      update(-1)
    }
    document.body.append(script);
  }

}

function perUrlDownload (url) {
  return new Promise((resolve, reject) => {
    if (window.cachedBefore) {
      resolve(1)
    }
    let xhr = new XMLHttpRequest();
    xhr.open('get', url);
    xhr.onload = () => {
      update(1)
      resolve(1);
    }
    xhr.onerror = () => {
      reject(`${url} fetch error`)
    }
    xhr.send();
  })
}

function otherLinkHandler (perObject) {
  return new Promise((resolve, reject) => {
    let promiseList = [];
    if (Array.isArray(perObject.insideLinks)) {
      perObject.insideLinks.forEach(url => {
        promiseList.push(perUrlDownload(url))
      })
    }
    if (promiseList.length) {
      Promise.all(promiseList)
        .then(() => {
          // if all resolved this code will run
          let link = document.createElement('link');
          for (const key in perObject) {
            if (key === 'insideLinks') {
              continue
            }
            link[key] = perObject[key];
          }
          document.head.appendChild(link);
          resolve(1)
        })
        .catch((err) => {
          reject(err)
        })
    } else {
      let link = document.createElement('link');
      for (const key in perObject) {
        if (key === 'insideLinks') {
          continue
        }
        link[key] = perObject[key];
      }
      document.head.appendChild(link);
      resolve(1);
    }
  })
}

function otherLinksInjector (cssUrlsObjectList) {
  return new Promise((resolve, reject) => {
    if (Array.isArray(cssUrlsObjectList)) {
      let promiseObjectList = [];
      cssUrlsObjectList.forEach( perObject => {
        promiseObjectList.push(otherLinkHandler(perObject))
      })
      Promise.all(promiseObjectList)
        .then(() => {resolve(1)})
        .catch((err) => {reject(err)})
    } else {
      resolve(1)
    }
  })
}

function mayAuthenticated () {
  return window.sessionStorage && window.sessionStorage.getItem('/') && window.sessionStorage.getItem('/').length;
}

window.onload = async function() {

  try {
    await fetch(window.saltyFile, { method:'GET', cache: 'only-if-cached', mode: 'same-origin' });
    window.cachedBefore = true;
  } catch (error) {
    fetch(window.saltyFile, { method:'GET', cache: 'force-cache', mode: 'same-origin' });
    window.cachedBefore = false;
  }

  if (window.scriptUrls && Array.isArray(window.scriptUrls)) {
    totalDownloads = totalDownloads + scriptUrls.length
  }
  if (window.otherUrls && Array.isArray(window.otherUrls)) {
    window.otherUrls.forEach( obj => {
      totalDownloads = totalDownloads + (Array.isArray(obj.insideLinks) ? obj.insideLinks.length : 0)
    })
  }


  const LoadFast = function (showLoader = true) {
    let spContainer = document.querySelector('.splash-screen-container');
    let lContainer = document.querySelector('.loading-overlay');
    if (showLoader) {
      lContainer.style.display = 'flex';
    }
    if (window.otherUrls && Array.isArray(window.otherUrls)) {
      otherLinksInjector(window.otherUrls).then(() => {
        let inSeriesGetter = function (scriptUrls, finishFn) {
          let next = function (i) {
            if (i > scriptUrls.length - 1) {
              return; // on error may be
            }
            const scriptObject = scriptUrls[i];
            let script = document.createElement('script');
            for (const j in scriptObject) {
              script[j] = scriptObject[j]
            }
            script.onload = function(e) {
              if (i === scriptUrls.length - 1) {
                finishFn()
              } else {
                next(++i)
              }
            }
            document.body.append(script);
          }
          next(0);
        }
        inSeriesGetter(scriptUrls, function () {
          setTimeout(function() {
            lContainer.parentNode.removeChild(lContainer);
            spContainer.parentNode.removeChild(spContainer);
          }, 1500)
        })
      })
    }
  }
  const LoadLazy = function (){
    let spContainer = document.querySelector('.splash-screen-container');
    spContainer.style.display = 'flex';
    progressBar = document.querySelector('.progressbar');
    progressBarTitle = {innerText: 0}; // document.querySelector('.progress-title');
    progressBarValue = document.querySelector('.progress-value');
    // step 0
    progressBarTitle.innerText = initStates[0];
    progressBar.style.width = '1%';
    document.querySelector('.progress').classList.add('active');
    setTimeout(function() {
      // step 1
      progressBarTitle.innerText = initStates[1];
      progressBarValue.innerText = '';
      if (window.otherUrls && Array.isArray(window.otherUrls)) {
        otherLinksInjector(window.otherUrls)
          .then(() => {
            moduleJSInjector(scriptUrls, update);
          })
          .catch(err => {
            console.log(err)
          })
      } else {
        moduleJSInjector(scriptUrls, update);
      }
    }, 1500);
  }

  let baseHref = document.getElementsByTagName('base')[0].getAttribute('href');

  if (baseHref === '/clarity/' || window.location.pathname.includes('clarity')) {
    if (window.cachedBefore) {
      LoadFast(false)
    }
    else {
      LoadLazy()
    }
  } else {
    if (localStorage.getItem('/') || mayAuthenticated() || window.cachedBefore) {
      LoadFast()
    }
    else {
      setTimeout(function () {
        if (window.sessionStorage.getItem('/') && window.sessionStorage.getItem('/').length > 10) {
          LoadFast()
        }
        else {
          window.sessionStorage.setItem('requested_url', window.location.href);
          window.location.href = window.location.origin + '/clarity/'
        }
      }, 200)

    }
  }
}

;(function() {
  if (!sessionStorage.length) {
    // Ask other tabs for session storage
    localStorage.setItem('getSessionStorage', Date.now().toString());
  }

  window.addEventListener('storage', function(event) {
    if (event.key === 'getSessionStorage') {
      // Some tab asked for the sessionStorage -> send it
      localStorage.setItem('sessionStorage', JSON.stringify(sessionStorage));
      localStorage.removeItem('sessionStorage');

    } else if (event.key === 'sessionStorage' && !sessionStorage.length) {
      // sessionStorage is empty -> fill it
      const data = JSON.parse(event.newValue);
      for (let key in data) {
        sessionStorage.setItem(key, data[key]);
      }
    }
    else if(event.key === 'logoutFromAllTabs') {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = window.location.origin + '/clarity/'
    }
  });
})();


