const path = require('path');
const fs = require('fs');

module.exports = function stylesheetsHandler (htmlContentText, targetFolderDir) {
    let tempHtml = htmlContentText;

    let linksToCSSs = tempHtml.match(/<link(.*?)>/g);
    let linksToCSSsObjectList = [];
    if (Array.isArray(linksToCSSs)) {
        linksToCSSsObjectList = linksToCSSs
            .filter((link) => link.match(/rel=(["|'])stylesheet(['|"])/g))
            .map((link, i, array) => {
                    let attributeListOfLink
                        = link
                        .replace('<link ', '')
                        .replace('>', '')
                        .replace(/"/g, '')
                        .replace(/'/g, '')
                        .split(' ');
                    let attributeObject = {};
                    attributeListOfLink.forEach((att) => {
                        [attKey, attValue] = att.split('=')
                        attributeObject[attKey] = attValue ? attValue : 1;
                    })
                    tempHtml = tempHtml.replace(link,'');
                    return attributeObject;
                }
            );
    }
    else {
        console.log(' --> no css link found in index.html file');
        return [tempHtml, null];
    }

    // read css files
    linksToCSSsObjectList.forEach( css => {
        let pathToCss = path.resolve(targetFolderDir + '/' + css.href);
        let cssContent = fs.readFileSync(pathToCss, 'utf-8');
        css['insideLinks'] = cssContent.match(/url\((.*?)\)/g)
            .filter( item => !(item.match(' ') || item.match(/data:/g)))
            .map( item => item.replace('url(','').replace(')',''))
    })

    return [tempHtml, linksToCSSsObjectList]
}




/*let XHRBaseJSInjector = async function(url) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Cache-Control', 'max-stale')
    xhr.onload = function () {
        if (xhr.status === 200 || xhr.status === 300) { // 304 for cached content
            let script = document.createElement('script');
            script.async = true;
            script.defer = true;
            script.src = url;
            document.body.appendChild(script)
        }

    }
    let xxx = 0
    xhr.onprogress = function (event) {
        if (!xxx) {
            xxx++
            console.log(event)
        }
        if (event.lengthComputable) {
            // console.log(`Received ${url}: ${event.loaded} of ${event.total} bytes`);
        } else {
            // console.log(`Received ${url}: ${event.loaded} bytes`); // no Content-Length
        }
    }
    xhr.onerror = function (error) {
        console.log('error on get script ', url, ': ', error);
        return XHRBaseJSInjector(url);
    }
    xhr.send();

}*/
