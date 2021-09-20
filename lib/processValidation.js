const path = require('path');
const fs = require('fs');

function processValidation () {
    const rootDir = process.cwd();
    const targetFolderName = process.argv.slice(2)[0];
    const targetFolderDir = path.resolve(rootDir + '/' + (targetFolderName ? targetFolderName : ''));
    console.log(`Starting processing of dir: ${targetFolderDir}  ...`);
    let hasIndexHtml = false;
    const targetFolderFileList = fs.readdirSync(targetFolderDir);
    for(const fileName of targetFolderFileList) {
        if (fileName === 'index.html') {
            hasIndexHtml = true
            break;
        }
    }

    if (hasIndexHtml) {
        console.log('targeting index.html file ...');
        return targetFolderDir;
    } else {
        console.log('Process aborted!!');
        console.log('index.html file not found');
        process.exit(1)
    }

}

module.exports = processValidation;
