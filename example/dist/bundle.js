require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/yuanyan/React/powers/node_modules/react-kit/appendVendorPrefix.js":[function(require,module,exports){
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

},{"./getVendorPropertyName":"/Users/yuanyan/React/powers/node_modules/react-kit/getVendorPropertyName.js"}],"/Users/yuanyan/React/powers/node_modules/react-kit/getVendorPrefix.js":[function(require,module,exports){
'use strict';

var cssVendorPrefix;

module.exports = function (){

    if(cssVendorPrefix) return cssVendorPrefix;

    var styles = window.getComputedStyle(document.documentElement, '');
    var pre = (Array.prototype.slice.call(styles).join('').match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
    )[1];

    return cssVendorPrefix = '-' + pre + '-';
}

},{}],"/Users/yuanyan/React/powers/node_modules/react-kit/getVendorPropertyName.js":[function(require,module,exports){
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

},{}],"/Users/yuanyan/React/powers/node_modules/react-kit/insertKeyframesRule.js":[function(require,module,exports){
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

},{"./getVendorPrefix":"/Users/yuanyan/React/powers/node_modules/react-kit/getVendorPrefix.js","./insertRule":"/Users/yuanyan/React/powers/node_modules/react-kit/insertRule.js"}],"/Users/yuanyan/React/powers/node_modules/react-kit/insertRule.js":[function(require,module,exports){
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

},{}],"powers":[function(require,module,exports){
var React = require('react');
var appendVendorPrefix = require('react-kit/appendVendorPrefix');
var insertKeyframesRule = require('react-kit/insertKeyframesRule');

var animationDuration = 400;

var showModalAnimation = insertKeyframesRule({
    '0%': {
        opacity: 0,
        transform: 'translate3d(-50%, -400px, 0)'
    },
    '100%': {
        opacity: 1,
        transform: 'translate3d(-50%, -50%, 0)'
    }
});

var hideModalAnimation = insertKeyframesRule({
    '0%': {
        opacity: 1,
        transform: 'translate3d(-50%, -50%, 0)'
    },
    '100%': {
        opacity: 0,
        transform: 'translate3d(-50%, 100px, 0)'
    }
});

var showBackdropAnimation = insertKeyframesRule({
    '0%': {
        opacity: 0
    },
    '100%': {
        opacity: 0.7
    }
});

var hideBackdropAnimation = insertKeyframesRule({
    '0%': {
        opacity: 0.7
    },
    '100%': {
        opacity: 0
    }
});

var showContentAnimation = insertKeyframesRule({
    '0%': {
        opacity: 0,
        transform: 'translate3d(0, -100px, 0)'
    },
    '100%': {
        opacity: 1,
        transform: 'translate3d(0, 0, 0)'
    }
});

var hideContentAnimation = insertKeyframesRule({
    '0%': {
        opacity: 1,
        transform: 'translate3d(0, 0, 0)'
    },
    '100%': {
        opacity: 0,
        transform: 'translate3d(0, 50px, 0)'
    }
});

module.exports = React.createClass({displayName: "exports",
    propTypes: {
        className: React.PropTypes.string,
        // Close the modal when esc is pressed? Defaults to true.
        keyboard: React.PropTypes.bool,
        hidden: React.PropTypes.bool,
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
            hidden: true
        }
    },

    hasHidden: function(){
        return this.state.hidden;
    },

    render: function() {

        var hidden = this.hasHidden();
        if(hidden) return null;

        var modalStyle = appendVendorPrefix({
            position: "fixed",
            width: "500px",
            transform: "translate3d(-50%, -50%, 0)",
            top: "50%",
            left: "50%",
            backgroundColor: "white",
            zIndex: 1050,
            animationDuration: '0.4s',
            animationFillMode: 'forwards',
            animationName: hidden? hideModalAnimation: showModalAnimation,
            animationTimingFunction: 'cubic-bezier(0.7,0,0.3,1)'
        });

        var backdropStyle = appendVendorPrefix({
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: 1040,
            backgroundColor: "black",
            animationDuration: '0.4s',
            animationFillMode: 'forwards',
            animationName: hidden? hideBackdropAnimation: showBackdropAnimation,
            animationTimingFunction: 'cubic-bezier(0.7,0,0.3,1)'
        });

        var contentStyle = appendVendorPrefix({
            animationDuration: '0.4s',
	        animationFillMode: 'forwards',
            animationDelay: '0.25s',
            animationName: showContentAnimation,
	        animationTimingFunction: 'cubic-bezier(0.7,0,0.3,1)'
        });

        var modal = (
            React.createElement("div", {ref: "modal", style: modalStyle, tabIndex: "-1", className: this.props.className}, 
                React.createElement("div", {ref: "content", style: contentStyle}, 
                    this.props.children
                )
            )
        );

        var backdrop = React.createElement("div", {ref: "backdrop", onClick: this.hide, style: backdropStyle});

        return React.createElement("div", null, 
            modal, 
            backdrop
        );
    },

    show: function(){
        if(!this.hasHidden()) return;

        this.setState({
            hidden: false
        });

        var self = this;
        // after animation end
        setTimeout(function(){
            self.props.onShow();
        }, animationDuration);
    },

    hide: function(){

        if(this.hasHidden()) return;

        this.setState({
            hidden: true
        });

        var self = this;
        // after animation end
        setTimeout(function(){
            self.props.onHide();
        }, animationDuration);
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
    }
});

},{"react":false,"react-kit/appendVendorPrefix":"/Users/yuanyan/React/powers/node_modules/react-kit/appendVendorPrefix.js","react-kit/insertKeyframesRule":"/Users/yuanyan/React/powers/node_modules/react-kit/insertKeyframesRule.js"}]},{},[])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcmVhY3Qta2l0L2FwcGVuZFZlbmRvclByZWZpeC5qcyIsIm5vZGVfbW9kdWxlcy9yZWFjdC1raXQvZ2V0VmVuZG9yUHJlZml4LmpzIiwibm9kZV9tb2R1bGVzL3JlYWN0LWtpdC9nZXRWZW5kb3JQcm9wZXJ0eU5hbWUuanMiLCJub2RlX21vZHVsZXMvcmVhY3Qta2l0L2luc2VydEtleWZyYW1lc1J1bGUuanMiLCJub2RlX21vZHVsZXMvcmVhY3Qta2l0L2luc2VydFJ1bGUuanMiLCJzcmMvUG93ZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG52YXIgZ2V0VmVuZG9yUHJvcGVydHlOYW1lID0gcmVxdWlyZSgnLi9nZXRWZW5kb3JQcm9wZXJ0eU5hbWUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2VzKXtcbiAgICB2YXIgdG8gPSBPYmplY3QodGFyZ2V0KTtcbiAgICB2YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG4gICAgZm9yICh2YXIgbmV4dEluZGV4ID0gMTsgbmV4dEluZGV4IDwgYXJndW1lbnRzLmxlbmd0aDsgbmV4dEluZGV4KyspIHtcbiAgICAgICAgdmFyIG5leHRTb3VyY2UgPSBhcmd1bWVudHNbbmV4dEluZGV4XTtcbiAgICAgICAgaWYgKG5leHRTb3VyY2UgPT0gbnVsbCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZnJvbSA9IE9iamVjdChuZXh0U291cmNlKTtcblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gZnJvbSkge1xuICAgICAgICAgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwoZnJvbSwga2V5KSkge1xuICAgICAgICAgICAgICAgIHRvW2tleV0gPSBmcm9tW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcHJlZml4ZWQgPSB7fTtcbiAgICBmb3IgKHZhciBrZXkgaW4gdG8pIHtcbiAgICAgICAgcHJlZml4ZWRbZ2V0VmVuZG9yUHJvcGVydHlOYW1lKGtleSldID0gdG9ba2V5XVxuICAgIH1cblxuICAgIHJldHVybiBwcmVmaXhlZFxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY3NzVmVuZG9yUHJlZml4O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpe1xuXG4gICAgaWYoY3NzVmVuZG9yUHJlZml4KSByZXR1cm4gY3NzVmVuZG9yUHJlZml4O1xuXG4gICAgdmFyIHN0eWxlcyA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgJycpO1xuICAgIHZhciBwcmUgPSAoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoc3R5bGVzKS5qb2luKCcnKS5tYXRjaCgvLShtb3p8d2Via2l0fG1zKS0vKSB8fCAoc3R5bGVzLk9MaW5rID09PSAnJyAmJiBbJycsICdvJ10pXG4gICAgKVsxXTtcblxuICAgIHJldHVybiBjc3NWZW5kb3JQcmVmaXggPSAnLScgKyBwcmUgKyAnLSc7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbnZhciBwcmVmaXhlcyA9IFsnTW96JywgJ1dlYmtpdCcsICdPJywgJ21zJ107XG52YXIgZG9tVmVuZG9yUHJlZml4O1xuXG4vLyBIZWxwZXIgZnVuY3Rpb24gdG8gZ2V0IHRoZSBwcm9wZXIgdmVuZG9yIHByb3BlcnR5IG5hbWUuICh0cmFuc2l0aW9uID0+IFdlYmtpdFRyYW5zaXRpb24pXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwcm9wKSB7XG5cbiAgIGlmIChwcm9wIGluIGRpdi5zdHlsZSkgcmV0dXJuIHByb3A7XG5cbiAgIHZhciBwcm9wID0gcHJvcC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHByb3Auc3Vic3RyKDEpO1xuICAgaWYoZG9tVmVuZG9yUHJlZml4KXtcbiAgICAgICByZXR1cm4gZG9tVmVuZG9yUHJlZml4ICsgcHJvcDtcbiAgIH1lbHNle1xuICAgICAgIGZvciAodmFyIGk9MDsgaTxwcmVmaXhlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICB2YXIgdmVuZG9yUHJvcCA9IHByZWZpeGVzW2ldICsgcHJvcDtcbiAgICAgICAgICAgaWYgKHZlbmRvclByb3AgaW4gZGl2LnN0eWxlKSB7XG4gICAgICAgICAgICAgICBkb21WZW5kb3JQcmVmaXggPSBwcmVmaXhlc1tpXTtcbiAgICAgICAgICAgICAgIHJldHVybiB2ZW5kb3JQcm9wO1xuICAgICAgICAgICB9XG4gICAgICAgfVxuICAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaW5zZXJ0UnVsZSA9IHJlcXVpcmUoJy4vaW5zZXJ0UnVsZScpO1xudmFyIHZlbmRvclByZWZpeCA9IHJlcXVpcmUoJy4vZ2V0VmVuZG9yUHJlZml4JykoKTtcbnZhciBpbmRleCA9IDA7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGtleWZyYW1lcykge1xuICAgIC8vIHJhbmRvbSBuYW1lXG4gICAgdmFyIG5hbWUgPSAnYW5pbV8nKyAoKytpbmRleCkgKyAoK25ldyBEYXRlKTtcbiAgICB2YXIgY3NzID0gXCJAXCIgKyB2ZW5kb3JQcmVmaXggKyBcImtleWZyYW1lcyBcIiArIG5hbWUgKyBcIiB7XCI7XG5cbiAgICBmb3IgKHZhciBrZXkgaW4ga2V5ZnJhbWVzKSB7XG4gICAgICAgIGNzcyArPSBrZXkgKyBcIiB7XCI7XG5cbiAgICAgICAgZm9yICh2YXIgcHJvcGVydHkgaW4ga2V5ZnJhbWVzW2tleV0pIHtcbiAgICAgICAgICAgIHZhciBwYXJ0ID0gXCI6XCIgKyBrZXlmcmFtZXNba2V5XVtwcm9wZXJ0eV0gKyBcIjtcIjtcbiAgICAgICAgICAgIC8vIFdlIGRvIHZlbmRvciBwcmVmaXggZm9yIGV2ZXJ5IHByb3BlcnR5XG4gICAgICAgICAgICBjc3MgKz0gdmVuZG9yUHJlZml4ICsgcHJvcGVydHkgKyBwYXJ0O1xuICAgICAgICAgICAgY3NzICs9IHByb3BlcnR5ICsgcGFydDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNzcyArPSBcIn1cIjtcbiAgICB9XG5cbiAgICBjc3MgKz0gXCJ9XCI7XG5cbiAgICBpbnNlcnRSdWxlKGNzcyk7XG5cbiAgICByZXR1cm4gbmFtZVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZXh0cmFTaGVldDtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY3NzKSB7XG5cbiAgICBpZiAoIWV4dHJhU2hlZXQpIHtcbiAgICAgICAgLy8gRmlyc3QgdGltZSwgY3JlYXRlIGFuIGV4dHJhIHN0eWxlc2hlZXQgZm9yIGFkZGluZyBydWxlc1xuICAgICAgICBleHRyYVNoZWV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5hcHBlbmRDaGlsZChleHRyYVNoZWV0KTtcbiAgICAgICAgLy8gS2VlcCByZWZlcmVuY2UgdG8gYWN0dWFsIFN0eWxlU2hlZXQgb2JqZWN0IChgc3R5bGVTaGVldGAgZm9yIElFIDwgOSlcbiAgICAgICAgZXh0cmFTaGVldCA9IGV4dHJhU2hlZXQuc2hlZXQgfHwgZXh0cmFTaGVldC5zdHlsZVNoZWV0O1xuICAgIH1cblxuICAgIHZhciBpbmRleCA9IChleHRyYVNoZWV0LmNzc1J1bGVzIHx8IGV4dHJhU2hlZXQucnVsZXMpLmxlbmd0aDtcbiAgICBleHRyYVNoZWV0Lmluc2VydFJ1bGUoY3NzLCBpbmRleCk7XG5cbiAgICByZXR1cm4gZXh0cmFTaGVldDtcbn1cbiIsInZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgYXBwZW5kVmVuZG9yUHJlZml4ID0gcmVxdWlyZSgncmVhY3Qta2l0L2FwcGVuZFZlbmRvclByZWZpeCcpO1xudmFyIGluc2VydEtleWZyYW1lc1J1bGUgPSByZXF1aXJlKCdyZWFjdC1raXQvaW5zZXJ0S2V5ZnJhbWVzUnVsZScpO1xuXG52YXIgYW5pbWF0aW9uRHVyYXRpb24gPSA0MDA7XG5cbnZhciBzaG93TW9kYWxBbmltYXRpb24gPSBpbnNlcnRLZXlmcmFtZXNSdWxlKHtcbiAgICAnMCUnOiB7XG4gICAgICAgIG9wYWNpdHk6IDAsXG4gICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZTNkKC01MCUsIC00MDBweCwgMCknXG4gICAgfSxcbiAgICAnMTAwJSc6IHtcbiAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlM2QoLTUwJSwgLTUwJSwgMCknXG4gICAgfVxufSk7XG5cbnZhciBoaWRlTW9kYWxBbmltYXRpb24gPSBpbnNlcnRLZXlmcmFtZXNSdWxlKHtcbiAgICAnMCUnOiB7XG4gICAgICAgIG9wYWNpdHk6IDEsXG4gICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZTNkKC01MCUsIC01MCUsIDApJ1xuICAgIH0sXG4gICAgJzEwMCUnOiB7XG4gICAgICAgIG9wYWNpdHk6IDAsXG4gICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZTNkKC01MCUsIDEwMHB4LCAwKSdcbiAgICB9XG59KTtcblxudmFyIHNob3dCYWNrZHJvcEFuaW1hdGlvbiA9IGluc2VydEtleWZyYW1lc1J1bGUoe1xuICAgICcwJSc6IHtcbiAgICAgICAgb3BhY2l0eTogMFxuICAgIH0sXG4gICAgJzEwMCUnOiB7XG4gICAgICAgIG9wYWNpdHk6IDAuN1xuICAgIH1cbn0pO1xuXG52YXIgaGlkZUJhY2tkcm9wQW5pbWF0aW9uID0gaW5zZXJ0S2V5ZnJhbWVzUnVsZSh7XG4gICAgJzAlJzoge1xuICAgICAgICBvcGFjaXR5OiAwLjdcbiAgICB9LFxuICAgICcxMDAlJzoge1xuICAgICAgICBvcGFjaXR5OiAwXG4gICAgfVxufSk7XG5cbnZhciBzaG93Q29udGVudEFuaW1hdGlvbiA9IGluc2VydEtleWZyYW1lc1J1bGUoe1xuICAgICcwJSc6IHtcbiAgICAgICAgb3BhY2l0eTogMCxcbiAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlM2QoMCwgLTEwMHB4LCAwKSdcbiAgICB9LFxuICAgICcxMDAlJzoge1xuICAgICAgICBvcGFjaXR5OiAxLFxuICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUzZCgwLCAwLCAwKSdcbiAgICB9XG59KTtcblxudmFyIGhpZGVDb250ZW50QW5pbWF0aW9uID0gaW5zZXJ0S2V5ZnJhbWVzUnVsZSh7XG4gICAgJzAlJzoge1xuICAgICAgICBvcGFjaXR5OiAxLFxuICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUzZCgwLCAwLCAwKSdcbiAgICB9LFxuICAgICcxMDAlJzoge1xuICAgICAgICBvcGFjaXR5OiAwLFxuICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUzZCgwLCA1MHB4LCAwKSdcbiAgICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7ZGlzcGxheU5hbWU6IFwiZXhwb3J0c1wiLFxuICAgIHByb3BUeXBlczoge1xuICAgICAgICBjbGFzc05hbWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIC8vIENsb3NlIHRoZSBtb2RhbCB3aGVuIGVzYyBpcyBwcmVzc2VkPyBEZWZhdWx0cyB0byB0cnVlLlxuICAgICAgICBrZXlib2FyZDogUmVhY3QuUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgIGhpZGRlbjogUmVhY3QuUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgIG9uU2hvdzogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIG9uSGlkZTogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIGJhY2tkcm9wOiBSZWFjdC5Qcm9wVHlwZXMub25lT2ZUeXBlKFtcbiAgICAgICAgICAgIFJlYWN0LlByb3BUeXBlcy5ib29sLFxuICAgICAgICAgICAgUmVhY3QuUHJvcFR5cGVzLnN0cmluZ1xuICAgICAgICBdKVxuICAgIH0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY2xhc3NOYW1lOiBcIlwiLFxuICAgICAgICAgICAgb25TaG93OiBmdW5jdGlvbigpe30sXG4gICAgICAgICAgICBvbkhpZGU6IGZ1bmN0aW9uKCl7fSxcbiAgICAgICAgICAgIGtleWJvYXJkOiB0cnVlLFxuICAgICAgICAgICAgYmFja2Ryb3A6IHRydWVcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaGlkZGVuOiB0cnVlXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgaGFzSGlkZGVuOiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS5oaWRkZW47XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIGhpZGRlbiA9IHRoaXMuaGFzSGlkZGVuKCk7XG4gICAgICAgIGlmKGhpZGRlbikgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgdmFyIG1vZGFsU3R5bGUgPSBhcHBlbmRWZW5kb3JQcmVmaXgoe1xuICAgICAgICAgICAgcG9zaXRpb246IFwiZml4ZWRcIixcbiAgICAgICAgICAgIHdpZHRoOiBcIjUwMHB4XCIsXG4gICAgICAgICAgICB0cmFuc2Zvcm06IFwidHJhbnNsYXRlM2QoLTUwJSwgLTUwJSwgMClcIixcbiAgICAgICAgICAgIHRvcDogXCI1MCVcIixcbiAgICAgICAgICAgIGxlZnQ6IFwiNTAlXCIsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwid2hpdGVcIixcbiAgICAgICAgICAgIHpJbmRleDogMTA1MCxcbiAgICAgICAgICAgIGFuaW1hdGlvbkR1cmF0aW9uOiAnMC40cycsXG4gICAgICAgICAgICBhbmltYXRpb25GaWxsTW9kZTogJ2ZvcndhcmRzJyxcbiAgICAgICAgICAgIGFuaW1hdGlvbk5hbWU6IGhpZGRlbj8gaGlkZU1vZGFsQW5pbWF0aW9uOiBzaG93TW9kYWxBbmltYXRpb24sXG4gICAgICAgICAgICBhbmltYXRpb25UaW1pbmdGdW5jdGlvbjogJ2N1YmljLWJlemllcigwLjcsMCwwLjMsMSknXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBiYWNrZHJvcFN0eWxlID0gYXBwZW5kVmVuZG9yUHJlZml4KHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiBcImZpeGVkXCIsXG4gICAgICAgICAgICB0b3A6IDAsXG4gICAgICAgICAgICByaWdodDogMCxcbiAgICAgICAgICAgIGJvdHRvbTogMCxcbiAgICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgICB6SW5kZXg6IDEwNDAsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwiYmxhY2tcIixcbiAgICAgICAgICAgIGFuaW1hdGlvbkR1cmF0aW9uOiAnMC40cycsXG4gICAgICAgICAgICBhbmltYXRpb25GaWxsTW9kZTogJ2ZvcndhcmRzJyxcbiAgICAgICAgICAgIGFuaW1hdGlvbk5hbWU6IGhpZGRlbj8gaGlkZUJhY2tkcm9wQW5pbWF0aW9uOiBzaG93QmFja2Ryb3BBbmltYXRpb24sXG4gICAgICAgICAgICBhbmltYXRpb25UaW1pbmdGdW5jdGlvbjogJ2N1YmljLWJlemllcigwLjcsMCwwLjMsMSknXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBjb250ZW50U3R5bGUgPSBhcHBlbmRWZW5kb3JQcmVmaXgoe1xuICAgICAgICAgICAgYW5pbWF0aW9uRHVyYXRpb246ICcwLjRzJyxcblx0ICAgICAgICBhbmltYXRpb25GaWxsTW9kZTogJ2ZvcndhcmRzJyxcbiAgICAgICAgICAgIGFuaW1hdGlvbkRlbGF5OiAnMC4yNXMnLFxuICAgICAgICAgICAgYW5pbWF0aW9uTmFtZTogc2hvd0NvbnRlbnRBbmltYXRpb24sXG5cdCAgICAgICAgYW5pbWF0aW9uVGltaW5nRnVuY3Rpb246ICdjdWJpYy1iZXppZXIoMC43LDAsMC4zLDEpJ1xuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgbW9kYWwgPSAoXG4gICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtyZWY6IFwibW9kYWxcIiwgc3R5bGU6IG1vZGFsU3R5bGUsIHRhYkluZGV4OiBcIi0xXCIsIGNsYXNzTmFtZTogdGhpcy5wcm9wcy5jbGFzc05hbWV9LCBcbiAgICAgICAgICAgICAgICBSZWFjdC5jcmVhdGVFbGVtZW50KFwiZGl2XCIsIHtyZWY6IFwiY29udGVudFwiLCBzdHlsZTogY29udGVudFN0eWxlfSwgXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuY2hpbGRyZW5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApXG4gICAgICAgICk7XG5cbiAgICAgICAgdmFyIGJhY2tkcm9wID0gUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCB7cmVmOiBcImJhY2tkcm9wXCIsIG9uQ2xpY2s6IHRoaXMuaGlkZSwgc3R5bGU6IGJhY2tkcm9wU3R5bGV9KTtcblxuICAgICAgICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcImRpdlwiLCBudWxsLCBcbiAgICAgICAgICAgIG1vZGFsLCBcbiAgICAgICAgICAgIGJhY2tkcm9wXG4gICAgICAgICk7XG4gICAgfSxcblxuICAgIHNob3c6IGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmKCF0aGlzLmhhc0hpZGRlbigpKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBoaWRkZW46IGZhbHNlXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgLy8gYWZ0ZXIgYW5pbWF0aW9uIGVuZFxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBzZWxmLnByb3BzLm9uU2hvdygpO1xuICAgICAgICB9LCBhbmltYXRpb25EdXJhdGlvbik7XG4gICAgfSxcblxuICAgIGhpZGU6IGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgaWYodGhpcy5oYXNIaWRkZW4oKSkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgaGlkZGVuOiB0cnVlXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgLy8gYWZ0ZXIgYW5pbWF0aW9uIGVuZFxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBzZWxmLnByb3BzLm9uSGlkZSgpO1xuICAgICAgICB9LCBhbmltYXRpb25EdXJhdGlvbik7XG4gICAgfSxcblxuICAgIHRvZ2dsZTogZnVuY3Rpb24oKXtcbiAgICAgICAgaWYodGhpcy5oYXNIaWRkZW4oKSlcbiAgICAgICAgICAgIHRoaXMuc2hvdygpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICB0aGlzLmhpZGUoKTtcbiAgICB9LFxuXG4gICAgbGlzdGVuS2V5Ym9hcmQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMua2V5Ym9hcmQgJiZcbiAgICAgICAgICAgICAgICAoZXZlbnQua2V5ID09PSBcIkVzY2FwZVwiIHx8XG4gICAgICAgICAgICAgICAgIGV2ZW50LmtleUNvZGUgPT09IDI3KSkge1xuICAgICAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCB0aGlzLmxpc3RlbktleWJvYXJkLCB0cnVlKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5saXN0ZW5LZXlib2FyZCwgdHJ1ZSk7XG4gICAgfVxufSk7XG4iXX0=
