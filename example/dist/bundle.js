require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var getVendorPropertyName = require('./getVendorPropertyName');

module.exports = function(target, sources) {
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

},{"./getVendorPropertyName":4}],2:[function(require,module,exports){
'use strict';

module.exports = document.createElement('div').style;

},{}],3:[function(require,module,exports){
'use strict';

var cssVendorPrefix;

module.exports = function() {

  if (cssVendorPrefix) return cssVendorPrefix;

  var styles = window.getComputedStyle(document.documentElement, '');
  var pre = (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o']))[1];

  return cssVendorPrefix = '-' + pre + '-';
}

},{}],4:[function(require,module,exports){
'use strict';

var builtinStyle = require('./builtinStyle');
var prefixes = ['Moz', 'Webkit', 'O', 'ms'];
var domVendorPrefix;

// Helper function to get the proper vendor property name. (transition => WebkitTransition)
module.exports = function(prop, isSupportTest) {

  var vendorProp;
  if (prop in builtinStyle) return prop;

  var UpperProp = prop.charAt(0).toUpperCase() + prop.substr(1);

  if (domVendorPrefix) {

    vendorProp = domVendorPrefix + UpperProp;
    if (vendorProp in builtinStyle) {
      return vendorProp;
    }
  } else {

    for (var i = 0; i < prefixes.length; ++i) {
      vendorProp = prefixes[i] + UpperProp;
      if (vendorProp in builtinStyle) {
        domVendorPrefix = prefixes[i];
        return vendorProp;
      }
    }
  }

  // if support test, not fallback to origin prop name
  if (!isSupportTest) {
    return prop;
  }

}

},{"./builtinStyle":2}],5:[function(require,module,exports){
'use strict';

var insertRule = require('./insertRule');
var vendorPrefix = require('./getVendorPrefix')();
var index = 0;

module.exports = function(keyframes) {
  // random name
  var name = 'anim_' + (++index) + (+new Date);
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

module.exports = function(css) {

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

if (typeof window !== 'undefined') {
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
var modalFactory = require('./modalFactory');
var insertKeyframesRule = require('domkit/insertKeyframesRule');
var appendVendorPrefix = require('domkit/appendVendorPrefix');

var animation = {
    show: {
        animationDuration: '0.4s',
        animationTimingFunction: 'cubic-bezier(0.7,0,0.3,1)'
    },

    hide: {
        animationDuration: '0.4s',
        animationTimingFunction: 'cubic-bezier(0.7,0,0.3,1)'
    },

    showModalAnimation: insertKeyframesRule({
        '0%': {
            opacity: 0,
            transform: 'translate3d(-50%, -300px, 0)'
        },
        '100%': {
            opacity: 1,
            transform: 'translate3d(-50%, -50%, 0)'
        }
    }),

    hideModalAnimation: insertKeyframesRule({
        '0%': {
            opacity: 1,
            transform: 'translate3d(-50%, -50%, 0)'
        },
        '100%': {
            opacity: 0,
            transform: 'translate3d(-50%, 100px, 0)'
        }
    }),

    showBackdropAnimation: insertKeyframesRule({
        '0%': {
            opacity: 0
        },
        '100%': {
            opacity: 0.9
        }
    }),

    hideBackdropAnimation: insertKeyframesRule({
        '0%': {
            opacity: 0.9
        },
        '100%': {
            opacity: 0
        }
    }),

    showContentAnimation: insertKeyframesRule({
        '0%': {
            opacity: 0,
            transform: 'translate3d(0, -20px, 0)'
        },
        '100%': {
            opacity: 1,
            transform: 'translate3d(0, 0, 0)'
        }
    }),

    hideContentAnimation: insertKeyframesRule({
        '0%': {
            opacity: 1,
            transform: 'translate3d(0, 0, 0)'
        },
        '100%': {
            opacity: 0,
            transform: 'translate3d(0, 50px, 0)'
        }
    })
};

var showAnimation = animation.show;
var hideAnimation = animation.hide;
var showModalAnimation = animation.showModalAnimation;
var hideModalAnimation = animation.hideModalAnimation;
var showBackdropAnimation = animation.showBackdropAnimation;
var hideBackdropAnimation = animation.hideBackdropAnimation;
var showContentAnimation = animation.showContentAnimation;
var hideContentAnimation = animation.hideContentAnimation;

module.exports = modalFactory({
    getRef: function(willHidden) {
        return 'modal';
    },
    getModalStyle: function(willHidden) {
        return appendVendorPrefix({
            position: "fixed",
            width: "500px",
            transform: "translate3d(-50%, -50%, 0)",
            top: "50%",
            left: "50%",
            backgroundColor: "white",
            zIndex: 1050,
            animationDuration: (willHidden ? hideAnimation : showAnimation).animationDuration,
            animationFillMode: 'forwards',
            animationName: willHidden ? hideModalAnimation : showModalAnimation,
            animationTimingFunction: (willHidden ? hideAnimation : showAnimation).animationTimingFunction
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
            backgroundColor: "#373A47",
            animationDuration: (willHidden ? hideAnimation : showAnimation).animationDuration,
            animationFillMode: 'forwards',
            animationName: willHidden ? hideBackdropAnimation : showBackdropAnimation,
            animationTimingFunction: (willHidden ? hideAnimation : showAnimation).animationTimingFunction
        });
    },
    getContentStyle: function(willHidden) {
        return appendVendorPrefix({
            margin: 0,
            animationDuration: (willHidden ? hideAnimation : showAnimation).animationDuration,
            animationFillMode: 'forwards',
            animationDelay: '0.25s',
            animationName: showContentAnimation,
            animationTimingFunction: (willHidden ? hideAnimation : showAnimation).animationTimingFunction
        })
    }
});

},{"./modalFactory":14,"domkit/appendVendorPrefix":1,"domkit/insertKeyframesRule":5}],9:[function(require,module,exports){
var modalFactory = require('./modalFactory');
var insertKeyframesRule = require('domkit/insertKeyframesRule');
var appendVendorPrefix = require('domkit/appendVendorPrefix');

var animation = {
    show: {
        animationDuration: '0.3s',
        animationTimingFunction: 'ease-out'
    },
    hide: {
        animationDuration: '0.3s',
        animationTimingFunction: 'ease-out'
    },
    showContentAnimation: insertKeyframesRule({

        '0%': {
            opacity: 0
        },
        '100%': {
            opacity: 1
        }
    }),

    hideContentAnimation: insertKeyframesRule({
        '0%': {
            opacity: 1
        },
        '100%': {
            opacity: 0
        }
    }),

    showBackdropAnimation: insertKeyframesRule({
        '0%': {
            opacity: 0
        },
        '100%': {
            opacity: 0.9
        },
    }),

    hideBackdropAnimation: insertKeyframesRule({
        '0%': {
            opacity: 0.9
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

module.exports = modalFactory({
    getRef: function(willHidden) {
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
            backgroundColor: "#373A47",
            animationFillMode: 'forwards',
            animationDuration: '0.3s',
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
});

},{"./modalFactory":14,"domkit/appendVendorPrefix":1,"domkit/insertKeyframesRule":5}],10:[function(require,module,exports){
var modalFactory = require('./modalFactory');
var insertKeyframesRule = require('domkit/insertKeyframesRule');
var appendVendorPrefix = require('domkit/appendVendorPrefix');

var animation = {
    show: {
        animationDuration: '0.5s',
        animationTimingFunction: 'ease-out'
    },
    hide: {
        animationDuration: '0.5s',
        animationTimingFunction: 'ease-out'
    },
    showContentAnimation: insertKeyframesRule({

        '0%': {
            opacity: 0,
            transform: 'translate3d(calc(-100vw - 50%), 0, 0)'
        },
        '50%': {
            opacity: 1,
            transform: 'translate3d(100px, 0, 0)'
        },
        '100%': {
            opacity: 1,
            transform: 'translate3d(0, 0, 0)'
        }
    }),

    hideContentAnimation: insertKeyframesRule({

        '0%': {
            opacity: 1,
            transform: 'translate3d(0, 0, 0)'
        },
        '50%': {
            opacity: 1,
            transform: 'translate3d(-100px, 0, 0) scale3d(1.1, 1.1, 1)'
        },
        '100%': {
            opacity: 0,
            transform: 'translate3d(calc(100vw + 50%), 0, 0)'
        },
    }),

    showBackdropAnimation: insertKeyframesRule({
        '0%': {
            opacity: 0
        },
        '100%': {
            opacity: 0.9
        },
    }),

    hideBackdropAnimation: insertKeyframesRule({
        '0%': {
            opacity: 0.9
        },
        '90%': {
            opactiy: 0.9
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

module.exports = modalFactory({
    getRef: function(willHidden) {
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
            backgroundColor: "#373A47",
            animationFillMode: 'forwards',
            animationDuration: '0.3s',
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
});

},{"./modalFactory":14,"domkit/appendVendorPrefix":1,"domkit/insertKeyframesRule":5}],11:[function(require,module,exports){
var modalFactory = require('./modalFactory');
var insertKeyframesRule = require('domkit/insertKeyframesRule');
var appendVendorPrefix = require('domkit/appendVendorPrefix');

var animation = {
    show: {
        animationDuration: '0.8s',
        animationTimingFunction: 'cubic-bezier(0.6,0,0.4,1)'
    },
    hide: {
        animationDuration: '0.4s',
        animationTimingFunction: 'ease-out'
    },
    showContentAnimation: insertKeyframesRule({
        '0%': {
            opacity: 0,
        },
        '40%':{
            opacity: 0
        },
        '100%': {
            opacity: 1,
        }
    }),

    hideContentAnimation: insertKeyframesRule({
        '0%': {
            opacity: 1
        },
        '100%': {
            opacity: 0,
        }
    }),

    showBackdropAnimation: insertKeyframesRule({
        '0%': {
            opacity: 0
        },
        '100%': {
            opacity: 0.9
        },
    }),

    hideBackdropAnimation: insertKeyframesRule({
        '0%': {
            opacity: 0.9
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

module.exports = modalFactory({
    getRef: function(willHidden) {
        return 'content';
    },
    getSharp: function(willHidden) {
        var strokeDashLength = 1680;

        var showSharpAnimation = insertKeyframesRule({
            '0%': {
                'stroke-dashoffset': strokeDashLength
            },
            '100%': {
                'stroke-dashoffset': 0
            },
        });


        var sharpStyle = {
            position: 'absolute',
            width: 'calc(100%)',
            height: 'calc(100%)',
            zIndex: '-1'
        };

        var rectStyle = appendVendorPrefix({
            animationDuration: willHidden? '0.4s' :'0.8s',
            animationFillMode: 'forwards',
            animationName: willHidden? hideContentAnimation: showSharpAnimation,
            stroke: '#ffffff',
            strokeWidth: '2px',
            strokeDasharray: strokeDashLength
        });

        return React.createElement("div", {style: sharpStyle}, 
            React.createElement("svg", {
                xmlns: "http://www.w3.org/2000/svg", 
                width: "100%", 
                height: "100%", 
                viewBox: "0 0 496 136", 
                preserveAspectRatio: "none"}, 
                React.createElement("rect", {style: rectStyle, 
                    x: "2", 
                    y: "2", 
                    fill: "none", 
                    width: "492", 
                    height: "132"})
            )
        )
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
            backgroundColor: "#373A47",
            animationFillMode: 'forwards',
            animationDuration: '0.4s',
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
});

},{"./modalFactory":14,"domkit/appendVendorPrefix":1,"domkit/insertKeyframesRule":5}],12:[function(require,module,exports){
var modalFactory = require('./modalFactory');
var insertKeyframesRule = require('domkit/insertKeyframesRule');
var appendVendorPrefix = require('domkit/appendVendorPrefix');

var animation = {
    show: {
        animationDuration: '0.4s',
        animationTimingFunction: 'cubic-bezier(0.6,0,0.4,1)'
    },
    hide: {
        animationDuration: '0.4s',
        animationTimingFunction: 'ease-out'
    },
    showContentAnimation: insertKeyframesRule({
        '0%': {
            opacity: 0,
            transform: 'scale3d(0, 0, 1)'
        },
        '100%': {
            opacity: 1,
            transform: 'scale3d(1, 1, 1)'
        }
    }),

    hideContentAnimation: insertKeyframesRule({
        '0%': {
            opacity: 1
        },
        '100%': {
            opacity: 0,
            transform: 'scale3d(0.5, 0.5, 1)'
        }
    }),

    showBackdropAnimation: insertKeyframesRule({
        '0%': {
            opacity: 0
        },
        '100%': {
            opacity: 0.9
        },
    }),

    hideBackdropAnimation: insertKeyframesRule({
        '0%': {
            opacity: 0.9
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

module.exports = modalFactory({
    getRef: function(willHidden) {
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
            backgroundColor: "#373A47",
            animationFillMode: 'forwards',
            animationDuration: '0.4s',
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
});

},{"./modalFactory":14,"domkit/appendVendorPrefix":1,"domkit/insertKeyframesRule":5}],13:[function(require,module,exports){
var modalFactory = require('./modalFactory');
var insertKeyframesRule = require('domkit/insertKeyframesRule');
var appendVendorPrefix = require('domkit/appendVendorPrefix');

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
            opacity: 0.9
        },
    }),

    hideBackdropAnimation: insertKeyframesRule({
        '0%': {
            opacity: 0.9
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

module.exports = modalFactory({
    getRef: function(willHidden) {
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
            backgroundColor: "#373A47",
            animationFillMode: 'forwards',
            animationDuration: '0.3s',
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
});

},{"./modalFactory":14,"domkit/appendVendorPrefix":1,"domkit/insertKeyframesRule":5}],14:[function(require,module,exports){
var React = require('react');
var transitionEvents = require('domkit/transitionEvents');

module.exports = function(animation){

    return React.createClass({
        propTypes: {
            className: React.PropTypes.string,
            // Close the modal when esc is pressed? Defaults to true.
            keyboard: React.PropTypes.bool,
            onShow: React.PropTypes.func,
            onHide: React.PropTypes.func,
            animation: React.PropTypes.object,
            backdrop: React.PropTypes.oneOfType([
                React.PropTypes.bool,
                React.PropTypes.string
            ]),
            backdropEvent: React.PropTypes.bool
        },

        getDefaultProps: function() {
            return {
                className: "",
                onShow: function(){},
                onHide: function(){},
                animation: animation,
                keyboard: true,
                backdrop: true,
                backdropEvent: true
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
            var ref = this.props.animation.getRef();
            var node = this.refs[ref];
            var endListener = function(e) {
                if (e && e.target !== node) {
                    return;
                }
                transitionEvents.removeEndEventListener(node, endListener);
                this.enter();

            }.bind(this);
            transitionEvents.addEndEventListener(node, endListener);
            
            window.addEventListener("keydown", this.listenKeyboard, true);
        },

        render: function() {

            var hidden = this.hasHidden();
            if(hidden) return null;

            var willHidden = this.state.willHidden;
            var animation = this.props.animation;
            var modalStyle = animation.getModalStyle(willHidden);
            var backdropStyle = animation.getBackdropStyle(willHidden);
            var contentStyle = animation.getContentStyle(willHidden);
            var ref = animation.getRef(willHidden);
            var sharp = animation.getSharp && animation.getSharp(willHidden);
            
            var backdropModifiers = {
                style: backdropStyle,
                onClick: this.props.backdropEvent ? this.hide : null
            };

            var backdrop = this.props.backdrop? React.createElement("div", backdropModifiers): undefined;

            if (this.props.customStyle) {
                for (var style in this.props.customStyle) {
                    modalStyle[style] = this.props.customStyle[style];
                };
            }

            if(willHidden) {
                var node = this.refs[ref];
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
                    sharp, 
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

        componentWillUnmount: function() {
            window.removeEventListener("keydown", this.listenKeyboard, true);
        },

    });

}

},{"domkit/transitionEvents":7,"react":undefined}],"boron":[function(require,module,exports){
module.exports = {
    DropModal: require('./DropModal'),
    WaveModal: require('./WaveModal'),
    FlyModal: require('./FlyModal'),
    FadeModal: require('./FadeModal'),
    ScaleModal: require('./ScaleModal'),
    OutlineModal: require('./OutlineModal'),
}

},{"./DropModal":8,"./FadeModal":9,"./FlyModal":10,"./OutlineModal":11,"./ScaleModal":12,"./WaveModal":13}]},{},[])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZG9ta2l0L2FwcGVuZFZlbmRvclByZWZpeC5qcyIsIm5vZGVfbW9kdWxlcy9kb21raXQvYnVpbHRpblN0eWxlLmpzIiwibm9kZV9tb2R1bGVzL2RvbWtpdC9nZXRWZW5kb3JQcmVmaXguanMiLCJub2RlX21vZHVsZXMvZG9ta2l0L2dldFZlbmRvclByb3BlcnR5TmFtZS5qcyIsIm5vZGVfbW9kdWxlcy9kb21raXQvaW5zZXJ0S2V5ZnJhbWVzUnVsZS5qcyIsIm5vZGVfbW9kdWxlcy9kb21raXQvaW5zZXJ0UnVsZS5qcyIsIm5vZGVfbW9kdWxlcy9kb21raXQvdHJhbnNpdGlvbkV2ZW50cy5qcyIsInNyYy9Ecm9wTW9kYWwuanMiLCJzcmMvRmFkZU1vZGFsLmpzIiwic3JjL0ZseU1vZGFsLmpzIiwic3JjL091dGxpbmVNb2RhbC5qcyIsInNyYy9TY2FsZU1vZGFsLmpzIiwic3JjL1dhdmVNb2RhbC5qcyIsInNyYy9tb2RhbEZhY3RvcnkuanMiLCJzcmMvQm9yb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciBnZXRWZW5kb3JQcm9wZXJ0eU5hbWUgPSByZXF1aXJlKCcuL2dldFZlbmRvclByb3BlcnR5TmFtZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRhcmdldCwgc291cmNlcykge1xuICB2YXIgdG8gPSBPYmplY3QodGFyZ2V0KTtcbiAgdmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuICBmb3IgKHZhciBuZXh0SW5kZXggPSAxOyBuZXh0SW5kZXggPCBhcmd1bWVudHMubGVuZ3RoOyBuZXh0SW5kZXgrKykge1xuICAgIHZhciBuZXh0U291cmNlID0gYXJndW1lbnRzW25leHRJbmRleF07XG4gICAgaWYgKG5leHRTb3VyY2UgPT0gbnVsbCkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgdmFyIGZyb20gPSBPYmplY3QobmV4dFNvdXJjZSk7XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gZnJvbSkge1xuICAgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwoZnJvbSwga2V5KSkge1xuICAgICAgICB0b1trZXldID0gZnJvbVtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHZhciBwcmVmaXhlZCA9IHt9O1xuICBmb3IgKHZhciBrZXkgaW4gdG8pIHtcbiAgICBwcmVmaXhlZFtnZXRWZW5kb3JQcm9wZXJ0eU5hbWUoa2V5KV0gPSB0b1trZXldXG4gIH1cblxuICByZXR1cm4gcHJlZml4ZWRcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKS5zdHlsZTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNzc1ZlbmRvclByZWZpeDtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcblxuICBpZiAoY3NzVmVuZG9yUHJlZml4KSByZXR1cm4gY3NzVmVuZG9yUHJlZml4O1xuXG4gIHZhciBzdHlsZXMgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsICcnKTtcbiAgdmFyIHByZSA9IChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChzdHlsZXMpLmpvaW4oJycpLm1hdGNoKC8tKG1venx3ZWJraXR8bXMpLS8pIHx8IChzdHlsZXMuT0xpbmsgPT09ICcnICYmIFsnJywgJ28nXSkpWzFdO1xuXG4gIHJldHVybiBjc3NWZW5kb3JQcmVmaXggPSAnLScgKyBwcmUgKyAnLSc7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBidWlsdGluU3R5bGUgPSByZXF1aXJlKCcuL2J1aWx0aW5TdHlsZScpO1xudmFyIHByZWZpeGVzID0gWydNb3onLCAnV2Via2l0JywgJ08nLCAnbXMnXTtcbnZhciBkb21WZW5kb3JQcmVmaXg7XG5cbi8vIEhlbHBlciBmdW5jdGlvbiB0byBnZXQgdGhlIHByb3BlciB2ZW5kb3IgcHJvcGVydHkgbmFtZS4gKHRyYW5zaXRpb24gPT4gV2Via2l0VHJhbnNpdGlvbilcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocHJvcCwgaXNTdXBwb3J0VGVzdCkge1xuXG4gIHZhciB2ZW5kb3JQcm9wO1xuICBpZiAocHJvcCBpbiBidWlsdGluU3R5bGUpIHJldHVybiBwcm9wO1xuXG4gIHZhciBVcHBlclByb3AgPSBwcm9wLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcHJvcC5zdWJzdHIoMSk7XG5cbiAgaWYgKGRvbVZlbmRvclByZWZpeCkge1xuXG4gICAgdmVuZG9yUHJvcCA9IGRvbVZlbmRvclByZWZpeCArIFVwcGVyUHJvcDtcbiAgICBpZiAodmVuZG9yUHJvcCBpbiBidWlsdGluU3R5bGUpIHtcbiAgICAgIHJldHVybiB2ZW5kb3JQcm9wO1xuICAgIH1cbiAgfSBlbHNlIHtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJlZml4ZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZlbmRvclByb3AgPSBwcmVmaXhlc1tpXSArIFVwcGVyUHJvcDtcbiAgICAgIGlmICh2ZW5kb3JQcm9wIGluIGJ1aWx0aW5TdHlsZSkge1xuICAgICAgICBkb21WZW5kb3JQcmVmaXggPSBwcmVmaXhlc1tpXTtcbiAgICAgICAgcmV0dXJuIHZlbmRvclByb3A7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gaWYgc3VwcG9ydCB0ZXN0LCBub3QgZmFsbGJhY2sgdG8gb3JpZ2luIHByb3AgbmFtZVxuICBpZiAoIWlzU3VwcG9ydFRlc3QpIHtcbiAgICByZXR1cm4gcHJvcDtcbiAgfVxuXG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpbnNlcnRSdWxlID0gcmVxdWlyZSgnLi9pbnNlcnRSdWxlJyk7XG52YXIgdmVuZG9yUHJlZml4ID0gcmVxdWlyZSgnLi9nZXRWZW5kb3JQcmVmaXgnKSgpO1xudmFyIGluZGV4ID0gMDtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihrZXlmcmFtZXMpIHtcbiAgLy8gcmFuZG9tIG5hbWVcbiAgdmFyIG5hbWUgPSAnYW5pbV8nICsgKCsraW5kZXgpICsgKCtuZXcgRGF0ZSk7XG4gIHZhciBjc3MgPSBcIkBcIiArIHZlbmRvclByZWZpeCArIFwia2V5ZnJhbWVzIFwiICsgbmFtZSArIFwiIHtcIjtcblxuICBmb3IgKHZhciBrZXkgaW4ga2V5ZnJhbWVzKSB7XG4gICAgY3NzICs9IGtleSArIFwiIHtcIjtcblxuICAgIGZvciAodmFyIHByb3BlcnR5IGluIGtleWZyYW1lc1trZXldKSB7XG4gICAgICB2YXIgcGFydCA9IFwiOlwiICsga2V5ZnJhbWVzW2tleV1bcHJvcGVydHldICsgXCI7XCI7XG4gICAgICAvLyBXZSBkbyB2ZW5kb3IgcHJlZml4IGZvciBldmVyeSBwcm9wZXJ0eVxuICAgICAgY3NzICs9IHZlbmRvclByZWZpeCArIHByb3BlcnR5ICsgcGFydDtcbiAgICAgIGNzcyArPSBwcm9wZXJ0eSArIHBhcnQ7XG4gICAgfVxuXG4gICAgY3NzICs9IFwifVwiO1xuICB9XG5cbiAgY3NzICs9IFwifVwiO1xuXG4gIGluc2VydFJ1bGUoY3NzKTtcblxuICByZXR1cm4gbmFtZVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZXh0cmFTaGVldDtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihjc3MpIHtcblxuICBpZiAoIWV4dHJhU2hlZXQpIHtcbiAgICAvLyBGaXJzdCB0aW1lLCBjcmVhdGUgYW4gZXh0cmEgc3R5bGVzaGVldCBmb3IgYWRkaW5nIHJ1bGVzXG4gICAgZXh0cmFTaGVldCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5hcHBlbmRDaGlsZChleHRyYVNoZWV0KTtcbiAgICAvLyBLZWVwIHJlZmVyZW5jZSB0byBhY3R1YWwgU3R5bGVTaGVldCBvYmplY3QgKGBzdHlsZVNoZWV0YCBmb3IgSUUgPCA5KVxuICAgIGV4dHJhU2hlZXQgPSBleHRyYVNoZWV0LnNoZWV0IHx8IGV4dHJhU2hlZXQuc3R5bGVTaGVldDtcbiAgfVxuXG4gIHZhciBpbmRleCA9IChleHRyYVNoZWV0LmNzc1J1bGVzIHx8IGV4dHJhU2hlZXQucnVsZXMpLmxlbmd0aDtcbiAgZXh0cmFTaGVldC5pbnNlcnRSdWxlKGNzcywgaW5kZXgpO1xuXG4gIHJldHVybiBleHRyYVNoZWV0O1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEVWRU5UX05BTUVfTUFQIGlzIHVzZWQgdG8gZGV0ZXJtaW5lIHdoaWNoIGV2ZW50IGZpcmVkIHdoZW4gYVxuICogdHJhbnNpdGlvbi9hbmltYXRpb24gZW5kcywgYmFzZWQgb24gdGhlIHN0eWxlIHByb3BlcnR5IHVzZWQgdG9cbiAqIGRlZmluZSB0aGF0IGV2ZW50LlxuICovXG52YXIgRVZFTlRfTkFNRV9NQVAgPSB7XG4gIHRyYW5zaXRpb25lbmQ6IHtcbiAgICAndHJhbnNpdGlvbic6ICd0cmFuc2l0aW9uZW5kJyxcbiAgICAnV2Via2l0VHJhbnNpdGlvbic6ICd3ZWJraXRUcmFuc2l0aW9uRW5kJyxcbiAgICAnTW96VHJhbnNpdGlvbic6ICdtb3pUcmFuc2l0aW9uRW5kJyxcbiAgICAnT1RyYW5zaXRpb24nOiAnb1RyYW5zaXRpb25FbmQnLFxuICAgICdtc1RyYW5zaXRpb24nOiAnTVNUcmFuc2l0aW9uRW5kJ1xuICB9LFxuXG4gIGFuaW1hdGlvbmVuZDoge1xuICAgICdhbmltYXRpb24nOiAnYW5pbWF0aW9uZW5kJyxcbiAgICAnV2Via2l0QW5pbWF0aW9uJzogJ3dlYmtpdEFuaW1hdGlvbkVuZCcsXG4gICAgJ01vekFuaW1hdGlvbic6ICdtb3pBbmltYXRpb25FbmQnLFxuICAgICdPQW5pbWF0aW9uJzogJ29BbmltYXRpb25FbmQnLFxuICAgICdtc0FuaW1hdGlvbic6ICdNU0FuaW1hdGlvbkVuZCdcbiAgfVxufTtcblxudmFyIGVuZEV2ZW50cyA9IFtdO1xuXG5mdW5jdGlvbiBkZXRlY3RFdmVudHMoKSB7XG4gIHZhciB0ZXN0RWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgdmFyIHN0eWxlID0gdGVzdEVsLnN0eWxlO1xuXG4gIC8vIE9uIHNvbWUgcGxhdGZvcm1zLCBpbiBwYXJ0aWN1bGFyIHNvbWUgcmVsZWFzZXMgb2YgQW5kcm9pZCA0LngsXG4gIC8vIHRoZSB1bi1wcmVmaXhlZCBcImFuaW1hdGlvblwiIGFuZCBcInRyYW5zaXRpb25cIiBwcm9wZXJ0aWVzIGFyZSBkZWZpbmVkIG9uIHRoZVxuICAvLyBzdHlsZSBvYmplY3QgYnV0IHRoZSBldmVudHMgdGhhdCBmaXJlIHdpbGwgc3RpbGwgYmUgcHJlZml4ZWQsIHNvIHdlIG5lZWRcbiAgLy8gdG8gY2hlY2sgaWYgdGhlIHVuLXByZWZpeGVkIGV2ZW50cyBhcmUgdXNlYWJsZSwgYW5kIGlmIG5vdCByZW1vdmUgdGhlbVxuICAvLyBmcm9tIHRoZSBtYXBcbiAgaWYgKCEoJ0FuaW1hdGlvbkV2ZW50JyBpbiB3aW5kb3cpKSB7XG4gICAgZGVsZXRlIEVWRU5UX05BTUVfTUFQLmFuaW1hdGlvbmVuZC5hbmltYXRpb247XG4gIH1cblxuICBpZiAoISgnVHJhbnNpdGlvbkV2ZW50JyBpbiB3aW5kb3cpKSB7XG4gICAgZGVsZXRlIEVWRU5UX05BTUVfTUFQLnRyYW5zaXRpb25lbmQudHJhbnNpdGlvbjtcbiAgfVxuXG4gIGZvciAodmFyIGJhc2VFdmVudE5hbWUgaW4gRVZFTlRfTkFNRV9NQVApIHtcbiAgICB2YXIgYmFzZUV2ZW50cyA9IEVWRU5UX05BTUVfTUFQW2Jhc2VFdmVudE5hbWVdO1xuICAgIGZvciAodmFyIHN0eWxlTmFtZSBpbiBiYXNlRXZlbnRzKSB7XG4gICAgICBpZiAoc3R5bGVOYW1lIGluIHN0eWxlKSB7XG4gICAgICAgIGVuZEV2ZW50cy5wdXNoKGJhc2VFdmVudHNbc3R5bGVOYW1lXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgZGV0ZWN0RXZlbnRzKCk7XG59XG5cblxuLy8gV2UgdXNlIHRoZSByYXcge2FkZHxyZW1vdmV9RXZlbnRMaXN0ZW5lcigpIGNhbGwgYmVjYXVzZSBFdmVudExpc3RlbmVyXG4vLyBkb2VzIG5vdCBrbm93IGhvdyB0byByZW1vdmUgZXZlbnQgbGlzdGVuZXJzIGFuZCB3ZSByZWFsbHkgc2hvdWxkXG4vLyBjbGVhbiB1cC4gQWxzbywgdGhlc2UgZXZlbnRzIGFyZSBub3QgdHJpZ2dlcmVkIGluIG9sZGVyIGJyb3dzZXJzXG4vLyBzbyB3ZSBzaG91bGQgYmUgQS1PSyBoZXJlLlxuXG5mdW5jdGlvbiBhZGRFdmVudExpc3RlbmVyKG5vZGUsIGV2ZW50TmFtZSwgZXZlbnRMaXN0ZW5lcikge1xuICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBldmVudExpc3RlbmVyLCBmYWxzZSk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXIobm9kZSwgZXZlbnROYW1lLCBldmVudExpc3RlbmVyKSB7XG4gIG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGV2ZW50TGlzdGVuZXIsIGZhbHNlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFkZEVuZEV2ZW50TGlzdGVuZXI6IGZ1bmN0aW9uKG5vZGUsIGV2ZW50TGlzdGVuZXIpIHtcbiAgICBpZiAoZW5kRXZlbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgLy8gSWYgQ1NTIHRyYW5zaXRpb25zIGFyZSBub3Qgc3VwcG9ydGVkLCB0cmlnZ2VyIGFuIFwiZW5kIGFuaW1hdGlvblwiXG4gICAgICAvLyBldmVudCBpbW1lZGlhdGVseS5cbiAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGV2ZW50TGlzdGVuZXIsIDApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBlbmRFdmVudHMuZm9yRWFjaChmdW5jdGlvbihlbmRFdmVudCkge1xuICAgICAgYWRkRXZlbnRMaXN0ZW5lcihub2RlLCBlbmRFdmVudCwgZXZlbnRMaXN0ZW5lcik7XG4gICAgfSk7XG4gIH0sXG5cbiAgcmVtb3ZlRW5kRXZlbnRMaXN0ZW5lcjogZnVuY3Rpb24obm9kZSwgZXZlbnRMaXN0ZW5lcikge1xuICAgIGlmIChlbmRFdmVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGVuZEV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVuZEV2ZW50KSB7XG4gICAgICByZW1vdmVFdmVudExpc3RlbmVyKG5vZGUsIGVuZEV2ZW50LCBldmVudExpc3RlbmVyKTtcbiAgICB9KTtcbiAgfVxufTtcbiIsInZhciBtb2RhbEZhY3RvcnkgPSByZXF1aXJlKCcuL21vZGFsRmFjdG9yeScpO1xudmFyIGluc2VydEtleWZyYW1lc1J1bGUgPSByZXF1aXJlKCdkb21raXQvaW5zZXJ0S2V5ZnJhbWVzUnVsZScpO1xudmFyIGFwcGVuZFZlbmRvclByZWZpeCA9IHJlcXVpcmUoJ2RvbWtpdC9hcHBlbmRWZW5kb3JQcmVmaXgnKTtcblxudmFyIGFuaW1hdGlvbiA9IHtcbiAgICBzaG93OiB7XG4gICAgICAgIGFuaW1hdGlvbkR1cmF0aW9uOiAnMC40cycsXG4gICAgICAgIGFuaW1hdGlvblRpbWluZ0Z1bmN0aW9uOiAnY3ViaWMtYmV6aWVyKDAuNywwLDAuMywxKSdcbiAgICB9LFxuXG4gICAgaGlkZToge1xuICAgICAgICBhbmltYXRpb25EdXJhdGlvbjogJzAuNHMnLFxuICAgICAgICBhbmltYXRpb25UaW1pbmdGdW5jdGlvbjogJ2N1YmljLWJlemllcigwLjcsMCwwLjMsMSknXG4gICAgfSxcblxuICAgIHNob3dNb2RhbEFuaW1hdGlvbjogaW5zZXJ0S2V5ZnJhbWVzUnVsZSh7XG4gICAgICAgICcwJSc6IHtcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXG4gICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUzZCgtNTAlLCAtMzAwcHgsIDApJ1xuICAgICAgICB9LFxuICAgICAgICAnMTAwJSc6IHtcbiAgICAgICAgICAgIG9wYWNpdHk6IDEsXG4gICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUzZCgtNTAlLCAtNTAlLCAwKSdcbiAgICAgICAgfVxuICAgIH0pLFxuXG4gICAgaGlkZU1vZGFsQW5pbWF0aW9uOiBpbnNlcnRLZXlmcmFtZXNSdWxlKHtcbiAgICAgICAgJzAlJzoge1xuICAgICAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZTNkKC01MCUsIC01MCUsIDApJ1xuICAgICAgICB9LFxuICAgICAgICAnMTAwJSc6IHtcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXG4gICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUzZCgtNTAlLCAxMDBweCwgMCknXG4gICAgICAgIH1cbiAgICB9KSxcblxuICAgIHNob3dCYWNrZHJvcEFuaW1hdGlvbjogaW5zZXJ0S2V5ZnJhbWVzUnVsZSh7XG4gICAgICAgICcwJSc6IHtcbiAgICAgICAgICAgIG9wYWNpdHk6IDBcbiAgICAgICAgfSxcbiAgICAgICAgJzEwMCUnOiB7XG4gICAgICAgICAgICBvcGFjaXR5OiAwLjlcbiAgICAgICAgfVxuICAgIH0pLFxuXG4gICAgaGlkZUJhY2tkcm9wQW5pbWF0aW9uOiBpbnNlcnRLZXlmcmFtZXNSdWxlKHtcbiAgICAgICAgJzAlJzoge1xuICAgICAgICAgICAgb3BhY2l0eTogMC45XG4gICAgICAgIH0sXG4gICAgICAgICcxMDAlJzoge1xuICAgICAgICAgICAgb3BhY2l0eTogMFxuICAgICAgICB9XG4gICAgfSksXG5cbiAgICBzaG93Q29udGVudEFuaW1hdGlvbjogaW5zZXJ0S2V5ZnJhbWVzUnVsZSh7XG4gICAgICAgICcwJSc6IHtcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXG4gICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUzZCgwLCAtMjBweCwgMCknXG4gICAgICAgIH0sXG4gICAgICAgICcxMDAlJzoge1xuICAgICAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZTNkKDAsIDAsIDApJ1xuICAgICAgICB9XG4gICAgfSksXG5cbiAgICBoaWRlQ29udGVudEFuaW1hdGlvbjogaW5zZXJ0S2V5ZnJhbWVzUnVsZSh7XG4gICAgICAgICcwJSc6IHtcbiAgICAgICAgICAgIG9wYWNpdHk6IDEsXG4gICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUzZCgwLCAwLCAwKSdcbiAgICAgICAgfSxcbiAgICAgICAgJzEwMCUnOiB7XG4gICAgICAgICAgICBvcGFjaXR5OiAwLFxuICAgICAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlM2QoMCwgNTBweCwgMCknXG4gICAgICAgIH1cbiAgICB9KVxufTtcblxudmFyIHNob3dBbmltYXRpb24gPSBhbmltYXRpb24uc2hvdztcbnZhciBoaWRlQW5pbWF0aW9uID0gYW5pbWF0aW9uLmhpZGU7XG52YXIgc2hvd01vZGFsQW5pbWF0aW9uID0gYW5pbWF0aW9uLnNob3dNb2RhbEFuaW1hdGlvbjtcbnZhciBoaWRlTW9kYWxBbmltYXRpb24gPSBhbmltYXRpb24uaGlkZU1vZGFsQW5pbWF0aW9uO1xudmFyIHNob3dCYWNrZHJvcEFuaW1hdGlvbiA9IGFuaW1hdGlvbi5zaG93QmFja2Ryb3BBbmltYXRpb247XG52YXIgaGlkZUJhY2tkcm9wQW5pbWF0aW9uID0gYW5pbWF0aW9uLmhpZGVCYWNrZHJvcEFuaW1hdGlvbjtcbnZhciBzaG93Q29udGVudEFuaW1hdGlvbiA9IGFuaW1hdGlvbi5zaG93Q29udGVudEFuaW1hdGlvbjtcbnZhciBoaWRlQ29udGVudEFuaW1hdGlvbiA9IGFuaW1hdGlvbi5oaWRlQ29udGVudEFuaW1hdGlvbjtcblxubW9kdWxlLmV4cG9ydHMgPSBtb2RhbEZhY3Rvcnkoe1xuICAgIGdldFJlZjogZnVuY3Rpb24od2lsbEhpZGRlbikge1xuICAgICAgICByZXR1cm4gJ21vZGFsJztcbiAgICB9LFxuICAgIGdldE1vZGFsU3R5bGU6IGZ1bmN0aW9uKHdpbGxIaWRkZW4pIHtcbiAgICAgICAgcmV0dXJuIGFwcGVuZFZlbmRvclByZWZpeCh7XG4gICAgICAgICAgICBwb3NpdGlvbjogXCJmaXhlZFwiLFxuICAgICAgICAgICAgd2lkdGg6IFwiNTAwcHhcIixcbiAgICAgICAgICAgIHRyYW5zZm9ybTogXCJ0cmFuc2xhdGUzZCgtNTAlLCAtNTAlLCAwKVwiLFxuICAgICAgICAgICAgdG9wOiBcIjUwJVwiLFxuICAgICAgICAgICAgbGVmdDogXCI1MCVcIixcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogXCJ3aGl0ZVwiLFxuICAgICAgICAgICAgekluZGV4OiAxMDUwLFxuICAgICAgICAgICAgYW5pbWF0aW9uRHVyYXRpb246ICh3aWxsSGlkZGVuID8gaGlkZUFuaW1hdGlvbiA6IHNob3dBbmltYXRpb24pLmFuaW1hdGlvbkR1cmF0aW9uLFxuICAgICAgICAgICAgYW5pbWF0aW9uRmlsbE1vZGU6ICdmb3J3YXJkcycsXG4gICAgICAgICAgICBhbmltYXRpb25OYW1lOiB3aWxsSGlkZGVuID8gaGlkZU1vZGFsQW5pbWF0aW9uIDogc2hvd01vZGFsQW5pbWF0aW9uLFxuICAgICAgICAgICAgYW5pbWF0aW9uVGltaW5nRnVuY3Rpb246ICh3aWxsSGlkZGVuID8gaGlkZUFuaW1hdGlvbiA6IHNob3dBbmltYXRpb24pLmFuaW1hdGlvblRpbWluZ0Z1bmN0aW9uXG4gICAgICAgIH0pXG4gICAgfSxcbiAgICBnZXRCYWNrZHJvcFN0eWxlOiBmdW5jdGlvbih3aWxsSGlkZGVuKSB7XG4gICAgICAgIHJldHVybiBhcHBlbmRWZW5kb3JQcmVmaXgoe1xuICAgICAgICAgICAgcG9zaXRpb246IFwiZml4ZWRcIixcbiAgICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICAgICAgYm90dG9tOiAwLFxuICAgICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICAgIHpJbmRleDogMTA0MCxcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogXCIjMzczQTQ3XCIsXG4gICAgICAgICAgICBhbmltYXRpb25EdXJhdGlvbjogKHdpbGxIaWRkZW4gPyBoaWRlQW5pbWF0aW9uIDogc2hvd0FuaW1hdGlvbikuYW5pbWF0aW9uRHVyYXRpb24sXG4gICAgICAgICAgICBhbmltYXRpb25GaWxsTW9kZTogJ2ZvcndhcmRzJyxcbiAgICAgICAgICAgIGFuaW1hdGlvbk5hbWU6IHdpbGxIaWRkZW4gPyBoaWRlQmFja2Ryb3BBbmltYXRpb24gOiBzaG93QmFja2Ryb3BBbmltYXRpb24sXG4gICAgICAgICAgICBhbmltYXRpb25UaW1pbmdGdW5jdGlvbjogKHdpbGxIaWRkZW4gPyBoaWRlQW5pbWF0aW9uIDogc2hvd0FuaW1hdGlvbikuYW5pbWF0aW9uVGltaW5nRnVuY3Rpb25cbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBnZXRDb250ZW50U3R5bGU6IGZ1bmN0aW9uKHdpbGxIaWRkZW4pIHtcbiAgICAgICAgcmV0dXJuIGFwcGVuZFZlbmRvclByZWZpeCh7XG4gICAgICAgICAgICBtYXJnaW46IDAsXG4gICAgICAgICAgICBhbmltYXRpb25EdXJhdGlvbjogKHdpbGxIaWRkZW4gPyBoaWRlQW5pbWF0aW9uIDogc2hvd0FuaW1hdGlvbikuYW5pbWF0aW9uRHVyYXRpb24sXG4gICAgICAgICAgICBhbmltYXRpb25GaWxsTW9kZTogJ2ZvcndhcmRzJyxcbiAgICAgICAgICAgIGFuaW1hdGlvbkRlbGF5OiAnMC4yNXMnLFxuICAgICAgICAgICAgYW5pbWF0aW9uTmFtZTogc2hvd0NvbnRlbnRBbmltYXRpb24sXG4gICAgICAgICAgICBhbmltYXRpb25UaW1pbmdGdW5jdGlvbjogKHdpbGxIaWRkZW4gPyBoaWRlQW5pbWF0aW9uIDogc2hvd0FuaW1hdGlvbikuYW5pbWF0aW9uVGltaW5nRnVuY3Rpb25cbiAgICAgICAgfSlcbiAgICB9XG59KTtcbiIsInZhciBtb2RhbEZhY3RvcnkgPSByZXF1aXJlKCcuL21vZGFsRmFjdG9yeScpO1xudmFyIGluc2VydEtleWZyYW1lc1J1bGUgPSByZXF1aXJlKCdkb21raXQvaW5zZXJ0S2V5ZnJhbWVzUnVsZScpO1xudmFyIGFwcGVuZFZlbmRvclByZWZpeCA9IHJlcXVpcmUoJ2RvbWtpdC9hcHBlbmRWZW5kb3JQcmVmaXgnKTtcblxudmFyIGFuaW1hdGlvbiA9IHtcbiAgICBzaG93OiB7XG4gICAgICAgIGFuaW1hdGlvbkR1cmF0aW9uOiAnMC4zcycsXG4gICAgICAgIGFuaW1hdGlvblRpbWluZ0Z1bmN0aW9uOiAnZWFzZS1vdXQnXG4gICAgfSxcbiAgICBoaWRlOiB7XG4gICAgICAgIGFuaW1hdGlvbkR1cmF0aW9uOiAnMC4zcycsXG4gICAgICAgIGFuaW1hdGlvblRpbWluZ0Z1bmN0aW9uOiAnZWFzZS1vdXQnXG4gICAgfSxcbiAgICBzaG93Q29udGVudEFuaW1hdGlvbjogaW5zZXJ0S2V5ZnJhbWVzUnVsZSh7XG5cbiAgICAgICAgJzAlJzoge1xuICAgICAgICAgICAgb3BhY2l0eTogMFxuICAgICAgICB9LFxuICAgICAgICAnMTAwJSc6IHtcbiAgICAgICAgICAgIG9wYWNpdHk6IDFcbiAgICAgICAgfVxuICAgIH0pLFxuXG4gICAgaGlkZUNvbnRlbnRBbmltYXRpb246IGluc2VydEtleWZyYW1lc1J1bGUoe1xuICAgICAgICAnMCUnOiB7XG4gICAgICAgICAgICBvcGFjaXR5OiAxXG4gICAgICAgIH0sXG4gICAgICAgICcxMDAlJzoge1xuICAgICAgICAgICAgb3BhY2l0eTogMFxuICAgICAgICB9XG4gICAgfSksXG5cbiAgICBzaG93QmFja2Ryb3BBbmltYXRpb246IGluc2VydEtleWZyYW1lc1J1bGUoe1xuICAgICAgICAnMCUnOiB7XG4gICAgICAgICAgICBvcGFjaXR5OiAwXG4gICAgICAgIH0sXG4gICAgICAgICcxMDAlJzoge1xuICAgICAgICAgICAgb3BhY2l0eTogMC45XG4gICAgICAgIH0sXG4gICAgfSksXG5cbiAgICBoaWRlQmFja2Ryb3BBbmltYXRpb246IGluc2VydEtleWZyYW1lc1J1bGUoe1xuICAgICAgICAnMCUnOiB7XG4gICAgICAgICAgICBvcGFjaXR5OiAwLjlcbiAgICAgICAgfSxcbiAgICAgICAgJzEwMCUnOiB7XG4gICAgICAgICAgICBvcGFjaXR5OiAwXG4gICAgICAgIH1cbiAgICB9KVxufTtcblxudmFyIHNob3dBbmltYXRpb24gPSBhbmltYXRpb24uc2hvdztcbnZhciBoaWRlQW5pbWF0aW9uID0gYW5pbWF0aW9uLmhpZGU7XG52YXIgc2hvd0NvbnRlbnRBbmltYXRpb24gPSBhbmltYXRpb24uc2hvd0NvbnRlbnRBbmltYXRpb247XG52YXIgaGlkZUNvbnRlbnRBbmltYXRpb24gPSBhbmltYXRpb24uaGlkZUNvbnRlbnRBbmltYXRpb247XG52YXIgc2hvd0JhY2tkcm9wQW5pbWF0aW9uID0gYW5pbWF0aW9uLnNob3dCYWNrZHJvcEFuaW1hdGlvbjtcbnZhciBoaWRlQmFja2Ryb3BBbmltYXRpb24gPSBhbmltYXRpb24uaGlkZUJhY2tkcm9wQW5pbWF0aW9uO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG1vZGFsRmFjdG9yeSh7XG4gICAgZ2V0UmVmOiBmdW5jdGlvbih3aWxsSGlkZGVuKSB7XG4gICAgICAgIHJldHVybiAnY29udGVudCc7XG4gICAgfSxcbiAgICBnZXRNb2RhbFN0eWxlOiBmdW5jdGlvbih3aWxsSGlkZGVuKSB7XG4gICAgICAgIHJldHVybiBhcHBlbmRWZW5kb3JQcmVmaXgoe1xuICAgICAgICAgICAgekluZGV4OiAxMDUwLFxuICAgICAgICAgICAgcG9zaXRpb246IFwiZml4ZWRcIixcbiAgICAgICAgICAgIHdpZHRoOiBcIjUwMHB4XCIsXG4gICAgICAgICAgICB0cmFuc2Zvcm06IFwidHJhbnNsYXRlM2QoLTUwJSwgLTUwJSwgMClcIixcbiAgICAgICAgICAgIHRvcDogXCI1MCVcIixcbiAgICAgICAgICAgIGxlZnQ6IFwiNTAlXCJcbiAgICAgICAgfSlcbiAgICB9LFxuICAgIGdldEJhY2tkcm9wU3R5bGU6IGZ1bmN0aW9uKHdpbGxIaWRkZW4pIHtcbiAgICAgICAgcmV0dXJuIGFwcGVuZFZlbmRvclByZWZpeCh7XG4gICAgICAgICAgICBwb3NpdGlvbjogXCJmaXhlZFwiLFxuICAgICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgICAgICBib3R0b206IDAsXG4gICAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgICAgekluZGV4OiAxMDQwLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcIiMzNzNBNDdcIixcbiAgICAgICAgICAgIGFuaW1hdGlvbkZpbGxNb2RlOiAnZm9yd2FyZHMnLFxuICAgICAgICAgICAgYW5pbWF0aW9uRHVyYXRpb246ICcwLjNzJyxcbiAgICAgICAgICAgIGFuaW1hdGlvbk5hbWU6IHdpbGxIaWRkZW4gPyBoaWRlQmFja2Ryb3BBbmltYXRpb24gOiBzaG93QmFja2Ryb3BBbmltYXRpb24sXG4gICAgICAgICAgICBhbmltYXRpb25UaW1pbmdGdW5jdGlvbjogKHdpbGxIaWRkZW4gPyBoaWRlQW5pbWF0aW9uIDogc2hvd0FuaW1hdGlvbikuYW5pbWF0aW9uVGltaW5nRnVuY3Rpb25cbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBnZXRDb250ZW50U3R5bGU6IGZ1bmN0aW9uKHdpbGxIaWRkZW4pIHtcbiAgICAgICAgcmV0dXJuIGFwcGVuZFZlbmRvclByZWZpeCh7XG4gICAgICAgICAgICBtYXJnaW46IDAsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwid2hpdGVcIixcbiAgICAgICAgICAgIGFuaW1hdGlvbkR1cmF0aW9uOiAod2lsbEhpZGRlbiA/IGhpZGVBbmltYXRpb24gOiBzaG93QW5pbWF0aW9uKS5hbmltYXRpb25EdXJhdGlvbixcbiAgICAgICAgICAgIGFuaW1hdGlvbkZpbGxNb2RlOiAnZm9yd2FyZHMnLFxuICAgICAgICAgICAgYW5pbWF0aW9uTmFtZTogd2lsbEhpZGRlbiA/IGhpZGVDb250ZW50QW5pbWF0aW9uIDogc2hvd0NvbnRlbnRBbmltYXRpb24sXG4gICAgICAgICAgICBhbmltYXRpb25UaW1pbmdGdW5jdGlvbjogKHdpbGxIaWRkZW4gPyBoaWRlQW5pbWF0aW9uIDogc2hvd0FuaW1hdGlvbikuYW5pbWF0aW9uVGltaW5nRnVuY3Rpb25cbiAgICAgICAgfSlcbiAgICB9XG59KTtcbiIsInZhciBtb2RhbEZhY3RvcnkgPSByZXF1aXJlKCcuL21vZGFsRmFjdG9yeScpO1xudmFyIGluc2VydEtleWZyYW1lc1J1bGUgPSByZXF1aXJlKCdkb21raXQvaW5zZXJ0S2V5ZnJhbWVzUnVsZScpO1xudmFyIGFwcGVuZFZlbmRvclByZWZpeCA9IHJlcXVpcmUoJ2RvbWtpdC9hcHBlbmRWZW5kb3JQcmVmaXgnKTtcblxudmFyIGFuaW1hdGlvbiA9IHtcbiAgICBzaG93OiB7XG4gICAgICAgIGFuaW1hdGlvbkR1cmF0aW9uOiAnMC41cycsXG4gICAgICAgIGFuaW1hdGlvblRpbWluZ0Z1bmN0aW9uOiAnZWFzZS1vdXQnXG4gICAgfSxcbiAgICBoaWRlOiB7XG4gICAgICAgIGFuaW1hdGlvbkR1cmF0aW9uOiAnMC41cycsXG4gICAgICAgIGFuaW1hdGlvblRpbWluZ0Z1bmN0aW9uOiAnZWFzZS1vdXQnXG4gICAgfSxcbiAgICBzaG93Q29udGVudEFuaW1hdGlvbjogaW5zZXJ0S2V5ZnJhbWVzUnVsZSh7XG5cbiAgICAgICAgJzAlJzoge1xuICAgICAgICAgICAgb3BhY2l0eTogMCxcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZTNkKGNhbGMoLTEwMHZ3IC0gNTAlKSwgMCwgMCknXG4gICAgICAgIH0sXG4gICAgICAgICc1MCUnOiB7XG4gICAgICAgICAgICBvcGFjaXR5OiAxLFxuICAgICAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlM2QoMTAwcHgsIDAsIDApJ1xuICAgICAgICB9LFxuICAgICAgICAnMTAwJSc6IHtcbiAgICAgICAgICAgIG9wYWNpdHk6IDEsXG4gICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUzZCgwLCAwLCAwKSdcbiAgICAgICAgfVxuICAgIH0pLFxuXG4gICAgaGlkZUNvbnRlbnRBbmltYXRpb246IGluc2VydEtleWZyYW1lc1J1bGUoe1xuXG4gICAgICAgICcwJSc6IHtcbiAgICAgICAgICAgIG9wYWNpdHk6IDEsXG4gICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUzZCgwLCAwLCAwKSdcbiAgICAgICAgfSxcbiAgICAgICAgJzUwJSc6IHtcbiAgICAgICAgICAgIG9wYWNpdHk6IDEsXG4gICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUzZCgtMTAwcHgsIDAsIDApIHNjYWxlM2QoMS4xLCAxLjEsIDEpJ1xuICAgICAgICB9LFxuICAgICAgICAnMTAwJSc6IHtcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXG4gICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUzZChjYWxjKDEwMHZ3ICsgNTAlKSwgMCwgMCknXG4gICAgICAgIH0sXG4gICAgfSksXG5cbiAgICBzaG93QmFja2Ryb3BBbmltYXRpb246IGluc2VydEtleWZyYW1lc1J1bGUoe1xuICAgICAgICAnMCUnOiB7XG4gICAgICAgICAgICBvcGFjaXR5OiAwXG4gICAgICAgIH0sXG4gICAgICAgICcxMDAlJzoge1xuICAgICAgICAgICAgb3BhY2l0eTogMC45XG4gICAgICAgIH0sXG4gICAgfSksXG5cbiAgICBoaWRlQmFja2Ryb3BBbmltYXRpb246IGluc2VydEtleWZyYW1lc1J1bGUoe1xuICAgICAgICAnMCUnOiB7XG4gICAgICAgICAgICBvcGFjaXR5OiAwLjlcbiAgICAgICAgfSxcbiAgICAgICAgJzkwJSc6IHtcbiAgICAgICAgICAgIG9wYWN0aXk6IDAuOVxuICAgICAgICB9LFxuICAgICAgICAnMTAwJSc6IHtcbiAgICAgICAgICAgIG9wYWNpdHk6IDBcbiAgICAgICAgfVxuICAgIH0pXG59O1xuXG52YXIgc2hvd0FuaW1hdGlvbiA9IGFuaW1hdGlvbi5zaG93O1xudmFyIGhpZGVBbmltYXRpb24gPSBhbmltYXRpb24uaGlkZTtcbnZhciBzaG93Q29udGVudEFuaW1hdGlvbiA9IGFuaW1hdGlvbi5zaG93Q29udGVudEFuaW1hdGlvbjtcbnZhciBoaWRlQ29udGVudEFuaW1hdGlvbiA9IGFuaW1hdGlvbi5oaWRlQ29udGVudEFuaW1hdGlvbjtcbnZhciBzaG93QmFja2Ryb3BBbmltYXRpb24gPSBhbmltYXRpb24uc2hvd0JhY2tkcm9wQW5pbWF0aW9uO1xudmFyIGhpZGVCYWNrZHJvcEFuaW1hdGlvbiA9IGFuaW1hdGlvbi5oaWRlQmFja2Ryb3BBbmltYXRpb247XG5cbm1vZHVsZS5leHBvcnRzID0gbW9kYWxGYWN0b3J5KHtcbiAgICBnZXRSZWY6IGZ1bmN0aW9uKHdpbGxIaWRkZW4pIHtcbiAgICAgICAgcmV0dXJuICdjb250ZW50JztcbiAgICB9LFxuICAgIGdldE1vZGFsU3R5bGU6IGZ1bmN0aW9uKHdpbGxIaWRkZW4pIHtcbiAgICAgICAgcmV0dXJuIGFwcGVuZFZlbmRvclByZWZpeCh7XG4gICAgICAgICAgICB6SW5kZXg6IDEwNTAsXG4gICAgICAgICAgICBwb3NpdGlvbjogXCJmaXhlZFwiLFxuICAgICAgICAgICAgd2lkdGg6IFwiNTAwcHhcIixcbiAgICAgICAgICAgIHRyYW5zZm9ybTogXCJ0cmFuc2xhdGUzZCgtNTAlLCAtNTAlLCAwKVwiLFxuICAgICAgICAgICAgdG9wOiBcIjUwJVwiLFxuICAgICAgICAgICAgbGVmdDogXCI1MCVcIlxuICAgICAgICB9KVxuICAgIH0sXG4gICAgZ2V0QmFja2Ryb3BTdHlsZTogZnVuY3Rpb24od2lsbEhpZGRlbikge1xuICAgICAgICByZXR1cm4gYXBwZW5kVmVuZG9yUHJlZml4KHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiBcImZpeGVkXCIsXG4gICAgICAgICAgICB0b3A6IDAsXG4gICAgICAgICAgICByaWdodDogMCxcbiAgICAgICAgICAgIGJvdHRvbTogMCxcbiAgICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgICB6SW5kZXg6IDEwNDAsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwiIzM3M0E0N1wiLFxuICAgICAgICAgICAgYW5pbWF0aW9uRmlsbE1vZGU6ICdmb3J3YXJkcycsXG4gICAgICAgICAgICBhbmltYXRpb25EdXJhdGlvbjogJzAuM3MnLFxuICAgICAgICAgICAgYW5pbWF0aW9uTmFtZTogd2lsbEhpZGRlbiA/IGhpZGVCYWNrZHJvcEFuaW1hdGlvbiA6IHNob3dCYWNrZHJvcEFuaW1hdGlvbixcbiAgICAgICAgICAgIGFuaW1hdGlvblRpbWluZ0Z1bmN0aW9uOiAod2lsbEhpZGRlbiA/IGhpZGVBbmltYXRpb24gOiBzaG93QW5pbWF0aW9uKS5hbmltYXRpb25UaW1pbmdGdW5jdGlvblxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIGdldENvbnRlbnRTdHlsZTogZnVuY3Rpb24od2lsbEhpZGRlbikge1xuICAgICAgICByZXR1cm4gYXBwZW5kVmVuZG9yUHJlZml4KHtcbiAgICAgICAgICAgIG1hcmdpbjogMCxcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogXCJ3aGl0ZVwiLFxuICAgICAgICAgICAgYW5pbWF0aW9uRHVyYXRpb246ICh3aWxsSGlkZGVuID8gaGlkZUFuaW1hdGlvbiA6IHNob3dBbmltYXRpb24pLmFuaW1hdGlvbkR1cmF0aW9uLFxuICAgICAgICAgICAgYW5pbWF0aW9uRmlsbE1vZGU6ICdmb3J3YXJkcycsXG4gICAgICAgICAgICBhbmltYXRpb25OYW1lOiB3aWxsSGlkZGVuID8gaGlkZUNvbnRlbnRBbmltYXRpb24gOiBzaG93Q29udGVudEFuaW1hdGlvbixcbiAgICAgICAgICAgIGFuaW1hdGlvblRpbWluZ0Z1bmN0aW9uOiAod2lsbEhpZGRlbiA/IGhpZGVBbmltYXRpb24gOiBzaG93QW5pbWF0aW9uKS5hbmltYXRpb25UaW1pbmdGdW5jdGlvblxuICAgICAgICB9KVxuICAgIH1cbn0pO1xuIiwidmFyIG1vZGFsRmFjdG9yeSA9IHJlcXVpcmUoJy4vbW9kYWxGYWN0b3J5Jyk7XG52YXIgaW5zZXJ0S2V5ZnJhbWVzUnVsZSA9IHJlcXVpcmUoJ2RvbWtpdC9pbnNlcnRLZXlmcmFtZXNSdWxlJyk7XG52YXIgYXBwZW5kVmVuZG9yUHJlZml4ID0gcmVxdWlyZSgnZG9ta2l0L2FwcGVuZFZlbmRvclByZWZpeCcpO1xuXG52YXIgYW5pbWF0aW9uID0ge1xuICAgIHNob3c6IHtcbiAgICAgICAgYW5pbWF0aW9uRHVyYXRpb246ICcwLjhzJyxcbiAgICAgICAgYW5pbWF0aW9uVGltaW5nRnVuY3Rpb246ICdjdWJpYy1iZXppZXIoMC42LDAsMC40LDEpJ1xuICAgIH0sXG4gICAgaGlkZToge1xuICAgICAgICBhbmltYXRpb25EdXJhdGlvbjogJzAuNHMnLFxuICAgICAgICBhbmltYXRpb25UaW1pbmdGdW5jdGlvbjogJ2Vhc2Utb3V0J1xuICAgIH0sXG4gICAgc2hvd0NvbnRlbnRBbmltYXRpb246IGluc2VydEtleWZyYW1lc1J1bGUoe1xuICAgICAgICAnMCUnOiB7XG4gICAgICAgICAgICBvcGFjaXR5OiAwLFxuICAgICAgICB9LFxuICAgICAgICAnNDAlJzp7XG4gICAgICAgICAgICBvcGFjaXR5OiAwXG4gICAgICAgIH0sXG4gICAgICAgICcxMDAlJzoge1xuICAgICAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgfVxuICAgIH0pLFxuXG4gICAgaGlkZUNvbnRlbnRBbmltYXRpb246IGluc2VydEtleWZyYW1lc1J1bGUoe1xuICAgICAgICAnMCUnOiB7XG4gICAgICAgICAgICBvcGFjaXR5OiAxXG4gICAgICAgIH0sXG4gICAgICAgICcxMDAlJzoge1xuICAgICAgICAgICAgb3BhY2l0eTogMCxcbiAgICAgICAgfVxuICAgIH0pLFxuXG4gICAgc2hvd0JhY2tkcm9wQW5pbWF0aW9uOiBpbnNlcnRLZXlmcmFtZXNSdWxlKHtcbiAgICAgICAgJzAlJzoge1xuICAgICAgICAgICAgb3BhY2l0eTogMFxuICAgICAgICB9LFxuICAgICAgICAnMTAwJSc6IHtcbiAgICAgICAgICAgIG9wYWNpdHk6IDAuOVxuICAgICAgICB9LFxuICAgIH0pLFxuXG4gICAgaGlkZUJhY2tkcm9wQW5pbWF0aW9uOiBpbnNlcnRLZXlmcmFtZXNSdWxlKHtcbiAgICAgICAgJzAlJzoge1xuICAgICAgICAgICAgb3BhY2l0eTogMC45XG4gICAgICAgIH0sXG4gICAgICAgICcxMDAlJzoge1xuICAgICAgICAgICAgb3BhY2l0eTogMFxuICAgICAgICB9XG4gICAgfSlcbn07XG5cbnZhciBzaG93QW5pbWF0aW9uID0gYW5pbWF0aW9uLnNob3c7XG52YXIgaGlkZUFuaW1hdGlvbiA9IGFuaW1hdGlvbi5oaWRlO1xudmFyIHNob3dDb250ZW50QW5pbWF0aW9uID0gYW5pbWF0aW9uLnNob3dDb250ZW50QW5pbWF0aW9uO1xudmFyIGhpZGVDb250ZW50QW5pbWF0aW9uID0gYW5pbWF0aW9uLmhpZGVDb250ZW50QW5pbWF0aW9uO1xudmFyIHNob3dCYWNrZHJvcEFuaW1hdGlvbiA9IGFuaW1hdGlvbi5zaG93QmFja2Ryb3BBbmltYXRpb247XG52YXIgaGlkZUJhY2tkcm9wQW5pbWF0aW9uID0gYW5pbWF0aW9uLmhpZGVCYWNrZHJvcEFuaW1hdGlvbjtcblxubW9kdWxlLmV4cG9ydHMgPSBtb2RhbEZhY3Rvcnkoe1xuICAgIGdldFJlZjogZnVuY3Rpb24od2lsbEhpZGRlbikge1xuICAgICAgICByZXR1cm4gJ2NvbnRlbnQnO1xuICAgIH0sXG4gICAgZ2V0U2hhcnA6IGZ1bmN0aW9uKHdpbGxIaWRkZW4pIHtcbiAgICAgICAgdmFyIHN0cm9rZURhc2hMZW5ndGggPSAxNjgwO1xuXG4gICAgICAgIHZhciBzaG93U2hhcnBBbmltYXRpb24gPSBpbnNlcnRLZXlmcmFtZXNSdWxlKHtcbiAgICAgICAgICAgICcwJSc6IHtcbiAgICAgICAgICAgICAgICAnc3Ryb2tlLWRhc2hvZmZzZXQnOiBzdHJva2VEYXNoTGVuZ3RoXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJzEwMCUnOiB7XG4gICAgICAgICAgICAgICAgJ3N0cm9rZS1kYXNob2Zmc2V0JzogMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG5cblxuICAgICAgICB2YXIgc2hhcnBTdHlsZSA9IHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgd2lkdGg6ICdjYWxjKDEwMCUpJyxcbiAgICAgICAgICAgIGhlaWdodDogJ2NhbGMoMTAwJSknLFxuICAgICAgICAgICAgekluZGV4OiAnLTEnXG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIHJlY3RTdHlsZSA9IGFwcGVuZFZlbmRvclByZWZpeCh7XG4gICAgICAgICAgICBhbmltYXRpb25EdXJhdGlvbjogd2lsbEhpZGRlbj8gJzAuNHMnIDonMC44cycsXG4gICAgICAgICAgICBhbmltYXRpb25GaWxsTW9kZTogJ2ZvcndhcmRzJyxcbiAgICAgICAgICAgIGFuaW1hdGlvbk5hbWU6IHdpbGxIaWRkZW4/IGhpZGVDb250ZW50QW5pbWF0aW9uOiBzaG93U2hhcnBBbmltYXRpb24sXG4gICAgICAgICAgICBzdHJva2U6ICcjZmZmZmZmJyxcbiAgICAgICAgICAgIHN0cm9rZVdpZHRoOiAnMnB4JyxcbiAgICAgICAgICAgIHN0cm9rZURhc2hhcnJheTogc3Ryb2tlRGFzaExlbmd0aFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7c3R5bGU6IHNoYXJwU3R5bGV9LCBcbiAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJzdmdcIiwge1xuICAgICAgICAgICAgICAgIHhtbG5zOiBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFxuICAgICAgICAgICAgICAgIHdpZHRoOiBcIjEwMCVcIiwgXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBcIjEwMCVcIiwgXG4gICAgICAgICAgICAgICAgdmlld0JveDogXCIwIDAgNDk2IDEzNlwiLCBcbiAgICAgICAgICAgICAgICBwcmVzZXJ2ZUFzcGVjdFJhdGlvOiBcIm5vbmVcIn0sIFxuICAgICAgICAgICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXCJyZWN0XCIsIHtzdHlsZTogcmVjdFN0eWxlLCBcbiAgICAgICAgICAgICAgICAgICAgeDogXCIyXCIsIFxuICAgICAgICAgICAgICAgICAgICB5OiBcIjJcIiwgXG4gICAgICAgICAgICAgICAgICAgIGZpbGw6IFwibm9uZVwiLCBcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IFwiNDkyXCIsIFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IFwiMTMyXCJ9KVxuICAgICAgICAgICAgKVxuICAgICAgICApXG4gICAgfSxcbiAgICBnZXRNb2RhbFN0eWxlOiBmdW5jdGlvbih3aWxsSGlkZGVuKSB7XG4gICAgICAgIHJldHVybiBhcHBlbmRWZW5kb3JQcmVmaXgoe1xuICAgICAgICAgICAgekluZGV4OiAxMDUwLFxuICAgICAgICAgICAgcG9zaXRpb246IFwiZml4ZWRcIixcbiAgICAgICAgICAgIHdpZHRoOiBcIjUwMHB4XCIsXG4gICAgICAgICAgICB0cmFuc2Zvcm06IFwidHJhbnNsYXRlM2QoLTUwJSwgLTUwJSwgMClcIixcbiAgICAgICAgICAgIHRvcDogXCI1MCVcIixcbiAgICAgICAgICAgIGxlZnQ6IFwiNTAlXCJcbiAgICAgICAgfSlcbiAgICB9LFxuICAgIGdldEJhY2tkcm9wU3R5bGU6IGZ1bmN0aW9uKHdpbGxIaWRkZW4pIHtcbiAgICAgICAgcmV0dXJuIGFwcGVuZFZlbmRvclByZWZpeCh7XG4gICAgICAgICAgICBwb3NpdGlvbjogXCJmaXhlZFwiLFxuICAgICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgICAgICBib3R0b206IDAsXG4gICAgICAgICAgICBsZWZ0OiAwLFxuICAgICAgICAgICAgekluZGV4OiAxMDQwLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcIiMzNzNBNDdcIixcbiAgICAgICAgICAgIGFuaW1hdGlvbkZpbGxNb2RlOiAnZm9yd2FyZHMnLFxuICAgICAgICAgICAgYW5pbWF0aW9uRHVyYXRpb246ICcwLjRzJyxcbiAgICAgICAgICAgIGFuaW1hdGlvbk5hbWU6IHdpbGxIaWRkZW4gPyBoaWRlQmFja2Ryb3BBbmltYXRpb24gOiBzaG93QmFja2Ryb3BBbmltYXRpb24sXG4gICAgICAgICAgICBhbmltYXRpb25UaW1pbmdGdW5jdGlvbjogKHdpbGxIaWRkZW4gPyBoaWRlQW5pbWF0aW9uIDogc2hvd0FuaW1hdGlvbikuYW5pbWF0aW9uVGltaW5nRnVuY3Rpb25cbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBnZXRDb250ZW50U3R5bGU6IGZ1bmN0aW9uKHdpbGxIaWRkZW4pIHtcbiAgICAgICAgcmV0dXJuIGFwcGVuZFZlbmRvclByZWZpeCh7XG4gICAgICAgICAgICBtYXJnaW46IDAsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwid2hpdGVcIixcbiAgICAgICAgICAgIGFuaW1hdGlvbkR1cmF0aW9uOiAod2lsbEhpZGRlbiA/IGhpZGVBbmltYXRpb24gOiBzaG93QW5pbWF0aW9uKS5hbmltYXRpb25EdXJhdGlvbixcbiAgICAgICAgICAgIGFuaW1hdGlvbkZpbGxNb2RlOiAnZm9yd2FyZHMnLFxuICAgICAgICAgICAgYW5pbWF0aW9uTmFtZTogd2lsbEhpZGRlbiA/IGhpZGVDb250ZW50QW5pbWF0aW9uIDogc2hvd0NvbnRlbnRBbmltYXRpb24sXG4gICAgICAgICAgICBhbmltYXRpb25UaW1pbmdGdW5jdGlvbjogKHdpbGxIaWRkZW4gPyBoaWRlQW5pbWF0aW9uIDogc2hvd0FuaW1hdGlvbikuYW5pbWF0aW9uVGltaW5nRnVuY3Rpb25cbiAgICAgICAgfSlcbiAgICB9XG59KTtcbiIsInZhciBtb2RhbEZhY3RvcnkgPSByZXF1aXJlKCcuL21vZGFsRmFjdG9yeScpO1xudmFyIGluc2VydEtleWZyYW1lc1J1bGUgPSByZXF1aXJlKCdkb21raXQvaW5zZXJ0S2V5ZnJhbWVzUnVsZScpO1xudmFyIGFwcGVuZFZlbmRvclByZWZpeCA9IHJlcXVpcmUoJ2RvbWtpdC9hcHBlbmRWZW5kb3JQcmVmaXgnKTtcblxudmFyIGFuaW1hdGlvbiA9IHtcbiAgICBzaG93OiB7XG4gICAgICAgIGFuaW1hdGlvbkR1cmF0aW9uOiAnMC40cycsXG4gICAgICAgIGFuaW1hdGlvblRpbWluZ0Z1bmN0aW9uOiAnY3ViaWMtYmV6aWVyKDAuNiwwLDAuNCwxKSdcbiAgICB9LFxuICAgIGhpZGU6IHtcbiAgICAgICAgYW5pbWF0aW9uRHVyYXRpb246ICcwLjRzJyxcbiAgICAgICAgYW5pbWF0aW9uVGltaW5nRnVuY3Rpb246ICdlYXNlLW91dCdcbiAgICB9LFxuICAgIHNob3dDb250ZW50QW5pbWF0aW9uOiBpbnNlcnRLZXlmcmFtZXNSdWxlKHtcbiAgICAgICAgJzAlJzoge1xuICAgICAgICAgICAgb3BhY2l0eTogMCxcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ3NjYWxlM2QoMCwgMCwgMSknXG4gICAgICAgIH0sXG4gICAgICAgICcxMDAlJzoge1xuICAgICAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ3NjYWxlM2QoMSwgMSwgMSknXG4gICAgICAgIH1cbiAgICB9KSxcblxuICAgIGhpZGVDb250ZW50QW5pbWF0aW9uOiBpbnNlcnRLZXlmcmFtZXNSdWxlKHtcbiAgICAgICAgJzAlJzoge1xuICAgICAgICAgICAgb3BhY2l0eTogMVxuICAgICAgICB9LFxuICAgICAgICAnMTAwJSc6IHtcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXG4gICAgICAgICAgICB0cmFuc2Zvcm06ICdzY2FsZTNkKDAuNSwgMC41LCAxKSdcbiAgICAgICAgfVxuICAgIH0pLFxuXG4gICAgc2hvd0JhY2tkcm9wQW5pbWF0aW9uOiBpbnNlcnRLZXlmcmFtZXNSdWxlKHtcbiAgICAgICAgJzAlJzoge1xuICAgICAgICAgICAgb3BhY2l0eTogMFxuICAgICAgICB9LFxuICAgICAgICAnMTAwJSc6IHtcbiAgICAgICAgICAgIG9wYWNpdHk6IDAuOVxuICAgICAgICB9LFxuICAgIH0pLFxuXG4gICAgaGlkZUJhY2tkcm9wQW5pbWF0aW9uOiBpbnNlcnRLZXlmcmFtZXNSdWxlKHtcbiAgICAgICAgJzAlJzoge1xuICAgICAgICAgICAgb3BhY2l0eTogMC45XG4gICAgICAgIH0sXG4gICAgICAgICcxMDAlJzoge1xuICAgICAgICAgICAgb3BhY2l0eTogMFxuICAgICAgICB9XG4gICAgfSlcbn07XG5cbnZhciBzaG93QW5pbWF0aW9uID0gYW5pbWF0aW9uLnNob3c7XG52YXIgaGlkZUFuaW1hdGlvbiA9IGFuaW1hdGlvbi5oaWRlO1xudmFyIHNob3dDb250ZW50QW5pbWF0aW9uID0gYW5pbWF0aW9uLnNob3dDb250ZW50QW5pbWF0aW9uO1xudmFyIGhpZGVDb250ZW50QW5pbWF0aW9uID0gYW5pbWF0aW9uLmhpZGVDb250ZW50QW5pbWF0aW9uO1xudmFyIHNob3dCYWNrZHJvcEFuaW1hdGlvbiA9IGFuaW1hdGlvbi5zaG93QmFja2Ryb3BBbmltYXRpb247XG52YXIgaGlkZUJhY2tkcm9wQW5pbWF0aW9uID0gYW5pbWF0aW9uLmhpZGVCYWNrZHJvcEFuaW1hdGlvbjtcblxubW9kdWxlLmV4cG9ydHMgPSBtb2RhbEZhY3Rvcnkoe1xuICAgIGdldFJlZjogZnVuY3Rpb24od2lsbEhpZGRlbikge1xuICAgICAgICByZXR1cm4gJ2NvbnRlbnQnO1xuICAgIH0sXG4gICAgZ2V0TW9kYWxTdHlsZTogZnVuY3Rpb24od2lsbEhpZGRlbikge1xuICAgICAgICByZXR1cm4gYXBwZW5kVmVuZG9yUHJlZml4KHtcbiAgICAgICAgICAgIHpJbmRleDogMTA1MCxcbiAgICAgICAgICAgIHBvc2l0aW9uOiBcImZpeGVkXCIsXG4gICAgICAgICAgICB3aWR0aDogXCI1MDBweFwiLFxuICAgICAgICAgICAgdHJhbnNmb3JtOiBcInRyYW5zbGF0ZTNkKC01MCUsIC01MCUsIDApXCIsXG4gICAgICAgICAgICB0b3A6IFwiNTAlXCIsXG4gICAgICAgICAgICBsZWZ0OiBcIjUwJVwiXG4gICAgICAgIH0pXG4gICAgfSxcbiAgICBnZXRCYWNrZHJvcFN0eWxlOiBmdW5jdGlvbih3aWxsSGlkZGVuKSB7XG4gICAgICAgIHJldHVybiBhcHBlbmRWZW5kb3JQcmVmaXgoe1xuICAgICAgICAgICAgcG9zaXRpb246IFwiZml4ZWRcIixcbiAgICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICAgICAgYm90dG9tOiAwLFxuICAgICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICAgIHpJbmRleDogMTA0MCxcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogXCIjMzczQTQ3XCIsXG4gICAgICAgICAgICBhbmltYXRpb25GaWxsTW9kZTogJ2ZvcndhcmRzJyxcbiAgICAgICAgICAgIGFuaW1hdGlvbkR1cmF0aW9uOiAnMC40cycsXG4gICAgICAgICAgICBhbmltYXRpb25OYW1lOiB3aWxsSGlkZGVuID8gaGlkZUJhY2tkcm9wQW5pbWF0aW9uIDogc2hvd0JhY2tkcm9wQW5pbWF0aW9uLFxuICAgICAgICAgICAgYW5pbWF0aW9uVGltaW5nRnVuY3Rpb246ICh3aWxsSGlkZGVuID8gaGlkZUFuaW1hdGlvbiA6IHNob3dBbmltYXRpb24pLmFuaW1hdGlvblRpbWluZ0Z1bmN0aW9uXG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgZ2V0Q29udGVudFN0eWxlOiBmdW5jdGlvbih3aWxsSGlkZGVuKSB7XG4gICAgICAgIHJldHVybiBhcHBlbmRWZW5kb3JQcmVmaXgoe1xuICAgICAgICAgICAgbWFyZ2luOiAwLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcIndoaXRlXCIsXG4gICAgICAgICAgICBhbmltYXRpb25EdXJhdGlvbjogKHdpbGxIaWRkZW4gPyBoaWRlQW5pbWF0aW9uIDogc2hvd0FuaW1hdGlvbikuYW5pbWF0aW9uRHVyYXRpb24sXG4gICAgICAgICAgICBhbmltYXRpb25GaWxsTW9kZTogJ2ZvcndhcmRzJyxcbiAgICAgICAgICAgIGFuaW1hdGlvbk5hbWU6IHdpbGxIaWRkZW4gPyBoaWRlQ29udGVudEFuaW1hdGlvbiA6IHNob3dDb250ZW50QW5pbWF0aW9uLFxuICAgICAgICAgICAgYW5pbWF0aW9uVGltaW5nRnVuY3Rpb246ICh3aWxsSGlkZGVuID8gaGlkZUFuaW1hdGlvbiA6IHNob3dBbmltYXRpb24pLmFuaW1hdGlvblRpbWluZ0Z1bmN0aW9uXG4gICAgICAgIH0pXG4gICAgfVxufSk7XG4iLCJ2YXIgbW9kYWxGYWN0b3J5ID0gcmVxdWlyZSgnLi9tb2RhbEZhY3RvcnknKTtcbnZhciBpbnNlcnRLZXlmcmFtZXNSdWxlID0gcmVxdWlyZSgnZG9ta2l0L2luc2VydEtleWZyYW1lc1J1bGUnKTtcbnZhciBhcHBlbmRWZW5kb3JQcmVmaXggPSByZXF1aXJlKCdkb21raXQvYXBwZW5kVmVuZG9yUHJlZml4Jyk7XG5cbnZhciBhbmltYXRpb24gPSB7XG4gICAgc2hvdzoge1xuICAgICAgICBhbmltYXRpb25EdXJhdGlvbjogJzFzJyxcbiAgICAgICAgYW5pbWF0aW9uVGltaW5nRnVuY3Rpb246ICdsaW5lYXInXG4gICAgfSxcbiAgICBoaWRlOiB7XG4gICAgICAgIGFuaW1hdGlvbkR1cmF0aW9uOiAnMC4zcycsXG4gICAgICAgIGFuaW1hdGlvblRpbWluZ0Z1bmN0aW9uOiAnZWFzZS1vdXQnXG4gICAgfSxcbiAgICBzaG93Q29udGVudEFuaW1hdGlvbjogaW5zZXJ0S2V5ZnJhbWVzUnVsZSh7XG4gICAgICAgICcwJSc6IHtcbiAgICAgICAgICAgIG9wYWNpdHk6IDAsXG4gICAgICAgICAgICB0cmFuc2Zvcm06ICdtYXRyaXgzZCgwLjcsIDAsIDAsIDAsIDAsIDAuNywgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCwgMCwgMSknXG4gICAgICAgIH0sXG4gICAgICAgICcyLjA4MzMzMyUnOiB7XG4gICAgICAgICAgICB0cmFuc2Zvcm06ICdtYXRyaXgzZCgwLjc1MjY2LCAwLCAwLCAwLCAwLCAwLjc2MzQyLCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxKSdcbiAgICAgICAgfSxcbiAgICAgICAgJzQuMTY2NjY3JSc6IHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ21hdHJpeDNkKDAuODEwNzEsIDAsIDAsIDAsIDAsIDAuODQ1NDUsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDEpJ1xuICAgICAgICB9LFxuICAgICAgICAnNi4yNSUnOiB7XG4gICAgICAgICAgICB0cmFuc2Zvcm06ICdtYXRyaXgzZCgwLjg2ODA4LCAwLCAwLCAwLCAwLCAwLjkyODYsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDEpJ1xuICAgICAgICB9LFxuICAgICAgICAnOC4zMzMzMzMlJzoge1xuICAgICAgICAgICAgdHJhbnNmb3JtOiAnbWF0cml4M2QoMC45MjAzOCwgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCwgMCwgMSknXG4gICAgICAgIH0sXG4gICAgICAgICcxMC40MTY2NjclJzoge1xuICAgICAgICAgICAgdHJhbnNmb3JtOiAnbWF0cml4M2QoMC45NjQ4MiwgMCwgMCwgMCwgMCwgMS4wNTIwMiwgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCwgMCwgMSknXG4gICAgICAgIH0sXG4gICAgICAgICcxMi41JSc6IHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ21hdHJpeDNkKDEsIDAsIDAsIDAsIDAsIDEuMDgyMDQsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDEpJ1xuICAgICAgICB9LFxuICAgICAgICAnMTQuNTgzMzMzJSc6IHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ21hdHJpeDNkKDEuMDI1NjMsIDAsIDAsIDAsIDAsIDEuMDkxNDksIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDEpJ1xuICAgICAgICB9LFxuICAgICAgICAnMTYuNjY2NjY3JSc6IHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ21hdHJpeDNkKDEuMDQyMjcsIDAsIDAsIDAsIDAsIDEuMDg0NTMsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDEpJ1xuICAgICAgICB9LFxuICAgICAgICAnMTguNzUlJzoge1xuICAgICAgICAgICAgdHJhbnNmb3JtOiAnbWF0cml4M2QoMS4wNTEwMiwgMCwgMCwgMCwgMCwgMS4wNjY2NiwgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCwgMCwgMSknXG4gICAgICAgIH0sXG4gICAgICAgICcyMC44MzMzMzMlJzoge1xuICAgICAgICAgICAgdHJhbnNmb3JtOiAnbWF0cml4M2QoMS4wNTMzNCwgMCwgMCwgMCwgMCwgMS4wNDM1NSwgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCwgMCwgMSknXG4gICAgICAgIH0sXG4gICAgICAgICcyMi45MTY2NjclJzoge1xuICAgICAgICAgICAgdHJhbnNmb3JtOiAnbWF0cml4M2QoMS4wNTA3OCwgMCwgMCwgMCwgMCwgMS4wMjAxMiwgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCwgMCwgMSknXG4gICAgICAgIH0sXG4gICAgICAgICcyNSUnOiB7XG4gICAgICAgICAgICB0cmFuc2Zvcm06ICdtYXRyaXgzZCgxLjA0NDg3LCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxKSdcbiAgICAgICAgfSxcbiAgICAgICAgJzI3LjA4MzMzMyUnOiB7XG4gICAgICAgICAgICB0cmFuc2Zvcm06ICdtYXRyaXgzZCgxLjAzNjk5LCAwLCAwLCAwLCAwLCAwLjk4NTM0LCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxKSdcbiAgICAgICAgfSxcbiAgICAgICAgJzI5LjE2NjY2NyUnOiB7XG4gICAgICAgICAgICB0cmFuc2Zvcm06ICdtYXRyaXgzZCgxLjAyODMxLCAwLCAwLCAwLCAwLCAwLjk3Njg4LCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxKSdcbiAgICAgICAgfSxcbiAgICAgICAgJzMxLjI1JSc6IHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ21hdHJpeDNkKDEuMDE5NzMsIDAsIDAsIDAsIDAsIDAuOTc0MjIsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDEpJ1xuICAgICAgICB9LFxuICAgICAgICAnMzMuMzMzMzMzJSc6IHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ21hdHJpeDNkKDEuMDExOTEsIDAsIDAsIDAsIDAsIDAuOTc2MTgsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDEpJ1xuICAgICAgICB9LFxuICAgICAgICAnMzUuNDE2NjY3JSc6IHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ21hdHJpeDNkKDEuMDA1MjYsIDAsIDAsIDAsIDAsIDAuOTgxMjIsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDEpJ1xuICAgICAgICB9LFxuICAgICAgICAnMzcuNSUnOiB7XG4gICAgICAgICAgICB0cmFuc2Zvcm06ICdtYXRyaXgzZCgxLCAwLCAwLCAwLCAwLCAwLjk4NzczLCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxKSdcbiAgICAgICAgfSxcbiAgICAgICAgJzM5LjU4MzMzMyUnOiB7XG4gICAgICAgICAgICB0cmFuc2Zvcm06ICdtYXRyaXgzZCgwLjk5NjE3LCAwLCAwLCAwLCAwLCAwLjk5NDMzLCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxKSdcbiAgICAgICAgfSxcbiAgICAgICAgJzQxLjY2NjY2NyUnOiB7XG4gICAgICAgICAgICB0cmFuc2Zvcm06ICdtYXRyaXgzZCgwLjk5MzY4LCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxKSdcbiAgICAgICAgfSxcbiAgICAgICAgJzQzLjc1JSc6IHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ21hdHJpeDNkKDAuOTkyMzcsIDAsIDAsIDAsIDAsIDEuMDA0MTMsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDEpJ1xuICAgICAgICB9LFxuICAgICAgICAnNDUuODMzMzMzJSc6IHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ21hdHJpeDNkKDAuOTkyMDIsIDAsIDAsIDAsIDAsIDEuMDA2NTEsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDEpJ1xuICAgICAgICB9LFxuICAgICAgICAnNDcuOTE2NjY3JSc6IHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ21hdHJpeDNkKDAuOTkyNDEsIDAsIDAsIDAsIDAsIDEuMDA3MjYsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDEpJ1xuICAgICAgICB9LFxuICAgICAgICAnNTAlJzoge1xuICAgICAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ21hdHJpeDNkKDAuOTkzMjksIDAsIDAsIDAsIDAsIDEuMDA2NzEsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDEpJ1xuICAgICAgICB9LFxuICAgICAgICAnNTIuMDgzMzMzJSc6IHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ21hdHJpeDNkKDAuOTk0NDcsIDAsIDAsIDAsIDAsIDEuMDA1MjksIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDEpJ1xuICAgICAgICB9LFxuICAgICAgICAnNTQuMTY2NjY3JSc6IHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ21hdHJpeDNkKDAuOTk1NzcsIDAsIDAsIDAsIDAsIDEuMDAzNDYsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDEpJ1xuICAgICAgICB9LFxuICAgICAgICAnNTYuMjUlJzoge1xuICAgICAgICAgICAgdHJhbnNmb3JtOiAnbWF0cml4M2QoMC45OTcwNSwgMCwgMCwgMCwgMCwgMS4wMDE2LCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxKSdcbiAgICAgICAgfSxcbiAgICAgICAgJzU4LjMzMzMzMyUnOiB7XG4gICAgICAgICAgICB0cmFuc2Zvcm06ICdtYXRyaXgzZCgwLjk5ODIyLCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxKSdcbiAgICAgICAgfSxcbiAgICAgICAgJzYwLjQxNjY2NyUnOiB7XG4gICAgICAgICAgICB0cmFuc2Zvcm06ICdtYXRyaXgzZCgwLjk5OTIxLCAwLCAwLCAwLCAwLCAwLjk5ODg0LCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxKSdcbiAgICAgICAgfSxcbiAgICAgICAgJzYyLjUlJzoge1xuICAgICAgICAgICAgdHJhbnNmb3JtOiAnbWF0cml4M2QoMSwgMCwgMCwgMCwgMCwgMC45OTgxNiwgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCwgMCwgMSknXG4gICAgICAgIH0sXG4gICAgICAgICc2NC41ODMzMzMlJzoge1xuICAgICAgICAgICAgdHJhbnNmb3JtOiAnbWF0cml4M2QoMS4wMDA1NywgMCwgMCwgMCwgMCwgMC45OTc5NSwgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCwgMCwgMSknXG4gICAgICAgIH0sXG4gICAgICAgICc2Ni42NjY2NjclJzoge1xuICAgICAgICAgICAgdHJhbnNmb3JtOiAnbWF0cml4M2QoMS4wMDA5NSwgMCwgMCwgMCwgMCwgMC45OTgxMSwgMCwgMCwgMCwgMCwgMSwgMCwgMCwgMCwgMCwgMSknXG4gICAgICAgIH0sXG4gICAgICAgICc2OC43NSUnOiB7XG4gICAgICAgICAgICB0cmFuc2Zvcm06ICdtYXRyaXgzZCgxLjAwMTE0LCAwLCAwLCAwLCAwLCAwLjk5ODUxLCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxKSdcbiAgICAgICAgfSxcbiAgICAgICAgJzcwLjgzMzMzMyUnOiB7XG4gICAgICAgICAgICB0cmFuc2Zvcm06ICdtYXRyaXgzZCgxLjAwMTE5LCAwLCAwLCAwLCAwLCAwLjk5OTAzLCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxKSdcbiAgICAgICAgfSxcbiAgICAgICAgJzcyLjkxNjY2NyUnOiB7XG4gICAgICAgICAgICB0cmFuc2Zvcm06ICdtYXRyaXgzZCgxLjAwMTE0LCAwLCAwLCAwLCAwLCAwLjk5OTU1LCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxKSdcbiAgICAgICAgfSxcbiAgICAgICAgJzc1JSc6IHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ21hdHJpeDNkKDEuMDAxLCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxKSdcbiAgICAgICAgfSxcbiAgICAgICAgJzc3LjA4MzMzMyUnOiB7XG4gICAgICAgICAgICB0cmFuc2Zvcm06ICdtYXRyaXgzZCgxLjAwMDgzLCAwLCAwLCAwLCAwLCAxLjAwMDMzLCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxKSdcbiAgICAgICAgfSxcbiAgICAgICAgJzc5LjE2NjY2NyUnOiB7XG4gICAgICAgICAgICB0cmFuc2Zvcm06ICdtYXRyaXgzZCgxLjAwMDYzLCAwLCAwLCAwLCAwLCAxLjAwMDUyLCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxKSdcbiAgICAgICAgfSxcbiAgICAgICAgJzgxLjI1JSc6IHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ21hdHJpeDNkKDEuMDAwNDQsIDAsIDAsIDAsIDAsIDEuMDAwNTgsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDEpJ1xuICAgICAgICB9LFxuICAgICAgICAnODMuMzMzMzMzJSc6IHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ21hdHJpeDNkKDEuMDAwMjcsIDAsIDAsIDAsIDAsIDEuMDAwNTMsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDEpJ1xuICAgICAgICB9LFxuICAgICAgICAnODUuNDE2NjY3JSc6IHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ21hdHJpeDNkKDEuMDAwMTIsIDAsIDAsIDAsIDAsIDEuMDAwNDIsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDEpJ1xuICAgICAgICB9LFxuICAgICAgICAnODcuNSUnOiB7XG4gICAgICAgICAgICB0cmFuc2Zvcm06ICdtYXRyaXgzZCgxLCAwLCAwLCAwLCAwLCAxLjAwMDI3LCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxKSdcbiAgICAgICAgfSxcbiAgICAgICAgJzg5LjU4MzMzMyUnOiB7XG4gICAgICAgICAgICB0cmFuc2Zvcm06ICdtYXRyaXgzZCgwLjk5OTkxLCAwLCAwLCAwLCAwLCAxLjAwMDEzLCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxKSdcbiAgICAgICAgfSxcbiAgICAgICAgJzkxLjY2NjY2NyUnOiB7XG4gICAgICAgICAgICB0cmFuc2Zvcm06ICdtYXRyaXgzZCgwLjk5OTg2LCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxKSdcbiAgICAgICAgfSxcbiAgICAgICAgJzkzLjc1JSc6IHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ21hdHJpeDNkKDAuOTk5ODMsIDAsIDAsIDAsIDAsIDAuOTk5OTEsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDEpJ1xuICAgICAgICB9LFxuICAgICAgICAnOTUuODMzMzMzJSc6IHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ21hdHJpeDNkKDAuOTk5ODIsIDAsIDAsIDAsIDAsIDAuOTk5ODUsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDEpJ1xuICAgICAgICB9LFxuICAgICAgICAnOTcuOTE2NjY3JSc6IHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ21hdHJpeDNkKDAuOTk5ODMsIDAsIDAsIDAsIDAsIDAuOTk5ODQsIDAsIDAsIDAsIDAsIDEsIDAsIDAsIDAsIDAsIDEpJ1xuICAgICAgICB9LFxuICAgICAgICAnMTAwJSc6IHtcbiAgICAgICAgICAgIG9wYWNpdHk6IDEsXG4gICAgICAgICAgICB0cmFuc2Zvcm06ICdtYXRyaXgzZCgxLCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxLCAwLCAwLCAwLCAwLCAxKSdcbiAgICAgICAgfVxuICAgIH0pLFxuXG4gICAgaGlkZUNvbnRlbnRBbmltYXRpb246IGluc2VydEtleWZyYW1lc1J1bGUoe1xuICAgICAgICAnMCUnOiB7XG4gICAgICAgICAgICBvcGFjaXR5OiAxXG4gICAgICAgIH0sXG4gICAgICAgICcxMDAlJzoge1xuICAgICAgICAgICAgb3BhY2l0eTogMCxcbiAgICAgICAgICAgIHRyYW5zZm9ybTogJ3NjYWxlM2QoMC44LCAwLjgsIDEpJ1xuICAgICAgICB9LFxuICAgIH0pLFxuXG4gICAgc2hvd0JhY2tkcm9wQW5pbWF0aW9uOiBpbnNlcnRLZXlmcmFtZXNSdWxlKHtcbiAgICAgICAgJzAlJzoge1xuICAgICAgICAgICAgb3BhY2l0eTogMFxuICAgICAgICB9LFxuICAgICAgICAnMTAwJSc6IHtcbiAgICAgICAgICAgIG9wYWNpdHk6IDAuOVxuICAgICAgICB9LFxuICAgIH0pLFxuXG4gICAgaGlkZUJhY2tkcm9wQW5pbWF0aW9uOiBpbnNlcnRLZXlmcmFtZXNSdWxlKHtcbiAgICAgICAgJzAlJzoge1xuICAgICAgICAgICAgb3BhY2l0eTogMC45XG4gICAgICAgIH0sXG4gICAgICAgICcxMDAlJzoge1xuICAgICAgICAgICAgb3BhY2l0eTogMFxuICAgICAgICB9XG4gICAgfSlcbn07XG5cbnZhciBzaG93QW5pbWF0aW9uID0gYW5pbWF0aW9uLnNob3c7XG52YXIgaGlkZUFuaW1hdGlvbiA9IGFuaW1hdGlvbi5oaWRlO1xudmFyIHNob3dDb250ZW50QW5pbWF0aW9uID0gYW5pbWF0aW9uLnNob3dDb250ZW50QW5pbWF0aW9uO1xudmFyIGhpZGVDb250ZW50QW5pbWF0aW9uID0gYW5pbWF0aW9uLmhpZGVDb250ZW50QW5pbWF0aW9uO1xudmFyIHNob3dCYWNrZHJvcEFuaW1hdGlvbiA9IGFuaW1hdGlvbi5zaG93QmFja2Ryb3BBbmltYXRpb247XG52YXIgaGlkZUJhY2tkcm9wQW5pbWF0aW9uID0gYW5pbWF0aW9uLmhpZGVCYWNrZHJvcEFuaW1hdGlvbjtcblxubW9kdWxlLmV4cG9ydHMgPSBtb2RhbEZhY3Rvcnkoe1xuICAgIGdldFJlZjogZnVuY3Rpb24od2lsbEhpZGRlbikge1xuICAgICAgICByZXR1cm4gJ2NvbnRlbnQnO1xuICAgIH0sXG4gICAgZ2V0TW9kYWxTdHlsZTogZnVuY3Rpb24od2lsbEhpZGRlbikge1xuICAgICAgICByZXR1cm4gYXBwZW5kVmVuZG9yUHJlZml4KHtcbiAgICAgICAgICAgIHpJbmRleDogMTA1MCxcbiAgICAgICAgICAgIHBvc2l0aW9uOiBcImZpeGVkXCIsXG4gICAgICAgICAgICB3aWR0aDogXCI1MDBweFwiLFxuICAgICAgICAgICAgdHJhbnNmb3JtOiBcInRyYW5zbGF0ZTNkKC01MCUsIC01MCUsIDApXCIsXG4gICAgICAgICAgICB0b3A6IFwiNTAlXCIsXG4gICAgICAgICAgICBsZWZ0OiBcIjUwJVwiXG4gICAgICAgIH0pXG4gICAgfSxcbiAgICBnZXRCYWNrZHJvcFN0eWxlOiBmdW5jdGlvbih3aWxsSGlkZGVuKSB7XG4gICAgICAgIHJldHVybiBhcHBlbmRWZW5kb3JQcmVmaXgoe1xuICAgICAgICAgICAgcG9zaXRpb246IFwiZml4ZWRcIixcbiAgICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICAgICAgYm90dG9tOiAwLFxuICAgICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICAgIHpJbmRleDogMTA0MCxcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogXCIjMzczQTQ3XCIsXG4gICAgICAgICAgICBhbmltYXRpb25GaWxsTW9kZTogJ2ZvcndhcmRzJyxcbiAgICAgICAgICAgIGFuaW1hdGlvbkR1cmF0aW9uOiAnMC4zcycsXG4gICAgICAgICAgICBhbmltYXRpb25OYW1lOiB3aWxsSGlkZGVuID8gaGlkZUJhY2tkcm9wQW5pbWF0aW9uIDogc2hvd0JhY2tkcm9wQW5pbWF0aW9uLFxuICAgICAgICAgICAgYW5pbWF0aW9uVGltaW5nRnVuY3Rpb246ICh3aWxsSGlkZGVuID8gaGlkZUFuaW1hdGlvbiA6IHNob3dBbmltYXRpb24pLmFuaW1hdGlvblRpbWluZ0Z1bmN0aW9uXG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgZ2V0Q29udGVudFN0eWxlOiBmdW5jdGlvbih3aWxsSGlkZGVuKSB7XG4gICAgICAgIHJldHVybiBhcHBlbmRWZW5kb3JQcmVmaXgoe1xuICAgICAgICAgICAgbWFyZ2luOiAwLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcIndoaXRlXCIsXG4gICAgICAgICAgICBhbmltYXRpb25EdXJhdGlvbjogKHdpbGxIaWRkZW4gPyBoaWRlQW5pbWF0aW9uIDogc2hvd0FuaW1hdGlvbikuYW5pbWF0aW9uRHVyYXRpb24sXG4gICAgICAgICAgICBhbmltYXRpb25GaWxsTW9kZTogJ2ZvcndhcmRzJyxcbiAgICAgICAgICAgIGFuaW1hdGlvbk5hbWU6IHdpbGxIaWRkZW4gPyBoaWRlQ29udGVudEFuaW1hdGlvbiA6IHNob3dDb250ZW50QW5pbWF0aW9uLFxuICAgICAgICAgICAgYW5pbWF0aW9uVGltaW5nRnVuY3Rpb246ICh3aWxsSGlkZGVuID8gaGlkZUFuaW1hdGlvbiA6IHNob3dBbmltYXRpb24pLmFuaW1hdGlvblRpbWluZ0Z1bmN0aW9uXG4gICAgICAgIH0pXG4gICAgfVxufSk7XG4iLCJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIHRyYW5zaXRpb25FdmVudHMgPSByZXF1aXJlKCdkb21raXQvdHJhbnNpdGlvbkV2ZW50cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFuaW1hdGlvbil7XG5cbiAgICByZXR1cm4gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgICAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgICAgIGNsYXNzTmFtZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgICAgIC8vIENsb3NlIHRoZSBtb2RhbCB3aGVuIGVzYyBpcyBwcmVzc2VkPyBEZWZhdWx0cyB0byB0cnVlLlxuICAgICAgICAgICAga2V5Ym9hcmQ6IFJlYWN0LlByb3BUeXBlcy5ib29sLFxuICAgICAgICAgICAgb25TaG93OiBSZWFjdC5Qcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgICAgIG9uSGlkZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgICAgICBhbmltYXRpb246IFJlYWN0LlByb3BUeXBlcy5vYmplY3QsXG4gICAgICAgICAgICBiYWNrZHJvcDogUmVhY3QuUHJvcFR5cGVzLm9uZU9mVHlwZShbXG4gICAgICAgICAgICAgICAgUmVhY3QuUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgICAgICAgICAgUmVhY3QuUHJvcFR5cGVzLnN0cmluZ1xuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBiYWNrZHJvcEV2ZW50OiBSZWFjdC5Qcm9wVHlwZXMuYm9vbFxuICAgICAgICB9LFxuXG4gICAgICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJcIixcbiAgICAgICAgICAgICAgICBvblNob3c6IGZ1bmN0aW9uKCl7fSxcbiAgICAgICAgICAgICAgICBvbkhpZGU6IGZ1bmN0aW9uKCl7fSxcbiAgICAgICAgICAgICAgICBhbmltYXRpb246IGFuaW1hdGlvbixcbiAgICAgICAgICAgICAgICBrZXlib2FyZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBiYWNrZHJvcDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBiYWNrZHJvcEV2ZW50OiB0cnVlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgd2lsbEhpZGRlbjogZmFsc2UsXG4gICAgICAgICAgICAgICAgaGlkZGVuOiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGFzSGlkZGVuOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuaGlkZGVuO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgdmFyIHJlZiA9IHRoaXMucHJvcHMuYW5pbWF0aW9uLmdldFJlZigpO1xuICAgICAgICAgICAgdmFyIG5vZGUgPSB0aGlzLnJlZnNbcmVmXTtcbiAgICAgICAgICAgIHZhciBlbmRMaXN0ZW5lciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZSAmJiBlLnRhcmdldCAhPT0gbm9kZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRyYW5zaXRpb25FdmVudHMucmVtb3ZlRW5kRXZlbnRMaXN0ZW5lcihub2RlLCBlbmRMaXN0ZW5lcik7XG4gICAgICAgICAgICAgICAgdGhpcy5lbnRlcigpO1xuXG4gICAgICAgICAgICB9LmJpbmQodGhpcyk7XG4gICAgICAgICAgICB0cmFuc2l0aW9uRXZlbnRzLmFkZEVuZEV2ZW50TGlzdGVuZXIobm9kZSwgZW5kTGlzdGVuZXIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5saXN0ZW5LZXlib2FyZCwgdHJ1ZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdmFyIGhpZGRlbiA9IHRoaXMuaGFzSGlkZGVuKCk7XG4gICAgICAgICAgICBpZihoaWRkZW4pIHJldHVybiBudWxsO1xuXG4gICAgICAgICAgICB2YXIgd2lsbEhpZGRlbiA9IHRoaXMuc3RhdGUud2lsbEhpZGRlbjtcbiAgICAgICAgICAgIHZhciBhbmltYXRpb24gPSB0aGlzLnByb3BzLmFuaW1hdGlvbjtcbiAgICAgICAgICAgIHZhciBtb2RhbFN0eWxlID0gYW5pbWF0aW9uLmdldE1vZGFsU3R5bGUod2lsbEhpZGRlbik7XG4gICAgICAgICAgICB2YXIgYmFja2Ryb3BTdHlsZSA9IGFuaW1hdGlvbi5nZXRCYWNrZHJvcFN0eWxlKHdpbGxIaWRkZW4pO1xuICAgICAgICAgICAgdmFyIGNvbnRlbnRTdHlsZSA9IGFuaW1hdGlvbi5nZXRDb250ZW50U3R5bGUod2lsbEhpZGRlbik7XG4gICAgICAgICAgICB2YXIgcmVmID0gYW5pbWF0aW9uLmdldFJlZih3aWxsSGlkZGVuKTtcbiAgICAgICAgICAgIHZhciBzaGFycCA9IGFuaW1hdGlvbi5nZXRTaGFycCAmJiBhbmltYXRpb24uZ2V0U2hhcnAod2lsbEhpZGRlbik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZhciBiYWNrZHJvcE1vZGlmaWVycyA9IHtcbiAgICAgICAgICAgICAgICBzdHlsZTogYmFja2Ryb3BTdHlsZSxcbiAgICAgICAgICAgICAgICBvbkNsaWNrOiB0aGlzLnByb3BzLmJhY2tkcm9wRXZlbnQgPyB0aGlzLmhpZGUgOiBudWxsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgYmFja2Ryb3AgPSB0aGlzLnByb3BzLmJhY2tkcm9wPyBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIGJhY2tkcm9wTW9kaWZpZXJzKTogdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5jdXN0b21TdHlsZSkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHN0eWxlIGluIHRoaXMucHJvcHMuY3VzdG9tU3R5bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbW9kYWxTdHlsZVtzdHlsZV0gPSB0aGlzLnByb3BzLmN1c3RvbVN0eWxlW3N0eWxlXTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZih3aWxsSGlkZGVuKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5vZGUgPSB0aGlzLnJlZnNbcmVmXTtcbiAgICAgICAgICAgICAgICB2YXIgZW5kTGlzdGVuZXIgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlICYmIGUudGFyZ2V0ICE9PSBub2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uRXZlbnRzLnJlbW92ZUVuZEV2ZW50TGlzdGVuZXIobm9kZSwgZW5kTGlzdGVuZXIpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxlYXZlKCk7XG5cbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyk7XG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbkV2ZW50cy5hZGRFbmRFdmVudExpc3RlbmVyKG5vZGUsIGVuZExpc3RlbmVyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIChSZWFjdC5jcmVhdGVFbGVtZW50KFwic3BhblwiLCBudWxsLCBcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtyZWY6IFwibW9kYWxcIiwgc3R5bGU6IG1vZGFsU3R5bGUsIGNsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWV9LCBcbiAgICAgICAgICAgICAgICAgICAgc2hhcnAsIFxuICAgICAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtyZWY6IFwiY29udGVudFwiLCB0YWJJbmRleDogXCItMVwiLCBzdHlsZTogY29udGVudFN0eWxlfSwgXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmNoaWxkcmVuXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApLCBcbiAgICAgICAgICAgICAgICBiYWNrZHJvcFxuICAgICAgICAgICAgICkpXG4gICAgICAgICAgICA7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbGVhdmU6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBoaWRkZW46IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkhpZGUoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBlbnRlcjogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25TaG93KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvdzogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlmKCF0aGlzLmhhc0hpZGRlbigpKSByZXR1cm47XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHdpbGxIaWRkZW46IGZhbHNlLFxuICAgICAgICAgICAgICAgIGhpZGRlbjogZmFsc2VcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhpZGU6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpZih0aGlzLmhhc0hpZGRlbigpKSByZXR1cm47XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHdpbGxIaWRkZW46IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHRvZ2dsZTogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlmKHRoaXMuaGFzSGlkZGVuKCkpXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93KCk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbGlzdGVuS2V5Ym9hcmQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5rZXlib2FyZCAmJlxuICAgICAgICAgICAgICAgICAgICAoZXZlbnQua2V5ID09PSBcIkVzY2FwZVwiIHx8XG4gICAgICAgICAgICAgICAgICAgICBldmVudC5rZXlDb2RlID09PSAyNykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhpZGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBjb21wb25lbnRXaWxsVW5tb3VudDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5saXN0ZW5LZXlib2FyZCwgdHJ1ZSk7XG4gICAgICAgIH0sXG5cbiAgICB9KTtcblxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgRHJvcE1vZGFsOiByZXF1aXJlKCcuL0Ryb3BNb2RhbCcpLFxuICAgIFdhdmVNb2RhbDogcmVxdWlyZSgnLi9XYXZlTW9kYWwnKSxcbiAgICBGbHlNb2RhbDogcmVxdWlyZSgnLi9GbHlNb2RhbCcpLFxuICAgIEZhZGVNb2RhbDogcmVxdWlyZSgnLi9GYWRlTW9kYWwnKSxcbiAgICBTY2FsZU1vZGFsOiByZXF1aXJlKCcuL1NjYWxlTW9kYWwnKSxcbiAgICBPdXRsaW5lTW9kYWw6IHJlcXVpcmUoJy4vT3V0bGluZU1vZGFsJyksXG59XG4iXX0=
