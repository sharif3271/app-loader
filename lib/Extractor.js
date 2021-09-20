const path = require('path');
const fs = require('fs');
const handleJsDependencies = require('./jsDependencies');
const stylesheetsHandler = require('./stylesheetsHandler');

const Extractor = (targetFolderDir, options) => {

    // some checks and get pure html content
    let pure = path.resolve(targetFolderDir + '/index.html.pure')
    let notPure = path.resolve(targetFolderDir + '/index.html') // checks done before to existence of html index
    if (!fs.existsSync(pure)) {
        fs.copyFileSync(notPure, pure);
    }
    let htmlContentPure = fs.readFileSync(pure, 'utf-8');

    // handle stylesheets and inside urls to fonts and SVGs
    let [htm, cssList] = stylesheetsHandler(htmlContentPure, targetFolderDir);

    // handle javascript dependencies.
    let handledHtmlContent = handleJsDependencies(htm, targetFolderDir, cssList);

    if (fs.existsSync(notPure)) {
        fs.unlinkSync(notPure);
    }
    fs.writeFileSync(notPure, handledHtmlContent, { flag: 'a+'});

    console.log(`index.html generated and saved at ${notPure}`)
    console.log(`build successfully!!!`)


}

module.exports = Extractor
