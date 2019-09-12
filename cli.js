#!/usr/bin/env node

const package = require('./package.json');
const program = require('commander');
const clear = require('clear');
const chalk = require('chalk');
const figlet = require('figlet');
const mkdirp = require('mkdirp');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

clear();
console.log(
  chalk.red(
    figlet.textSync('callete-cli', { horizontalLayout: 'full' })
  )
);

program.version(package.version, '-v, --version', 'Output the current version')
.description("A CLI for managing Callete projects.")
// .option('-p, --peppers', 'Add peppers')

function buildComponent(component) {
    console.log("Component:", component)
    const $ = cheerio.load(component);
    const style = $('style').text();
    const html = component.replace('/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi', '');

    return {html,css:style};
}

function build(dir) {
    let overallRoutes = {};
    let routes = JSON.parse(fs.readFileSync(path.join(dir, '/routes.json'), 'utf8'));
    for (i of routes) {
        let component = buildComponent(fs.readFileSync(path.join(dir, `components/${i.component}`), 'utf8'));
        overallRoutes[i.url] = {

            html: component.html,
            css: component.css

        }
    }
    mkdirp(path.join(dir,'dist'));
    let jsTemplate = fs.readFileSync(path.join(__dirname, '/static/main.js'), 'utf8');
    jsTemplate = jsTemplate.replace(':routes:', JSON.stringify(overallRoutes));
    jsTemplate = jsTemplate.replace(':404page:', '"<h1>404</h1>"');
    const htmlTemplate = fs.readFileSync(path.join(__dirname, '/static/template.html'), 'utf8');

    fs.writeFileSync(path.join(dir, '/dist/main.js'), jsTemplate, () => {});
    fs.writeFileSync(path.join(dir, '/dist/index.html'), htmlTemplate, () => {});
}

program.command('create <name> [starter]')
.option('-t, --typescript', 'Use Typescript')
.action(function (name, starter) {
    let start = "";
    let usingStarter = "Beginner";
    
    if (starter) {
        start = ` from the starter: ${starter}`;
    }

    if (name == "" || name == " " || name.includes("\t") || name.includes("\n") || name.includes("\r")){
        throw 'Error: Please stick to naming convention abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';
    }

    console.log(chalk.cyan(`Creating project '${name}'${start}`));

    mkdirp(path.join(process.cwd(),name));

    let newpackage = {

        name,
        version: "1.0.0",
        description: "A callete project",
        author: "",
        main: "index.js",
        scripts: {
            dev: "callete serve",
            build: "callete build -p"
        },
        keywords: [],
        license: "ISC"
        
    };

    const routes = [{
        url: '/',
        component: 'index.ette'
    }, {
        url: '/about',
        component: 'about.ette'
    }];

    const config = {

        name,
        description: 'A Callete App.',
        version: '1.0.0'
    };

    fs.writeFileSync(`${name}/package.json`, JSON.stringify(newpackage, null, '\t'), () => {})
    fs.writeFileSync(`${name}/routes.json`, JSON.stringify(routes, null, '\t'), () => {})
    fs.writeFileSync(`${name}/callete.config.json`, JSON.stringify(config, null, '\t'), () => {})

    mkdirp(`${path.join(process.cwd(),name)}/components`,);

    fs.writeFileSync(`${name}/components/index.ette`, "test", () => {})
    fs.writeFileSync(`${name}/components/about.ette`, "test", () => {})
    
    console.log(chalk.black.bgGreen.bold("CREATED"), chalk.yellow("package.json"))
    console.log(chalk.black.bgGreen.bold("CREATED"), chalk.yellow("routes.json"))
    console.log(chalk.black.bgGreen.bold("CREATED"), chalk.yellow("callete.config.json"))
    console.log(chalk.black.bgGreen.bold("CREATED"), chalk.yellow("components/"))
    console.log(chalk.black.bgGreen.bold("CREATED"), chalk.yellow("components/index.ette"))
    console.log(chalk.black.bgGreen.bold("CREATED"), chalk.yellow("components/about.ette"))
});

program.command('build')
.option('-p, --production', 'Production Mode')
.action(function () {
    build(process.cwd())
    
    console.log(chalk.cyan("STATUS"), chalk.green("PASS"))
});

program.parse(process.argv);

if (process.argv.length < 3) {
    program.outputHelp();
}