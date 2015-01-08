# Ti-64

[![Dependencies](https://david-dm.org/fokkezb/ti-64/status.svg?style=flat-square)](https://david-dm.org/fokkezb/ti-html2as#info=dependencies)
[![Dev Dependencies](https://david-dm.org/fokkezb/ti-64/dev-status.svg?style=flat-square)](https://david-dm.org/fokkezb/ti-html2as#info=devDependencies)

Check all [Appcelerator Titanium](http://appcelerator.com/titanium) project and/or global modules for 64-bit iOS support.

![screenshot](screenshot.png)

## Install [![NPM version](https://badge.fury.io/js/ti-64.svg)](http://badge.fury.io/js/ti-64)

As global CLI:

  $ npm install -g ti-64

As module:

  $ npm install ti-64 --save

## Usage

### CLI

Check local and global modules required in a project's `tiapp.xml`:

	~/project $ ti-i64
	$ ti-64 --project-dir ~/project

Check all global modules:

	$ ti-64 --global

### Module

```
var ti64 = require('ti-64');

ti64({
	projectDir: './project',
	global: false
});
```