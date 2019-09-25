# Callete

## Installing

Run this command:

`$ npm i -g callete`

to install callete.

## Starting a project

`callete create <name> [starter]`

**name**: The name of the project

**starter**: A link to a git repository to clone

## Development builds

`callete build`

Builds and runs a server.

## Production builds

`callete build -p [-N]`

Builds a production-ready site in a _dist_ folder in your project folder.

## Routing

In your callete project which has a very simple file structure:
```fs
callete.config.json  /components  package.json  routes.json
```

Where would we manage routes?

Yes, another amazingly simple feature of callete: **routes.json**

This is the default:

```json
[
	{
		"url": "/",
		"component": "index.ette"
	},
	{
		"url": "/about",
		"component": "about.ette"
	}
]
```

No need to be scared! It's just a JSON array. Just make another object in the array, like if we wanted a contact page:

```json
[
	{
		"url": "/",
		"component": "index.ette"
	},
	{
		"url": "/about",
		"component": "about.ette"
	},
	{
		"url": "/contact",
		"component": "contact.ette"
	}
]
```

Now the other important piece of the puzzle where are we linking to in the component variable?

Well we just link to a file in the _components_ folder.

## .ette

The .ette extension is calletes form of html its literally html with custom components its just a filename extension no need to be worried.

## Components

The simplest yet most effective part of callete!

As simple as this:

`components/index.ette`
```html
<Navigation>
```

Now how would we make a component

`components/Navigation.ette`
```html
<a href="/">Home Page</a>
<a href="/about">About Page</a>
```

Yes, as simple as that.

## Markdown

To include markdown into your pages you need to create a markdown directory.

We'll be calling it _Markdown_.

No subdirectory support is currently included for your markdown folder.

Now you have to edit your `callete.config.json`.

The default is this:

```json
{
	"name": "<name>",
	"description": "A Callete App.",
	"version": "1.0.0"
}
```

To add markdown:

```json
{
	"name": "Docs",
	"description": "A Callete App.",
	"version": "1.0.0",
	"markdown": "Markdown"
}
```

Then to include it in any of our **.ette** files:

```html
<Markdown file='filename (no .md)'></Markdown>
```