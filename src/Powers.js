var React = require('react');
var transitionEvents = require('react-kit/transitionEvents');
var appendVendorPrefix = require('react-kit/appendVendorPrefix');
var animation = require('./animations/bounce');
var showModalAnimation = animation.showModalAnimation;
var hideModalAnimation = animation.hideModalAnimation;
var showBackdropAnimation = animation.showBackdropAnimation;
var hideBackdropAnimation = animation.hideBackdropAnimation;
var showContentAnimation = animation.showContentAnimation;
var hideContentAnimation = animation.hideContentAnimation;

module.exports = React.createClass({
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
        var node = this.refs.modal.getDOMNode();
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
            animationName: willHidden? hideModalAnimation: showModalAnimation,
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
            animationName: willHidden? hideBackdropAnimation: showBackdropAnimation,
            animationTimingFunction: 'cubic-bezier(0.7,0,0.3,1)'
        });

        var contentStyle = appendVendorPrefix({
            animationDuration: '0.4s',
	        animationFillMode: 'forwards',
            animationDelay: '0.25s',
            animationName: showContentAnimation,
	        animationTimingFunction: 'cubic-bezier(0.7,0,0.3,1)'
        });

        var backdrop = this.props.backdrop? <div onClick={this.hide} style={backdropStyle}/>: undefined;


        if(willHidden) {
            var node = this.refs.modal.getDOMNode();
            var endListener = function(e) {
                if (e && e.target !== node) {
                    return;
                }

                transitionEvents.removeEndEventListener(node, endListener);
                this.leave();

            }.bind(this);
            transitionEvents.addEndEventListener(node, endListener);
        }

        return (<span>
            <div ref="modal" style={modalStyle} tabIndex="-1" className={this.props.className}>
                <div style={contentStyle}>
                    {this.props.children}
                </div>
            </div>
            {backdrop}
         </span>)
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
