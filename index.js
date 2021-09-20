#! /usr/bin/env node

const fs = require('fs');
const lib = require('./lib')


const targetFolderDir = lib.processValidation(); // if there is no index.html in target then process will exit.
lib.Extractor(targetFolderDir); // new index.html with replaced script tags
