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

module.exports = React.createClass({
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
            hidden: false,
            remove: false
        }
    },

    hasHidden: function(){
        return this.props.hidden || this.state.hidden;
    },

    componentWillReceiveProps: function(props){

        this.setState({
            hidden: props.hidden
        })
    },

    render: function() {

        var hidden = this.hasHidden();

        var self = this;
        setTimeout(function(){
            var node = self.getDOMNode();
            React.unmountComponentAtNode(node);
            // node.parentNode.removeChild(node);
        }, 400)

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
            <div style={modalStyle} tabIndex="-1" className={this.props.className}>
                <div style={contentStyle}>
                    {this.props.children}
                </div>
            </div>
        );

        var backdrop = <div style={backdropStyle} />;

        return <div>
            {modal}
            {backdrop}
        </div>;
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
