var React = require('react');
var transitionEvents = require('react-kit/transitionEvents');
//var animation = require('./animations/bounce');
var animation = require('./animations/wave');

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

        var backdrop = this.props.backdrop? <div onClick={this.hide} style={backdropStyle}/>: undefined;

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

        return (<span>
            <div ref="modal" style={modalStyle} className={this.props.className}>
                <div ref="content" tabIndex="-1" style={contentStyle}>
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
