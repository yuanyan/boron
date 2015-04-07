Powers
=======

A collection of dialog animations with React.js.

## Demo & Examples

Live demo: [yuanyan.github.io/powers](http://yuanyan.github.io/powers/)

To build the examples locally, run:

```
npm install
gulp dev
```

Then open [`localhost:9999`](http://localhost:9999) in a browser.

## Installation

The easiest way to use `powers` is to install it from NPM and include it in your own React build process (using [Browserify](http://browserify.org), etc).

You can also use the standalone build by including `dist/powers.js` in your page. If you use this, make sure you have already included React, and it is available as a global variable.

```
npm install powers --save
```

## Usage

```
var Dialog = require('powers');
var Example = React.createClass({
    showDialog: function(){
        this.refs.dialog.show();
    },
    hideDialog: function(){
        this.refs.dialog.hide();
    },
    render: function() {
        return (
            <button onClick={this.showDialog}>Open</button>
            <Dialog ref="dialog">
                <h2>I'm a dialog</h2>
                <button onClick={this.hideDialog}>Close</button>
            </Dialog>
        );
    }
});
```

## Browser Support

![IE](https://raw.github.com/alrra/browser-logos/master/internet-explorer/internet-explorer_48x48.png) | ![Chrome](https://raw.github.com/alrra/browser-logos/master/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/firefox/firefox_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/opera/opera_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/safari/safari_48x48.png)
--- | --- | --- | --- | --- |
IE 10+ ✔ | Chrome 4.0+ ✔ | Firefox 16.0+ ✔ | Opera 15.0+ ✔ | Safari 4.0+ ✔ |
