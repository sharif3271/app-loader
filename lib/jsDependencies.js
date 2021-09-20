const {CSS_TEMPLATE, HTML_TEMPLATE} = require('../util/splashScreen');
const randomHsh = require('./randomHash');
const path = require('path');
const fs = require('fs');
const uglifyJs = require('uglify-es');

function handleJsDependencies(htmlContentText, targetFolderDir, cssList) {
    let temHtml = htmlContentText;
    let index_js_file_name = randomHsh() + '_main_p.js';
    // let randomNumberForQueryStringifyScriptUrls = Math.floor(Math.random() * 100000);
    let rnfqs = Math.floor(Math.random() * 100000);

    let scriptList = temHtml.match(/<script(.*?)<\/script>/g);
    if (Array.isArray(scriptList)) {
        scriptList = scriptList.map( (sc, i) => {
            let attList =
                sc.replace('<script ', '')
                    .replace('></script>', '')
                    .replace(/"/g, '')
                    .split(' ');
            let attObject = {}
            attList.forEach( att => {
                let [attKey, attValue] = att.split('=');
                if (attKey === 'src') {
                  attObject[attKey] = attValue
                } else {
                  attObject[attKey] = attValue ? attValue : 1
                }
            });
            if(scriptList.length -1 === i) {
                temHtml = temHtml.replace(sc, `<script src="${index_js_file_name}" async defer></script>`)
            } else {
                temHtml = temHtml.replace(sc, '')
            }
            if (!attObject.nomodule) {
              return attObject;
            }

        }).filter(scrt => scrt)
    }
    // --> scripts extracted to scriptList

    let jsTemplate = fs.readFileSync(path.resolve(__dirname + '/../template.js'), 'utf-8');
    jsTemplate = jsTemplate.replace(/\/\/(.*?)scripts";/g, `var scriptUrls = JSON.parse('${JSON.stringify(scriptList)}')`);
    // --> index script created
    jsTemplate = jsTemplate.replace(/\/\/(.*?)line others";/g,`var otherUrls = JSON.parse('${JSON.stringify(cssList)}')`);
    // --> css list injected

    // add saltyFile.js to to track the cache
    const targetFolderFileList = fs.readdirSync(targetFolderDir);
    for(const fileName of targetFolderFileList) {
        if (fileName.match(/(.*?)_temp.js/g)) {
            fs.unlinkSync(path.resolve(targetFolderDir + '/' + fileName))
            break;
        }
    }
    // delete main file js
    for(const fileName of targetFolderFileList) {
      if (fileName.match(/(.*?)_main_p.js/g)) {
        fs.unlinkSync(path.resolve(targetFolderDir + '/' + fileName))
        break;
      }
    }
    let saltyFileName = randomHsh() + '_temp.js';
    fs.writeFileSync(path.resolve(targetFolderDir + `/${saltyFileName}`),'(function () { console.log("Don`t modify or delete this file.") })', {flag: 'a+'});
    jsTemplate = jsTemplate.replace(/\/\/(.*?)line saltyFile";/g,`var saltyFile = "${saltyFileName}"`);



    let pathToIndexJs = path.resolve(targetFolderDir + `/${index_js_file_name}`)
    let uglified = uglifyJs.minify(jsTemplate);
    fs.writeFileSync(pathToIndexJs, uglified.error ? jsTemplate : uglified.code, { flag: 'a+'});
    if (uglified.error) {
      console.log('error on uglify js files');
      process.exit(1);
    }
    // console.log(jsTemplate)
    console.log(`index.js generated and saved at ${targetFolderDir}`)
    // --> index script saved



    temHtml = temHtml
        .replace('</head>', `
        ${CSS_TEMPLATE}
        </head>
        `)
        .replace('</body>', `
        ${HTML_TEMPLATE}
        </body>
        `)
    // --> index.html completed

    return temHtml;
}

module.exports = handleJsDependencies;
