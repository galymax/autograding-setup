const fse = require('fs-extra');
const { readFile } = require('fs/promises')
const path = require('path');
const { escapeRegExp } = require('../lib/helpers')
const { orig } = require('../lib/refs')
const argv = require('../lib/yargs');
const devMode = argv.dev;

const readmeInfoPath = path.resolve(orig, 'AUTOGRADING.md');
const setupInfoPath = path.resolve(orig, 'SETUP.md');
//const pointsBadgeString = `![Points badge](../../blob/badges/.github/badges/points.svg)`;
const infoDelimiters = ['[//]: # (autograding info start)', '[//]: # (autograding info end)'];
const setupDelimiters = ['[//]: # (autograding setup start)', '[//]: # (autograding setup end)'];

const headlineLevel1Regex = /^#[^#].*$/m;

exports.modifyReadme = async function (readmePath) {
  console.log('modify readme')
  let readme = await readFile(readmePath, 'utf8')

  // add setup instructions
  readme = await addSetupInstructions(readme)

  //if(!devMode) {
    // add points badge
    readme = addPointsBadge(readme);

    // add autograding info
    readme = await addAutogradingInfo(readme)
  //}

  // save
  await fse.outputFile(readmePath, readme);
}

function addPointsBadge(readme) {
  // delete old points badge
  readme = readme.replace(/[\n]{0,1}.*\!\[Points badge\]\(.*[\n\r]*/g, '')
  // insert points badge before level 1 headline match
  return readme//.replace(headlineLevel1Regex, `\n[${pointsBadgeString} results](${argv.repoWebUrl}/actions)\n$&`);
}

async function addSetupInstructions(readme) {
  const setupInfo = await readFile(setupInfoPath, 'utf8');
  const setupRE = new RegExp(`[\n\r]*${escapeRegExp(setupDelimiters[0])}([\\s\\S]*)${escapeRegExp(setupDelimiters[1])}[\n\r]*`, 'gsm');
  readme = readme.replace(setupRE, '\n')
  return readme//.replace(headlineLevel1Regex, `$&\n\r${setupDelimiters[0]}\n${setupInfo}\n\r${setupDelimiters[1]}\n`);
}

async function addAutogradingInfo(readme) {
  let readmeInfo = await readFile(readmeInfoPath, 'utf8');
  const infoRE = new RegExp(`[\n\r]*${escapeRegExp(infoDelimiters[0])}([\\s\\S]*)${escapeRegExp(infoDelimiters[1])}`, 'gsm');
  // add repo link
  readmeInfo = readmeInfo.replace(/#repoWebUrl/g, argv.repoWebUrl)
  readme = readme.replace(infoRE, '')
  return `${readme}\n\r${infoDelimiters[0]}\n${readmeInfo}\n\r${infoDelimiters[1]}`;
}