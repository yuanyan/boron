!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Powers=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var transitionEvents = require('react-kit/transitionEvents');
//var animation = require('./animations/bounce');
var animation = require('./animations/wave');

module.exports = React.createClass({displayName: "exports",
    propTypes: {
        className: React.PropTypes.string,
        // Close the modal when esc is pressed? Defaults to true.
        keyboard: React.PropTypes.bool,
        onShow: React.PropTypes.func,
        onHide: React.PropTypes.func,
        backdrop: React.PropTypes.oneOfType([
            React.PropTypes.bool,
            React.PropTypes.string
        ])
    },

    getDefaultProps: function() {
        return {
            className: "",
            onShow: function(){},
            onHide: function(){},
            keyboard: true,
            backdrop: true
        };
    },

    getInitialState: function(){
        return {
            willHidden: false,
            hidden: true
        }
    },

    hasHidden: function(){
        return this.state.hidden;
    },

    componentDidMount: function(){
        var ref = animation.getRef();
        var node = this.refs[ref].getDOMNode();
        var endListener = function(e) {
            if (e && e.target !== node) {
                return;
            }
            transitionEvents.removeEndEventListener(node, endListener);
            this.enter();

        }.bind(this);
        transitionEvents.addEndEventListener(node, endListener);
    },

    render: function() {

        var hidden = this.hasHidden();
        if(hidden) return null;

        var willHidden = this.state.willHidden;
        var modalStyle = animation.getModalStyle(willHidden);
        var backdropStyle = animation.getBackdropStyle(willHidden);
        var contentStyle = animation.getContentStyle(willHidden);
        var ref = animation.getRef(willHidden);

        var backdrop = this.props.backdrop? React.createElement("div", {onClick: this.hide, style: backdropStyle}): undefined;

        if(willHidden) {
            var node = this.refs[ref].getDOMNode();
            var endListener = function(e) {
                if (e && e.target !== node) {
                    return;
                }

                transitionEvents.removeEndEventListener(node, endListener);
                this.leave();

            }.bind(this);
            transitionEvents.addEndEventListener(node, endListener);
        }

        return (React.createElement("span", null, 
            React.createElement("div", {ref: "modal", style: modalStyle, className: this.props.className}, 
                React.createElement("div", {ref: "content", tabIndex: "-1", style: contentStyle}, 
                    this.props.children
                )
            ), 
            backdrop
         ))
        ;
    },

    leave: function(){
        this.setState({
            hidden: true
        });
        this.props.onHide();
    },

    enter: function(){
        this.props.onShow();
    },

    show: function(){
        if(!this.hasHidden()) return;

        this.setState({
            willHidden: false,
            hidden: false
        });
    },

    hide: function(){

        if(this.hasHidden()) return;

        this.setState({
            willHidden: true
        });
    },

    toggle: function(){
        if(this.hasHidden())
            this.show();
        else
            this.hide();
    },

    listenKeyboard: function(event) {
        if (this.props.keyboard &&
                (event.key === "Escape" ||
                 event.keyCode === 27)) {
            this.hide();
        }
    },

    componentDidMount: function() {
        window.addEventListener("keydown", this.listenKeyboard, true);
    },

    componentWillUnmount: function() {
        window.removeEventListener("keydown", this.listenKeyboard, true);
    },

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./animations/wave":8,"react-kit/transitionEvents":7}],2:[function(require,module,exports){
'use strict';

var getVendorPropertyName = require('./getVendorPropertyName');

module.exports = function (target, sources){
    var to = Object(target);
    var hasOwnProperty = Object.prototype.hasOwnProperty;

    for (var nextIndex = 1; nextIndex < arguments.length; nextIndex++) {
        var nextSource = arguments[nextIndex];
        if (nextSource == null) {
            continue;
        }

        var from = Object(nextSource);

        for (var key in from) {
            if (hasOwnProperty.call(from, key)) {
                to[key] = from[key];
            }
        }
    }

    var prefixed = {};
    for (var key in to) {
        prefixed[getVendorPropertyName(key)] = to[key]
    }

    return prefixed
}

},{"./getVendorPropertyName":4}],3:[function(require,module,exports){
'use strict';

var cssVendorPrefix;

module.exports = function (){

    if(cssVendorPrefix) return cssVendorPrefix;

    var styles = window.getComputedStyle(document.documentElement, '');
    var pre = (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
    )[1];

    return cssVendorPrefix = '-' + pre + '-';
}

},{}],4:[function(require,module,exports){
'use strict';

var div = document.createElement('div');
var prefixes = ['Moz', 'Webkit', 'O', 'ms'];
var domVendorPrefix;

// Helper function to get the proper vendor property name. (transition => WebkitTransition)
module.exports = function (prop) {

    if (prop in div.style) return prop;

    var prop = prop.charAt(0).toUpperCase() + prop.substr(1);
    if(domVendorPrefix){
        return domVendorPrefix + prop;
    }else{
        for (var i=0; i<prefixes.length; ++i) {
            var vendorProp = prefixes[i] + prop;
            if (vendorProp in div.style) {
                domVendorPrefix = prefixes[i];
                return vendorProp;
            }
        }
    }
}

},{}],5:[function(require,module,exports){
'use strict';

var insertRule = require('./insertRule');
var vendorPrefix = require('./getVendorPrefix')();
var index = 0;

module.exports = function (keyframes) {
    // random name
    var name = 'anim_'+ (++index) + (+new Date);
    var css = "@" + vendorPrefix + "keyframes " + name + " {";

    for (var key in keyframes) {
        css += key + " {";

        for (var property in keyframes[key]) {
            var part = ":" + keyframes[key][property] + ";";
            // We do vendor prefix for every property
            css += vendorPrefix + property + part;
            css += property + part;
        }

        css += "}";
    }

    css += "}";

    insertRule(css);

    return name
}

},{"./getVendorPrefix":3,"./insertRule":6}],6:[function(require,module,exports){
'use strict';

var extraSheet;

module.exports = function (css) {

    if (!extraSheet) {
        // First time, create an extra stylesheet for adding rules
        extraSheet = document.createElement('style');
        document.getElementsByTagName('head')[0].appendChild(extraSheet);
        // Keep reference to actual StyleSheet object (`styleSheet` for IE < 9)
        extraSheet = extraSheet.sheet || extraSheet.styleSheet;
    }

    var index = (extraSheet.cssRules || extraSheet.rules).length;
    extraSheet.insertRule(css, index);

    return extraSheet;
}

},{}],7:[function(require,module,exports){
'use strict';

/**
 * EVENT_NAME_MAP is used to determine which event fired when a
 * transition/animation ends, based on the style property used to
 * define that event.
 */
var EVENT_NAME_MAP = {
  transitionend: {
    'transition': 'transitionend',
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'mozTransitionEnd',
    'OTransition': 'oTransitionEnd',
    'msTransition': 'MSTransitionEnd'
  },

  animationend: {
    'animation': 'animationend',
    'WebkitAnimation': 'webkitAnimationEnd',
    'MozAnimation': 'mozAnimationEnd',
    'OAnimation': 'oAnimationEnd',
    'msAnimation': 'MSAnimationEnd'
  }
};

var endEvents = [];

function detectEvents() {
  var testEl = document.createElement('div');
  var style = testEl.style;

  // On some platforms, in particular some releases of Android 4.x,
  // the un-prefixed "animation" and "transition" properties are defined on the
  // style object but the events that fire will still be prefixed, so we need
  // to check if the un-prefixed events are useable, and if not remove them
  // from the map
  if (!('AnimationEvent' in window)) {
    delete EVENT_NAME_MAP.animationend.animation;
  }

  if (!('TransitionEvent' in window)) {
    delete EVENT_NAME_MAP.transitionend.transition;
  }

  for (var baseEventName in EVENT_NAME_MAP) {
    var baseEvents = EVENT_NAME_MAP[baseEventName];
    for (var styleName in baseEvents) {
      if (styleName in style) {
        endEvents.push(baseEvents[styleName]);
        break;
      }
    }
  }
}

if(typeof window !== 'undefined'){
  detectEvents();
}


// We use the raw {add|remove}EventListener() call because EventListener
// does not know how to remove event listeners and we really should
// clean up. Also, these events are not triggered in older browsers
// so we should be A-OK here.

function addEventListener(node, eventName, eventListener) {
  node.addEventListener(eventName, eventListener, false);
}

function removeEventListener(node, eventName, eventListener) {
  node.removeEventListener(eventName, eventListener, false);
}

module.exports = {
  addEndEventListener: function(node, eventListener) {
    if (endEvents.length === 0) {
      // If CSS transitions are not supported, trigger an "end animation"
      // event immediately.
      window.setTimeout(eventListener, 0);
      return;
    }
    endEvents.forEach(function(endEvent) {
      addEventListener(node, endEvent, eventListener);
    });
  },

  removeEndEventListener: function(node, eventListener) {
    if (endEvents.length === 0) {
      return;
    }
    endEvents.forEach(function(endEvent) {
      removeEventListener(node, endEvent, eventListener);
    });
  }
};

},{}],8:[function(require,module,exports){
var insertKeyframesRule = require('react-kit/insertKeyframesRule');
var appendVendorPrefix = require('react-kit/appendVendorPrefix');

function inject(property, value, rules){
  var rule;
  for(var i in rules){
     rule = rules[i];
     if(rule[property]){
       rule[property] += ' ' + value;
     }else{
       rule[property] = value;
     }
  }
  return rules;
}

var animation = {
  show: {
    animationDuration: '1s',
    animationTimingFunction: 'linear'
  },
  hide: {
    animationDuration: '0.3s',
    animationTimingFunction: 'ease-out'
  },
  showContentAnimation: insertKeyframesRule({
    '0%': {
      opacity: 0,
      transform: 'matrix3d(0.7, 0, 0, 0, 0, 0.7, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '2.083333%': {
      transform: 'matrix3d(0.75266, 0, 0, 0, 0, 0.76342, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '4.166667%': {
      transform: 'matrix3d(0.81071, 0, 0, 0, 0, 0.84545, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '6.25%': {
      transform: 'matrix3d(0.86808, 0, 0, 0, 0, 0.9286, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '8.333333%': {
      transform: 'matrix3d(0.92038, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '10.416667%': {
      transform: 'matrix3d(0.96482, 0, 0, 0, 0, 1.05202, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '12.5%': {
      transform: 'matrix3d(1, 0, 0, 0, 0, 1.08204, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '14.583333%': {
      transform: 'matrix3d(1.02563, 0, 0, 0, 0, 1.09149, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '16.666667%': {
      transform: 'matrix3d(1.04227, 0, 0, 0, 0, 1.08453, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '18.75%': {
      transform: 'matrix3d(1.05102, 0, 0, 0, 0, 1.06666, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '20.833333%': {
      transform: 'matrix3d(1.05334, 0, 0, 0, 0, 1.04355, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '22.916667%': {
      transform: 'matrix3d(1.05078, 0, 0, 0, 0, 1.02012, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '25%': {
      transform: 'matrix3d(1.04487, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '27.083333%': {
      transform: 'matrix3d(1.03699, 0, 0, 0, 0, 0.98534, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '29.166667%': {
      transform: 'matrix3d(1.02831, 0, 0, 0, 0, 0.97688, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '31.25%': {
      transform: 'matrix3d(1.01973, 0, 0, 0, 0, 0.97422, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '33.333333%': {
      transform: 'matrix3d(1.01191, 0, 0, 0, 0, 0.97618, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '35.416667%': {
      transform: 'matrix3d(1.00526, 0, 0, 0, 0, 0.98122, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '37.5%': {
      transform: 'matrix3d(1, 0, 0, 0, 0, 0.98773, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '39.583333%': {
      transform: 'matrix3d(0.99617, 0, 0, 0, 0, 0.99433, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '41.666667%': {
      transform: 'matrix3d(0.99368, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '43.75%': {
      transform: 'matrix3d(0.99237, 0, 0, 0, 0, 1.00413, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '45.833333%': {
      transform: 'matrix3d(0.99202, 0, 0, 0, 0, 1.00651, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '47.916667%': {
      transform: 'matrix3d(0.99241, 0, 0, 0, 0, 1.00726, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '50%': {
      opacity: 1,
      transform: 'matrix3d(0.99329, 0, 0, 0, 0, 1.00671, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '52.083333%': {
      transform: 'matrix3d(0.99447, 0, 0, 0, 0, 1.00529, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '54.166667%': {
      transform: 'matrix3d(0.99577, 0, 0, 0, 0, 1.00346, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '56.25%': {
      transform: 'matrix3d(0.99705, 0, 0, 0, 0, 1.0016, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '58.333333%': {
      transform: 'matrix3d(0.99822, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '60.416667%': {
      transform: 'matrix3d(0.99921, 0, 0, 0, 0, 0.99884, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '62.5%': {
      transform: 'matrix3d(1, 0, 0, 0, 0, 0.99816, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '64.583333%': {
      transform: 'matrix3d(1.00057, 0, 0, 0, 0, 0.99795, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '66.666667%': {
      transform: 'matrix3d(1.00095, 0, 0, 0, 0, 0.99811, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '68.75%': {
      transform: 'matrix3d(1.00114, 0, 0, 0, 0, 0.99851, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '70.833333%': {
      transform: 'matrix3d(1.00119, 0, 0, 0, 0, 0.99903, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '72.916667%': {
      transform: 'matrix3d(1.00114, 0, 0, 0, 0, 0.99955, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '75%': {
      transform: 'matrix3d(1.001, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '77.083333%': {
      transform: 'matrix3d(1.00083, 0, 0, 0, 0, 1.00033, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '79.166667%': {
      transform: 'matrix3d(1.00063, 0, 0, 0, 0, 1.00052, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '81.25%': {
      transform: 'matrix3d(1.00044, 0, 0, 0, 0, 1.00058, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '83.333333%': {
      transform: 'matrix3d(1.00027, 0, 0, 0, 0, 1.00053, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '85.416667%': {
      transform: 'matrix3d(1.00012, 0, 0, 0, 0, 1.00042, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '87.5%': {
      transform: 'matrix3d(1, 0, 0, 0, 0, 1.00027, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '89.583333%': {
      transform: 'matrix3d(0.99991, 0, 0, 0, 0, 1.00013, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '91.666667%': {
      transform: 'matrix3d(0.99986, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '93.75%': {
      transform: 'matrix3d(0.99983, 0, 0, 0, 0, 0.99991, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '95.833333%': {
      transform: 'matrix3d(0.99982, 0, 0, 0, 0, 0.99985, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '97.916667%': {
      transform: 'matrix3d(0.99983, 0, 0, 0, 0, 0.99984, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    },
    '100%': {
      opacity: 1,
      transform: 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'
    }
  }),

  hideContentAnimation: insertKeyframesRule({
    '0%': {
      opacity: 1
    },
    '100%': {
      opacity: 0,
      transform: 'scale3d(0.8, 0.8, 1)'
    },
  }),

  showBackdropAnimation: insertKeyframesRule({
    '0%': {
      opacity: 0
    },
    '100%': {
      opacity: 0.7
    },
  }),

  hideBackdropAnimation: insertKeyframesRule({
    '0%': {
      opacity: 0.7
    },
    '100%': {
      opacity: 0
    }
  })
};

var showAnimation = animation.show;
var hideAnimation = animation.hide;
var showContentAnimation = animation.showContentAnimation;
var hideContentAnimation = animation.hideContentAnimation;
var showBackdropAnimation = animation.showBackdropAnimation;
var hideBackdropAnimation = animation.hideBackdropAnimation;

module.exports = {
  getRef: function(willHidden){
    return 'content';
  },
  getModalStyle: function(willHidden) {
    return appendVendorPrefix({
      zIndex: 1050,
      position: "fixed",
      width: "500px",
      transform: "translate3d(-50%, -50%, 0)",
      top: "50%",
      left: "50%"
    })
  },
  getBackdropStyle: function(willHidden) {
    return appendVendorPrefix({
      position: "fixed",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 1040,
      backgroundColor: "black",
      animationFillMode: 'forwards',
      animationDuration: (willHidden ? hideAnimation : showAnimation).animationDuration,
      animationName: willHidden ? hideBackdropAnimation : showBackdropAnimation,
      animationTimingFunction: (willHidden ? hideAnimation : showAnimation).animationTimingFunction
    });
  },
  getContentStyle: function(willHidden) {
    return appendVendorPrefix({
      margin: 0,
      backgroundColor: "white",
      animationDuration: (willHidden ? hideAnimation : showAnimation).animationDuration,
      animationFillMode: 'forwards',
      animationName: willHidden ? hideContentAnimation : showContentAnimation,
      animationTimingFunction: (willHidden ? hideAnimation : showAnimation).animationTimingFunction
    })
  }
}

},{"react-kit/appendVendorPrefix":2,"react-kit/insertKeyframesRule":5}]},{},[1])(1)
});