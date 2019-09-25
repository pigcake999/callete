#!/usr/bin/env node

const package = require('./package.json');
const program = require('commander');
const clear = require('clear');
const chalk = require('chalk');
const figlet = require('figlet');
const mkdirp = require('mkdirp');
const fs = require('fs');
const path = require('path');
const express = require('express');
const getStylesData = require('style-data');
const showdown = require('showdown')
const converter = new showdown.Converter()

clear();
console.log(
  chalk.red(
    figlet.textSync('callete-cli', { horizontalLayout: 'full' })
  )
);

program.version(package.version, '-v, --version', 'Output the current version')
.description("A CLI for managing Callete projects.")
// .option('-p, --peppers', 'Add peppers')

function parseHrtimeToSeconds(hrtime) {
    var seconds = (hrtime[0] + (hrtime[1] / 1e9)).toFixed(3);
    return seconds;
}

async function buildComponent(component, componentsDir) {
    var options = {
        url: './',
        applyStyleTags: true,
        removeStyleTags: true,
        applyLinkTags: false,
        removeLinkTags: false,
        preserveMediaQueries: false
    };
    let comp = {};
    getStylesData(component, options, function (err, results) {
        comp.html = results.html
        comp.css = results.css
    });
    return comp;
}

async function build(dir, production=false) {
    let newdir = dir;
    if (production == false) {
        newdir = path.join(__dirname, 'tmp')
    }
    let overallRoutes = {};
    let items = fs.readdirSync(path.join(dir, `components`));
    let allComponents = {}
    for (var i=0; i<items.length; i++) {
        let nc = await buildComponent(fs.readFileSync(path.join(dir, `components/${items[i]}`), 'utf8'), path.join(dir, `components`));
        
        allComponents[items[i].split('.ette')[0]]=nc;
    }
    const calleteConfig = require(path.join(process.cwd(), 'callete.config.json'));
    let allMarkdown = {}
    if (calleteConfig.markdown){
        if(fs.existsSync(path.join(process.cwd(), calleteConfig.markdown))) {
            let items = fs.readdirSync(path.join(process.cwd(), calleteConfig.markdown));
            
            for (var i=0; i<items.length; i++) {
                let nm = converter.makeHtml(fs.readFileSync(path.join(process.cwd(), calleteConfig.markdown, items[i]), 'utf8'))
                
                allMarkdown[items[i].split('.md')[0]]=nm;
            }
        }
    }
    let routes = JSON.parse(fs.readFileSync(path.join(dir, '/routes.json'), 'utf8'));
    for (let i of routes) {
        let component = await buildComponent(fs.readFileSync(path.join(dir, `components/${i.component}`), 'utf8'), path.join(dir, `components`));
        overallRoutes[i.url] = {

            html: component.html,
            css: component.css

        }
    }
    mkdirp(path.join(newdir,'dist'));
    let jsTemplate = fs.readFileSync(path.join(__dirname, '/static/main.js'), 'utf8');
    jsTemplate = jsTemplate.replace(':routes:', JSON.stringify(overallRoutes));
    jsTemplate = jsTemplate.replace(':components:', JSON.stringify(allComponents));
    jsTemplate = jsTemplate.replace(':404page:', '"<h1>404</h1>"');
    jsTemplate = jsTemplate.replace(':markdown:', JSON.stringify(allMarkdown));
    jsTemplate = jsTemplate.replace(':version_number:', package.version);
    const htmlTemplate = fs.readFileSync(path.join(__dirname, '/static/template.html'), 'utf8');

    mkdirp(path.join(newdir,'dist/assets'));
    fs.writeFileSync(path.join(newdir, '/dist/assets/main.js'), jsTemplate, () => {});
    fs.writeFileSync(path.join(newdir, '/dist/index.html'), htmlTemplate, () => {});
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

    fs.writeFileSync(`${name}/components/index.ette`, fs.readFileSync(path.join(__dirname, 'static/index.ette'), 'utf8'), () => {})
    fs.writeFileSync(`${name}/components/about.ette`, fs.readFileSync(path.join(__dirname, 'static/about.ette'), 'utf8'), () => {})
    fs.writeFileSync(`${name}/components/Navigation.ette`, fs.readFileSync(path.join(__dirname, 'static/Navigation.ette'), 'utf8'), () => {})
    
    console.log(chalk.black.bgGreen.bold("CREATED"), chalk.yellow("package.json"))
    console.log(chalk.black.bgGreen.bold("CREATED"), chalk.yellow("routes.json"))
    console.log(chalk.black.bgGreen.bold("CREATED"), chalk.yellow("callete.config.json"))
    console.log(chalk.black.bgGreen.bold("CREATED"), chalk.yellow("components/"))
    console.log(chalk.black.bgGreen.bold("CREATED"), chalk.yellow("components/index.ette"))
    console.log(chalk.black.bgGreen.bold("CREATED"), chalk.yellow("components/about.ette"))
});

program.command('build')
.option('-p, --production', 'Production Mode')
.action(async function (cmd) {
    let startTime = process.hrtime();
    await build(process.cwd(), cmd.production)
    let elapsedSeconds = parseHrtimeToSeconds(process.hrtime(startTime));
    
    if(!cmd.production) {
        let app = express()

        app.use("/assets", express.static(path.join(__dirname, 'tmp/dist/assets')))

        app.get("*", (req,res) => {
            res.sendFile(path.join(__dirname, 'tmp/dist/index.html'))
        });

        var host = '127.0.0.1', port = 3000;

        app.listen(port, () => {});
        console.log(chalk.bgGreen.black("DONE"), chalk.green('Compiled successfully in '+elapsedSeconds.toString()+' seconds.'), `\n\nApp running at:\n- Local:  `+chalk.cyan(`http://localhost:`+chalk.bold(port)+'/'), '\n\nNote that the development build is not optimized.\nTo create a production build, run '+chalk.cyan('callete build -p')+'.')
    } else {
        console.log(chalk.bgGreen.black("DONE"), chalk.green('Compiled successfully in '+elapsedSeconds.toString()+' seconds.'), `\n\nProduction build created in ${chalk.cyan('/dist')}.`)
    }
});

program.parse(process.argv);

if (process.argv.length < 3) {
    program.outputHelp();
}