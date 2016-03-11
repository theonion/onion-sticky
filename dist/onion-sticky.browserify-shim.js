(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.OnionSticky = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var BOTTOM_STICKY = 'bottom-sticky';
var SCROLLING_UP = 'scrolling-up';
var SCROLLING_DOWN = 'scrolling-down';
var SCROLLING_UNCHANGED = 'not-scrolling';

var OnionSticky = (function () {
  function OnionSticky(options) {
    _classCallCheck(this, OnionSticky);

    _.extend(this, options);
    this.animationLoop = this.animationLoop.bind(this);
  }

  _createClass(OnionSticky, [{
    key: 'shouldRenderAnimation',
    value: function shouldRenderAnimation() {
      // We run a little check on some values  to see if we should
      // do any animation: if these haven't changed, we bail out.
      return this.elementOutOfViewport() || !_.isEqual(this.lastFrame, this.frame);
    }
  }, {
    key: 'getFrameData',
    value: function getFrameData() {
      this.lastFrame = this.frame;

      var elementRect = this.element[0].getBoundingClientRect();
      var containerRect = this.container[0].getBoundingClientRect();

      this.frame = {
        elementRect: _.pick(elementRect, ['top', 'right', 'bottom', 'left', 'width', 'height']),
        containerRect: _.pick(containerRect, ['top', 'right', 'bottom', 'left', 'width', 'height']),
        innerHeight: window.innerHeight,
        innerWidth: window.innerWidth,
        containerTop: containerRect.top,
        containerBottom: containerRect.bottom,
        zeroPoint: this.getDistanceFromTop(),
        bottomPoint: this.getDistanceFromBottom(),
        scrollDirection: this.calculateScrollDirection()
      };
    }
  }, {
    key: 'debug',
    value: function debug() {
      if (this.printDebug === true) {
        console.log.apply(console, arguments);
      }
    }
  }, {
    key: 'elementOutOfViewport',
    value: function elementOutOfViewport() {
      var elementRect = this.frame.elementRect;
      return elementRect.top > window.innerHeight || elementRect.bottom < 0;
    }
  }, {
    key: 'containerTopBelowZeroPoint',
    value: function containerTopBelowZeroPoint() {
      return this.frame.containerRect.top > this.frame.zeroPoint;
    }
  }, {
    key: 'containerBottomAboveBottomPoint',
    value: function containerBottomAboveBottomPoint() {
      return this.frame.containerRect.bottom <= this.frame.innerHeight - this.frame.bottomPoint;
    }
  }, {
    key: 'elementBottomAboveBottomPoint',
    value: function elementBottomAboveBottomPoint() {
      return this.frame.elementRect.bottom < this.frame.innerHeight - this.frame.bottomPoint;
    }
  }, {
    key: 'elementTopBelowZeroPoint',
    value: function elementTopBelowZeroPoint() {
      return this.frame.elementRect.top >= this.frame.zeroPoint;
    }
  }, {
    key: 'elementFixedToTop',
    value: function elementFixedToTop() {
      return this.element[0].style.top !== "" && this.element.css('position') === 'fixed';
    }
  }, {
    key: 'elementFixedToBottom',
    value: function elementFixedToBottom() {
      return this.element[0].style.bottom !== "" && this.element.css('position') === 'fixed';
    }
  }, {
    key: 'calculateScrollDirection',
    value: function calculateScrollDirection() {
      if (this._lastScrollTop === undefined) {
        this._lastScrollTop = this.scrollContainer.scrollTop();
      }

      var scrollDirection = SCROLLING_UNCHANGED;
      var scrollContainerScrollTop = this.scrollContainer.scrollTop();

      if (this._lastScrollTop < scrollContainerScrollTop) {
        scrollDirection = SCROLLING_DOWN;
      } else if (this._lastScrollTop > scrollContainerScrollTop) {
        scrollDirection = SCROLLING_UP;
      } else {
        scrollDirection = SCROLLING_UNCHANGED;
      }

      this._lastScrollTop = scrollContainerScrollTop;;
      return scrollDirection;
    }
  }, {
    key: 'renderFrame',
    value: function renderFrame() {
      this.getFrameData();

      if (!this.shouldRenderAnimation()) {
        return;
      }

      var styles = {};

      if (this.containerTopBelowZeroPoint()) {
        this.debug('containerTopBelowZeroPoint');
        styles.position = '';
        styles.top = '';
        styles.bottom = '';
      } else if (this.containerBottomAboveBottomPoint()) {
        this.debug('containerBottomAboveBottomPoint');
        styles.position = 'absolute';
        styles.top = '';
        styles.bottom = this.frame.bottomPoint;
      } else if (this.frame.scrollDirection === SCROLLING_DOWN) {
        this.debug(this.frame.scrollDirection, this.element.css('top'));
        if (this.elementBottomAboveBottomPoint()) {
          this.debug('elementBottomAboveBottomPoint');
          styles.position = 'fixed';
          styles.top = '';
          styles.bottom = this.frame.bottomPoint;
        } else if (!this.followScroll && this.elementFixedToTop()) {
          this.debug('elementFixedToTop');
          styles.position = 'absolute';
          styles.top = Math.abs(this.frame.containerRect.top) - Math.abs(this.frame.elementRect.top) + this.frame.zeroPoint + this.frame.zeroPoint;
          styles.bottom = '';
        }
      } else if (this.elementOutOfViewport() || this.frame.scrollDirection === SCROLLING_UP) {
        if (this.elementTopBelowZeroPoint()) {
          this.debug('fix to zeroPoint');
          styles.position = 'fixed';
          styles.top = this.frame.zeroPoint;
          styles.bottom = '';
        } else if (!this.followScroll && this.elementFixedToBottom()) {
          this.debug('fix to absolute top');
          styles.position = 'absolute';
          styles.top = Math.abs(this.frame.containerRect.top) - Math.abs(this.frame.elementRect.top);
          styles.bottom = '';
        } else if (this.elementBottomAboveBottomPoint()) {
          this.debug('elementBottomAboveBottomPoint');
          styles.position = 'fixed';
          styles.top = '';
          styles.bottom = this.frame.bottomPoint;
        }
      }

      this.debug('renderFrame() styles', styles);
      this.element.css(styles);
    }
  }, {
    key: 'animationLoop',
    value: function animationLoop() {
      requestAnimationFrame(this.animationLoop);
      this.renderFrame();
    }
  }]);

  return OnionSticky;
})();

exports.OnionSticky = OnionSticky;

},{}]},{},[1])(1)
});