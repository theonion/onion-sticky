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

var DIMENSIONS = ['top', 'right', 'bottom', 'left', 'width', 'height'];

function pickDimensions(rect) {
  var dimensions = {};
  DIMENSIONS.forEach(function (dimension) {
    dimensions[dimension] = rect[dimension];
  });
  return dimensions;
}

function requireValues(message, givenValues, requiredValues) {
  var missingValues = [];
  requiredValues.forEach(function (option) {
    var value = givenValues[option];
    if (value === undefined || value === null) {
      missingValues.push(option);
    }
  });

  if (missingValues.length > 1) {
    console.warn(message, '\nvalues given:', givenValues, '\nvalues missing:', missingValues);
  }
};

var OnionSticky = (function () {
  function OnionSticky(options) {
    _classCallCheck(this, OnionSticky);

    requireValues('Missing options for OnionSticky constructor', options, ['element', 'container', 'scrollContainer', 'getDistanceFromTop', 'getDistanceFromBottom']);

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
        elementRect: pickDimensions(elementRect),
        containerRect: pickDimensions(containerRect),
        innerHeight: this.getInnerHeight(),
        innerWidth: this.getInnerWidth(),
        containerTop: containerRect.top,
        containerBottom: containerRect.bottom,
        elementTop: elementRect.top,
        elementBottom: elementRect.bottom,
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
    key: 'getInnerHeight',
    value: function getInnerHeight() {
      return window.innerHeight;
    }
  }, {
    key: 'getInnerWidth',
    value: function getInnerWidth() {
      return window.innerWidth;
    }
  }, {
    key: 'elementOutOfViewport',
    value: function elementOutOfViewport() {
      var elementRect = this.frame.elementRect;
      return elementRect.top > this.getInnerHeight() || elementRect.bottom < 0;
    }
  }, {
    key: 'containerTopBelowZeroPoint',
    value: function containerTopBelowZeroPoint() {
      return this.frame.containerTop > this.frame.zeroPoint;
    }
  }, {
    key: 'containerBottomAboveBottomPoint',
    value: function containerBottomAboveBottomPoint() {
      return this.frame.containerBottom <= this.frame.innerHeight - this.frame.bottomPoint;
    }
  }, {
    key: 'elementBottomAboveBottomPoint',
    value: function elementBottomAboveBottomPoint() {
      return this.frame.elementBottom < this.frame.innerHeight - this.frame.bottomPoint;
    }
  }, {
    key: 'elementTopBelowZeroPoint',
    value: function elementTopBelowZeroPoint() {
      return this.frame.elementTop >= this.frame.zeroPoint;
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
      if (typeof this._lastScrollTop === 'undefined') {
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
    key: 'lessThanBreakpoint',
    value: function lessThanBreakpoint() {
      if (this.breakpoint) {
        return this.breakpoint >= window.innerWidth;
      } else {
        return false;
      }
    }
  }, {
    key: 'renderFrame',
    value: function renderFrame() {
      this.getFrameData();

      if (!this.shouldRenderAnimation()) {
        return;
      }

      this.debug(this.frame);

      var styles = {};

      if (this.lessThanBreakpoint()) {
        this.debug('lessThanBreakpoint');
        styles.position = '';
        styles.top = '';
        styles.bottom = '';
      } else if (this.containerTopBelowZeroPoint()) {
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
          styles.top = Math.abs(this.frame.containerTop) - Math.abs(this.frame.elementTop) + this.frame.zeroPoint + this.frame.zeroPoint;
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
          styles.top = Math.abs(this.frame.containerTop) - Math.abs(this.frame.elementTop);
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY29sbGlubWlsbGVyL0NvZGUvb25pb24tc3RpY2t5L3NyYy9vbmlvbi1zdGlja3kuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxZQUFZLENBQUM7Ozs7Ozs7Ozs7QUFFYixJQUFNLGFBQWEsR0FBRyxlQUFlLENBQUM7QUFDdEMsSUFBTSxZQUFZLEdBQUcsY0FBYyxDQUFDO0FBQ3BDLElBQU0sY0FBYyxHQUFHLGdCQUFnQixDQUFDO0FBQ3hDLElBQU0sbUJBQW1CLEdBQUcsZUFBZSxDQUFBOztBQUUzQyxJQUFNLFVBQVUsR0FBRyxDQUNqQixLQUFLLEVBQ0wsT0FBTyxFQUNQLFFBQVEsRUFDUixNQUFNLEVBQ04sT0FBTyxFQUNQLFFBQVEsQ0FDVCxDQUFDOztBQUVGLFNBQVMsY0FBYyxDQUFFLElBQUksRUFBRTtBQUM3QixNQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFDcEIsWUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFVLFNBQVMsRUFBRTtBQUN0QyxjQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0dBQ3pDLENBQUMsQ0FBQztBQUNILFNBQU8sVUFBVSxDQUFDO0NBQ25COztBQUVELFNBQVMsYUFBYSxDQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsY0FBYyxFQUFFO0FBQzVELE1BQUssYUFBYSxHQUFHLEVBQUUsQ0FBQztBQUN4QixnQkFBYyxDQUFDLE9BQU8sQ0FBQyxVQUFVLE1BQU0sRUFBRTtBQUN2QyxRQUFJLEtBQUssR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDaEMsUUFBSSxLQUFLLEtBQUssU0FBUyxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7QUFDekMsbUJBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDNUI7R0FDRixDQUFDLENBQUM7O0FBRUgsTUFBSSxhQUFhLENB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LEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUMxQjs7O1dBRWEseUJBQUc7QUFDZiwyQkFBcUIsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDMUMsVUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0tBQ3BCOzs7U0ExTFUsV0FBVyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IEJPVFRPTV9TVElDS1kgPSAnYm90dG9tLXN0aWNreSc7XG5jb25zdCBTQ1JPTExJTkdfVVAgPSAnc2Nyb2xsaW5nLXVwJztcbmNvbnN0IFNDUk9MTElOR19ET1dOID0gJ3Njcm9sbGluZy1kb3duJztcbmNvbnN0IFNDUk9MTElOR19VTkNIQU5HRUQgPSAnbm90LXNjcm9sbGluZydcblxuY29uc3QgRElNRU5TSU9OUyA9IFtcbiAgJ3RvcCcsXG4gICdyaWdodCcsXG4gICdib3R0b20nLFxuICAnbGVmdCcsXG4gICd3aWR0aCcsXG4gICdoZWlnaHQnLFxuXTtcblxuZnVuY3Rpb24gcGlja0RpbWVuc2lvbnMgKHJlY3QpIHtcbiAgbGV0IGRpbWVuc2lvbnMgPSB7fTtcbiAgRElNRU5TSU9OUy5mb3JFYWNoKGZ1bmN0aW9uIChkaW1lbnNpb24pIHtcbiAgICBkaW1lbnNpb25zW2RpbWVuc2lvbl0gPSByZWN0W2RpbWVuc2lvbl07XG4gIH0pO1xuICByZXR1cm4gZGltZW5zaW9ucztcbn1cblxuZnVuY3Rpb24gcmVxdWlyZVZhbHVlcyAobWVzc2FnZSwgZ2l2ZW5WYWx1ZXMsIHJlcXVpcmVkVmFsdWVzKSB7XG4gIGxldCAgbWlzc2luZ1ZhbHVlcyA9IFtdO1xuICByZXF1aXJlZFZhbHVlcy5mb3JFYWNoKGZ1bmN0aW9uIChvcHRpb24pIHtcbiAgICBsZXQgdmFsdWUgPSBnaXZlblZhbHVlc1tvcHRpb25dO1xuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSB7XG4gICAgICBtaXNzaW5nVmFsdWVzLnB1c2gob3B0aW9uKTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmIChtaXNzaW5nVmFsdWVzLmxlbmd0aCA+IDEpIHtcbiAgICBjb25zb2xlLndhcm4oXG4gICAgICBtZXNzYWdlLFxuICAgICAgJ1xcbnZhbHVlcyBnaXZlbjonLCBnaXZlblZhbHVlcyxcbiAgICAgICdcXG52YWx1ZXMgbWlzc2luZzonLCBtaXNzaW5nVmFsdWVzLFxuICAgICk7XG4gIH1cbn07XG5cbmV4cG9ydCBjbGFzcyBPbmlvblN0aWNreSB7XG4gIGNvbnN0cnVjdG9yIChvcHRpb25zKSB7XG4gICAgcmVxdWlyZVZhbHVlcygnTWlzc2luZyBvcHRpb25zIGZvciBPbmlvblN0aWNreSBjb25zdHJ1Y3RvcicsIG9wdGlvbnMsIFtcbiAgICAgICdlbGVtZW50JyxcbiAgICAgICdjb250YWluZXInLFxuICAgICAgJ3Njcm9sbENvbnRhaW5lcicsXG4gICAgICAnZ2V0RGlzdGFuY2VGcm9tVG9wJyxcbiAgICAgICdnZXREaXN0YW5jZUZyb21Cb3R0b20nLFxuICAgIF0pO1xuXG4gICAgXy5leHRlbmQodGhpcywgb3B0aW9ucyk7XG4gICAgdGhpcy5hbmltYXRpb25Mb29wID0gdGhpcy5hbmltYXRpb25Mb29wLmJpbmQodGhpcyk7XG4gIH1cblxuICBzaG91bGRSZW5kZXJBbmltYXRpb24gKCkge1xuICAgIC8vIFdlIHJ1biBhIGxpdHRsZSBjaGVjayBvbiBzb21lIHZhbHVlcyAgdG8gc2VlIGlmIHdlIHNob3VsZFxuICAgIC8vIGRvIGFueSBhbmltYXRpb246IGlmIHRoZXNlIGhhdmVuJ3QgY2hhbmdlZCwgd2UgYmFpbCBvdXQuXG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudE91dE9mVmlld3BvcnQoKSB8fCAhXy5pc0VxdWFsKHRoaXMubGFzdEZyYW1lLCB0aGlzLmZyYW1lKTtcbiAgfVxuXG4gIGdldEZyYW1lRGF0YSAoKSB7XG4gICAgdGhpcy5sYXN0RnJhbWUgPSB0aGlzLmZyYW1lO1xuXG4gICAgbGV0IGVsZW1lbnRSZWN0ID0gdGhpcy5lbGVtZW50WzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGxldCBjb250YWluZXJSZWN0ID0gdGhpcy5jb250YWluZXJbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICB0aGlzLmZyYW1lID0ge1xuICAgICAgZWxlbWVudFJlY3QgICAgIDogcGlja0RpbWVuc2lvbnMoZWxlbWVudFJlY3QpLFxuICAgICAgY29udGFpbmVyUmVjdCAgIDogcGlja0RpbWVuc2lvbnMoY29udGFpbmVyUmVjdCksXG4gICAgICBpbm5lckhlaWdodCAgICAgOiB0aGlzLmdldElubmVySGVpZ2h0KCksXG4gICAgICBpbm5lcldpZHRoICAgICAgOiB0aGlzLmdldElubmVyV2lkdGgoKSxcbiAgICAgIGNvbnRhaW5lclRvcCAgICA6IGNvbnRhaW5lclJlY3QudG9wLFxuICAgICAgY29udGFpbmVyQm90dG9tIDogY29udGFpbmVyUmVjdC5ib3R0b20sXG4gICAgICBlbGVtZW50VG9wICAgICAgOiBlbGVtZW50UmVjdC50b3AsXG4gICAgICBlbGVtZW50Qm90dG9tICAgOiBlbGVtZW50UmVjdC5ib3R0b20sXG4gICAgICB6ZXJvUG9pbnQgICAgICAgOiB0aGlzLmdldERpc3RhbmNlRnJvbVRvcCgpLFxuICAgICAgYm90dG9tUG9pbnQgICAgIDogdGhpcy5nZXREaXN0YW5jZUZyb21Cb3R0b20oKSxcbiAgICAgIHNjcm9sbERpcmVjdGlvbiA6IHRoaXMuY2FsY3VsYXRlU2Nyb2xsRGlyZWN0aW9uKCksXG4gICAgfVxuICB9XG5cbiAgZGVidWcgKCkge1xuICAgIGlmICh0aGlzLnByaW50RGVidWcgPT09IHRydWUpIHtcbiAgICAgIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgZ2V0SW5uZXJIZWlnaHQgKCkge1xuICAgIHJldHVybiB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gIH1cblxuICBnZXRJbm5lcldpZHRoICgpIHtcbiAgICByZXR1cm4gd2luZG93LmlubmVyV2lkdGg7XG4gIH1cblxuICBlbGVtZW50T3V0T2ZWaWV3cG9ydCAoKSB7XG4gICAgbGV0IGVsZW1lbnRSZWN0ID0gdGhpcy5mcmFtZS5lbGVtZW50UmVjdDtcbiAgICByZXR1cm4gZWxlbWVudFJlY3QudG9wID4gdGhpcy5nZXRJbm5lckhlaWdodCgpIHx8IGVsZW1lbnRSZWN0LmJvdHRvbSA8IDA7XG4gIH1cblxuICBjb250YWluZXJUb3BCZWxvd1plcm9Qb2ludCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZnJhbWUuY29udGFpbmVyVG9wID4gdGhpcy5mcmFtZS56ZXJvUG9pbnQ7XG4gIH1cblxuICBjb250YWluZXJCb3R0b21BYm92ZUJvdHRvbVBvaW50ICgpIHtcbiAgICByZXR1cm4gdGhpcy5mcmFtZS5jb250YWluZXJCb3R0b20gPD0gdGhpcy5mcmFtZS5pbm5lckhlaWdodCAtIHRoaXMuZnJhbWUuYm90dG9tUG9pbnQ7XG4gIH1cblxuICBlbGVtZW50Qm90dG9tQWJvdmVCb3R0b21Qb2ludCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZnJhbWUuZWxlbWVudEJvdHRvbSA8IHRoaXMuZnJhbWUuaW5uZXJIZWlnaHQgLSB0aGlzLmZyYW1lLmJvdHRvbVBvaW50O1xuICB9XG5cbiAgZWxlbWVudFRvcEJlbG93WmVyb1BvaW50ICgpIHtcbiAgICByZXR1cm4gdGhpcy5mcmFtZS5lbGVtZW50VG9wID49IHRoaXMuZnJhbWUuemVyb1BvaW50O1xuICB9XG5cbiAgZWxlbWVudEZpeGVkVG9Ub3AgKCkge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRbMF0uc3R5bGUudG9wICE9PSBcIlwiICYmIHRoaXMuZWxlbWVudC5jc3MoJ3Bvc2l0aW9uJykgPT09ICdmaXhlZCc7XG4gIH1cblxuICBlbGVtZW50Rml4ZWRUb0JvdHRvbSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudFswXS5zdHlsZS5ib3R0b20gIT09IFwiXCIgJiYgdGhpcy5lbGVtZW50LmNzcygncG9zaXRpb24nKSA9PT0gJ2ZpeGVkJztcbiAgfVxuXG4gIGNhbGN1bGF0ZVNjcm9sbERpcmVjdGlvbiAoKSB7XG4gICAgaWYgKHR5cGVvZih0aGlzLl9sYXN0U2Nyb2xsVG9wKSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMuX2xhc3RTY3JvbGxUb3AgPSB0aGlzLnNjcm9sbENvbnRhaW5lci5zY3JvbGxUb3AoKTtcbiAgICB9XG5cbiAgICBsZXQgc2Nyb2xsRGlyZWN0aW9uID0gU0NST0xMSU5HX1VOQ0hBTkdFRDtcbiAgICBsZXQgc2Nyb2xsQ29udGFpbmVyU2Nyb2xsVG9wID0gdGhpcy5zY3JvbGxDb250YWluZXIuc2Nyb2xsVG9wKCk7XG5cbiAgICBpZiAodGhpcy5fbGFzdFNjcm9sbFRvcCA8IHNjcm9sbENvbnRhaW5lclNjcm9sbFRvcCkge1xuICAgICAgc2Nyb2xsRGlyZWN0aW9uID0gU0NST0xMSU5HX0RPV047XG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMuX2xhc3RTY3JvbGxUb3AgPiBzY3JvbGxDb250YWluZXJTY3JvbGxUb3ApIHtcbiAgICAgIHNjcm9sbERpcmVjdGlvbiA9IFNDUk9MTElOR19VUDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBzY3JvbGxEaXJlY3Rpb24gPSBTQ1JPTExJTkdfVU5DSEFOR0VEO1xuICAgIH1cblxuICAgIHRoaXMuX2xhc3RTY3JvbGxUb3AgPSBzY3JvbGxDb250YWluZXJTY3JvbGxUb3A7O1xuICAgIHJldHVybiBzY3JvbGxEaXJlY3Rpb247XG4gIH1cblxuICBsZXNzVGhhbkJyZWFrcG9pbnQgKCkge1xuICAgIGlmICh0aGlzLmJyZWFrcG9pbnQpIHtcbiAgICAgIHJldHVybiB0aGlzLmJyZWFrcG9pbnQgPj0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlckZyYW1lICgpIHtcbiAgICB0aGlzLmdldEZyYW1lRGF0YSgpO1xuXG4gICAgaWYgKCF0aGlzLnNob3VsZFJlbmRlckFuaW1hdGlvbigpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIFxuICAgIHRoaXMuZGVidWcodGhpcy5mcmFtZSk7XG5cbiAgICBsZXQgc3R5bGVzID0ge307XG5cbiAgICBpZiAodGhpcy5sZXNzVGhhbkJyZWFrcG9pbnQoKSkge1xuICAgICAgdGhpcy5kZWJ1ZygnbGVzc1RoYW5CcmVha3BvaW50Jyk7XG4gICAgICBzdHlsZXMucG9zaXRpb24gPSAnJztcbiAgICAgIHN0eWxlcy50b3AgPSAnJztcbiAgICAgIHN0eWxlcy5ib3R0b20gPSAnJztcbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5jb250YWluZXJUb3BCZWxvd1plcm9Qb2ludCgpKSB7XG4gICAgICB0aGlzLmRlYnVnKCdjb250YWluZXJUb3BCZWxvd1plcm9Qb2ludCcpO1xuICAgICAgc3R5bGVzLnBvc2l0aW9uID0gJyc7XG4gICAgICBzdHlsZXMudG9wID0gJyc7XG4gICAgICBzdHlsZXMuYm90dG9tID0gJyc7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMuY29udGFpbmVyQm90dG9tQWJvdmVCb3R0b21Qb2ludCgpKSB7XG4gICAgICB0aGlzLmRlYnVnKCdjb250YWluZXJCb3R0b21BYm92ZUJvdHRvbVBvaW50Jyk7XG4gICAgICBzdHlsZXMucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgc3R5bGVzLnRvcCA9ICcnO1xuICAgICAgc3R5bGVzLmJvdHRvbSA9IHRoaXMuZnJhbWUuYm90dG9tUG9pbnQ7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMuZnJhbWUuc2Nyb2xsRGlyZWN0aW9uID09PSBTQ1JPTExJTkdfRE9XTikge1xuICAgICAgdGhpcy5kZWJ1Zyh0aGlzLmZyYW1lLnNjcm9sbERpcmVjdGlvbiwgdGhpcy5lbGVtZW50LmNzcygndG9wJykpO1xuICAgICAgaWYgKHRoaXMuZWxlbWVudEJvdHRvbUFib3ZlQm90dG9tUG9pbnQoKSkge1xuICAgICAgICB0aGlzLmRlYnVnKCdlbGVtZW50Qm90dG9tQWJvdmVCb3R0b21Qb2ludCcpO1xuICAgICAgICBzdHlsZXMucG9zaXRpb24gPSAnZml4ZWQnO1xuICAgICAgICBzdHlsZXMudG9wID0gJyc7XG4gICAgICAgIHN0eWxlcy5ib3R0b20gPSB0aGlzLmZyYW1lLmJvdHRvbVBvaW50O1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIXRoaXMuZm9sbG93U2Nyb2xsICYmIHRoaXMuZWxlbWVudEZpeGVkVG9Ub3AoKSkge1xuICAgICAgICB0aGlzLmRlYnVnKCdlbGVtZW50Rml4ZWRUb1RvcCcpO1xuICAgICAgICBzdHlsZXMucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICBzdHlsZXMudG9wID0gKE1hdGguYWJzKHRoaXMuZnJhbWUuY29udGFpbmVyVG9wKSAtIE1hdGguYWJzKHRoaXMuZnJhbWUuZWxlbWVudFRvcCkpICsgdGhpcy5mcmFtZS56ZXJvUG9pbnQgKyB0aGlzLmZyYW1lLnplcm9Qb2ludDtcbiAgICAgICAgc3R5bGVzLmJvdHRvbSA9ICcnO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLmVsZW1lbnRPdXRPZlZpZXdwb3J0KCkgfHwgdGhpcy5mcmFtZS5zY3JvbGxEaXJlY3Rpb24gPT09IFNDUk9MTElOR19VUCkge1xuICAgICAgaWYgKHRoaXMuZWxlbWVudFRvcEJlbG93WmVyb1BvaW50KCkpIHtcbiAgICAgICAgdGhpcy5kZWJ1ZygnZml4IHRvIHplcm9Qb2ludCcpO1xuICAgICAgICBzdHlsZXMucG9zaXRpb24gPSAnZml4ZWQnO1xuICAgICAgICBzdHlsZXMudG9wID0gdGhpcy5mcmFtZS56ZXJvUG9pbnQ7XG4gICAgICAgIHN0eWxlcy5ib3R0b20gPSAnJztcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCF0aGlzLmZvbGxvd1Njcm9sbCAmJiB0aGlzLmVsZW1lbnRGaXhlZFRvQm90dG9tKCkpIHtcbiAgICAgICAgdGhpcy5kZWJ1ZygnZml4IHRvIGFic29sdXRlIHRvcCcpO1xuICAgICAgICBzdHlsZXMucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICBzdHlsZXMudG9wID0gTWF0aC5hYnModGhpcy5mcmFtZS5jb250YWluZXJUb3ApIC0gTWF0aC5hYnModGhpcy5mcmFtZS5lbGVtZW50VG9wKTtcbiAgICAgICAgc3R5bGVzLmJvdHRvbSA9ICcnO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmVsZW1lbnRCb3R0b21BYm92ZUJvdHRvbVBvaW50KCkpIHtcbiAgICAgICAgdGhpcy5kZWJ1ZygnZWxlbWVudEJvdHRvbUFib3ZlQm90dG9tUG9pbnQnKTtcbiAgICAgICAgc3R5bGVzLnBvc2l0aW9uID0gJ2ZpeGVkJztcbiAgICAgICAgc3R5bGVzLnRvcCA9ICcnO1xuICAgICAgICBzdHlsZXMuYm90dG9tID0gdGhpcy5mcmFtZS5ib3R0b21Qb2ludDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmRlYnVnKCdyZW5kZXJGcmFtZSgpIHN0eWxlcycsIHN0eWxlcyk7XG4gICAgdGhpcy5lbGVtZW50LmNzcyhzdHlsZXMpO1xuICB9XG5cbiAgYW5pbWF0aW9uTG9vcCAoKSB7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuYW5pbWF0aW9uTG9vcCk7XG4gICAgdGhpcy5yZW5kZXJGcmFtZSgpO1xuICB9XG59XG5cblxuIl19
