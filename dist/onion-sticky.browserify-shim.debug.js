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
var SCROLLING_UNCH = 'not-scrolling';

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

      var scrollDirection = SCROLLING_UNCH;
      var scrollContainerScrollTop = this.scrollContainer.scrollTop();

      if (this._lastScrollTop < scrollContainerScrollTop) {
        scrollDirection = SCROLLING_DOWN;
      } else if (this._lastScrollTop > scrollContainerScrollTop) {
        scrollDirection = SCROLLING_UP;
      } else {
        scrollDirection = SCROLLING_UNCH;
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY29sbGlubWlsbGVyL0NvZGUvb25pb24tc3RpY2t5L3NyYy9vbmlvbi1zdGlja3kuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxZQUFZLENBQUM7Ozs7Ozs7Ozs7QUFFYixJQUFNLGFBQWEsR0FBRyxlQUFlLENBQUM7QUFDdEMsSUFBTSxZQUFZLEdBQUcsY0FBYyxDQUFDO0FBQ3BDLElBQU0sY0FBYyxHQUFHLGdCQUFnQixDQUFDO0FBQ3hDLElBQU0sY0FBYyxHQUFHLGVBQWUsQ0FBQTs7SUFFekIsV0FBVztBQUNWLFdBREQsV0FBVyxDQUNULE9BQU8sRUFBRTswQkFEWCxXQUFXOztBQUVwQixLQUFDLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztBQUN4QixRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3BEOztlQUpVLFdBQVc7O1dBTUEsaUNBQUc7OztBQUd2QixhQUFPLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUM5RTs7O1dBRVksd0JBQUc7QUFDZCxVQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7O0FBRTVCLFVBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMscUJBQXFCLEVBQUUsQ0FBQztBQUMxRCxVQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixFQUFFLENBQUM7O0FBRTlELFVBQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCxtQkFBVyxFQUFPLENBQUMs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Q0FBQztTQUNwQixNQUNJLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxFQUFFO0FBQzFELGNBQUksQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUNsQyxnQkFBTSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUM7QUFDN0IsZ0JBQU0sQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzNGLGdCQUFNLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztTQUNwQixNQUFNLElBQUksSUFBSSxDQUFDLDZCQUE2QixFQUFFLEVBQUU7QUFDL0MsY0FBSSxDQUFDLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0FBQzVDLGdCQUFNLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztBQUMxQixnQkFBTSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7QUFDaEIsZ0JBQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUM7U0FDeEM7T0FDRjs7QUFFRCxVQUFJLENBQUMsS0FBSyxDQUFDLHNCQUFzQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQzNDLFVBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQzFCOzs7V0FFYSx5QkFBRztBQUNmLDJCQUFxQixDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUMxQyxVQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7S0FDcEI7OztTQXZKVSxXQUFXIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgQk9UVE9NX1NUSUNLWSA9ICdib3R0b20tc3RpY2t5JztcbmNvbnN0IFNDUk9MTElOR19VUCA9ICdzY3JvbGxpbmctdXAnO1xuY29uc3QgU0NST0xMSU5HX0RPV04gPSAnc2Nyb2xsaW5nLWRvd24nO1xuY29uc3QgU0NST0xMSU5HX1VOQ0ggPSAnbm90LXNjcm9sbGluZydcblxuZXhwb3J0IGNsYXNzIE9uaW9uU3RpY2t5IHtcbiAgY29uc3RydWN0b3IgKG9wdGlvbnMpIHtcbiAgICBfLmV4dGVuZCh0aGlzLCBvcHRpb25zKTtcbiAgICB0aGlzLmFuaW1hdGlvbkxvb3AgPSB0aGlzLmFuaW1hdGlvbkxvb3AuYmluZCh0aGlzKTtcbiAgfVxuXG4gIHNob3VsZFJlbmRlckFuaW1hdGlvbiAoKSB7XG4gICAgLy8gV2UgcnVuIGEgbGl0dGxlIGNoZWNrIG9uIHNvbWUgdmFsdWVzICB0byBzZWUgaWYgd2Ugc2hvdWxkXG4gICAgLy8gZG8gYW55IGFuaW1hdGlvbjogaWYgdGhlc2UgaGF2ZW4ndCBjaGFuZ2VkLCB3ZSBiYWlsIG91dC5cbiAgICByZXR1cm4gdGhpcy5lbGVtZW50T3V0T2ZWaWV3cG9ydCgpIHx8ICFfLmlzRXF1YWwodGhpcy5sYXN0RnJhbWUsIHRoaXMuZnJhbWUpO1xuICB9XG5cbiAgZ2V0RnJhbWVEYXRhICgpIHtcbiAgICB0aGlzLmxhc3RGcmFtZSA9IHRoaXMuZnJhbWU7XG5cbiAgICBsZXQgZWxlbWVudFJlY3QgPSB0aGlzLmVsZW1lbnRbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgbGV0IGNvbnRhaW5lclJlY3QgPSB0aGlzLmNvbnRhaW5lclswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgIHRoaXMuZnJhbWUgPSB7XG4gICAgICBlbGVtZW50UmVjdCAgICAgOiBfLnBpY2soZWxlbWVudFJlY3QsIFsndG9wJywgJ3JpZ2h0JywgJ2JvdHRvbScsICdsZWZ0JywgJ3dpZHRoJywgJ2hlaWdodCddKSxcbiAgICAgIGNvbnRhaW5lclJlY3QgICA6IF8ucGljayhjb250YWluZXJSZWN0LCBbJ3RvcCcsICdyaWdodCcsICdib3R0b20nLCAnbGVmdCcsICd3aWR0aCcsICdoZWlnaHQnXSksXG4gICAgICBpbm5lckhlaWdodCAgICAgOiB3aW5kb3cuaW5uZXJIZWlnaHQsXG4gICAgICBpbm5lcldpZHRoICAgICAgOiB3aW5kb3cuaW5uZXJXaWR0aCxcbiAgICAgIGNvbnRhaW5lclRvcCAgICA6IGNvbnRhaW5lclJlY3QudG9wLFxuICAgICAgY29udGFpbmVyQm90dG9tIDogY29udGFpbmVyUmVjdC5ib3R0b20sXG4gICAgICB6ZXJvUG9pbnQgICAgICAgOiB0aGlzLmdldERpc3RhbmNlRnJvbVRvcCgpLFxuICAgICAgYm90dG9tUG9pbnQgICAgIDogdGhpcy5nZXREaXN0YW5jZUZyb21Cb3R0b20oKSxcbiAgICAgIHNjcm9sbERpcmVjdGlvbiA6IHRoaXMuY2FsY3VsYXRlU2Nyb2xsRGlyZWN0aW9uKCksXG4gICAgfVxuICB9XG5cbiAgZGVidWcgKCkge1xuICAgIGlmICh0aGlzLnByaW50RGVidWcgPT09IHRydWUpIHtcbiAgICAgIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgZWxlbWVudE91dE9mVmlld3BvcnQgKCkge1xuICAgIGxldCBlbGVtZW50UmVjdCA9IHRoaXMuZnJhbWUuZWxlbWVudFJlY3Q7XG4gICAgcmV0dXJuIGVsZW1lbnRSZWN0LnRvcCA+IHdpbmRvdy5pbm5lckhlaWdodCB8fCBlbGVtZW50UmVjdC5ib3R0b20gPCAwO1xuICB9XG5cbiAgY29udGFpbmVyVG9wQmVsb3daZXJvUG9pbnQgKCkge1xuICAgIHJldHVybiB0aGlzLmZyYW1lLmNvbnRhaW5lclJlY3QudG9wID4gdGhpcy5mcmFtZS56ZXJvUG9pbnQ7XG4gIH1cblxuICBjb250YWluZXJCb3R0b21BYm92ZUJvdHRvbVBvaW50ICgpIHtcbiAgICByZXR1cm4gdGhpcy5mcmFtZS5jb250YWluZXJSZWN0LmJvdHRvbSA8PSB0aGlzLmZyYW1lLmlubmVySGVpZ2h0IC0gdGhpcy5mcmFtZS5ib3R0b21Qb2ludDtcbiAgfVxuXG4gIGVsZW1lbnRCb3R0b21BYm92ZUJvdHRvbVBvaW50ICgpIHtcbiAgICByZXR1cm4gdGhpcy5mcmFtZS5lbGVtZW50UmVjdC5ib3R0b20gPCB0aGlzLmZyYW1lLmlubmVySGVpZ2h0IC0gdGhpcy5mcmFtZS5ib3R0b21Qb2ludDtcbiAgfVxuXG4gIGVsZW1lbnRUb3BCZWxvd1plcm9Qb2ludCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZnJhbWUuZWxlbWVudFJlY3QudG9wID49IHRoaXMuZnJhbWUuemVyb1BvaW50O1xuICB9XG5cbiAgZWxlbWVudEZpeGVkVG9Ub3AgKCkge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRbMF0uc3R5bGUudG9wICE9PSBcIlwiICYmIHRoaXMuZWxlbWVudC5jc3MoJ3Bvc2l0aW9uJykgPT09ICdmaXhlZCc7XG4gIH1cblxuICBlbGVtZW50Rml4ZWRUb0JvdHRvbSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudFswXS5zdHlsZS5ib3R0b20gIT09IFwiXCIgJiYgdGhpcy5lbGVtZW50LmNzcygncG9zaXRpb24nKSA9PT0gJ2ZpeGVkJztcbiAgfVxuXG4gIGNhbGN1bGF0ZVNjcm9sbERpcmVjdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuX2xhc3RTY3JvbGxUb3AgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5fbGFzdFNjcm9sbFRvcCA9IHRoaXMuc2Nyb2xsQ29udGFpbmVyLnNjcm9sbFRvcCgpO1xuICAgIH1cblxuICAgIGxldCBzY3JvbGxEaXJlY3Rpb24gPSBTQ1JPTExJTkdfVU5DSDtcbiAgICBsZXQgc2Nyb2xsQ29udGFpbmVyU2Nyb2xsVG9wID0gdGhpcy5zY3JvbGxDb250YWluZXIuc2Nyb2xsVG9wKCk7XG5cbiAgICBpZiAodGhpcy5fbGFzdFNjcm9sbFRvcCA8IHNjcm9sbENvbnRhaW5lclNjcm9sbFRvcCkge1xuICAgICAgc2Nyb2xsRGlyZWN0aW9uID0gU0NST0xMSU5HX0RPV047XG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMuX2xhc3RTY3JvbGxUb3AgPiBzY3JvbGxDb250YWluZXJTY3JvbGxUb3ApIHtcbiAgICAgIHNjcm9sbERpcmVjdGlvbiA9IFNDUk9MTElOR19VUDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBzY3JvbGxEaXJlY3Rpb24gPSBTQ1JPTExJTkdfVU5DSDtcbiAgICB9XG5cbiAgICB0aGlzLl9sYXN0U2Nyb2xsVG9wID0gc2Nyb2xsQ29udGFpbmVyU2Nyb2xsVG9wOztcbiAgICByZXR1cm4gc2Nyb2xsRGlyZWN0aW9uO1xuICB9XG5cbiAgcmVuZGVyRnJhbWUgKCkge1xuICAgIHRoaXMuZ2V0RnJhbWVEYXRhKCk7XG5cbiAgICBpZiAoIXRoaXMuc2hvdWxkUmVuZGVyQW5pbWF0aW9uKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgc3R5bGVzID0ge307XG5cbiAgICBpZiAodGhpcy5jb250YWluZXJUb3BCZWxvd1plcm9Qb2ludCgpKSB7XG4gICAgICB0aGlzLmRlYnVnKCdjb250YWluZXJUb3BCZWxvd1plcm9Qb2ludCcpO1xuICAgICAgc3R5bGVzLnBvc2l0aW9uID0gJyc7XG4gICAgICBzdHlsZXMudG9wID0gJyc7XG4gICAgICBzdHlsZXMuYm90dG9tID0gJyc7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMuY29udGFpbmVyQm90dG9tQWJvdmVCb3R0b21Qb2ludCgpKSB7XG4gICAgICB0aGlzLmRlYnVnKCdjb250YWluZXJCb3R0b21BYm92ZUJvdHRvbVBvaW50Jyk7XG4gICAgICBzdHlsZXMucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgc3R5bGVzLnRvcCA9ICcnO1xuICAgICAgc3R5bGVzLmJvdHRvbSA9IHRoaXMuZnJhbWUuYm90dG9tUG9pbnQ7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMuZnJhbWUuc2Nyb2xsRGlyZWN0aW9uID09PSBTQ1JPTExJTkdfRE9XTikge1xuICAgICAgdGhpcy5kZWJ1Zyh0aGlzLmZyYW1lLnNjcm9sbERpcmVjdGlvbiwgdGhpcy5lbGVtZW50LmNzcygndG9wJykpO1xuICAgICAgaWYgKHRoaXMuZWxlbWVudEJvdHRvbUFib3ZlQm90dG9tUG9pbnQoKSkge1xuICAgICAgICB0aGlzLmRlYnVnKCdlbGVtZW50Qm90dG9tQWJvdmVCb3R0b21Qb2ludCcpO1xuICAgICAgICBzdHlsZXMucG9zaXRpb24gPSAnZml4ZWQnO1xuICAgICAgICBzdHlsZXMudG9wID0gJyc7XG4gICAgICAgIHN0eWxlcy5ib3R0b20gPSB0aGlzLmZyYW1lLmJvdHRvbVBvaW50O1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIXRoaXMuZm9sbG93U2Nyb2xsICYmIHRoaXMuZWxlbWVudEZpeGVkVG9Ub3AoKSkge1xuICAgICAgICB0aGlzLmRlYnVnKCdlbGVtZW50Rml4ZWRUb1RvcCcpO1xuICAgICAgICBzdHlsZXMucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICBzdHlsZXMudG9wID0gKE1hdGguYWJzKHRoaXMuZnJhbWUuY29udGFpbmVyUmVjdC50b3ApIC0gTWF0aC5hYnModGhpcy5mcmFtZS5lbGVtZW50UmVjdC50b3ApKSArIHRoaXMuZnJhbWUuemVyb1BvaW50ICsgdGhpcy5mcmFtZS56ZXJvUG9pbnQ7XG4gICAgICAgIHN0eWxlcy5ib3R0b20gPSAnJztcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5lbGVtZW50T3V0T2ZWaWV3cG9ydCgpIHx8IHRoaXMuZnJhbWUuc2Nyb2xsRGlyZWN0aW9uID09PSBTQ1JPTExJTkdfVVApIHtcbiAgICAgIGlmICh0aGlzLmVsZW1lbnRUb3BCZWxvd1plcm9Qb2ludCgpKSB7XG4gICAgICAgIHRoaXMuZGVidWcoJ2ZpeCB0byB6ZXJvUG9pbnQnKTtcbiAgICAgICAgc3R5bGVzLnBvc2l0aW9uID0gJ2ZpeGVkJztcbiAgICAgICAgc3R5bGVzLnRvcCA9IHRoaXMuZnJhbWUuemVyb1BvaW50O1xuICAgICAgICBzdHlsZXMuYm90dG9tID0gJyc7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICghdGhpcy5mb2xsb3dTY3JvbGwgJiYgdGhpcy5lbGVtZW50Rml4ZWRUb0JvdHRvbSgpKSB7XG4gICAgICAgIHRoaXMuZGVidWcoJ2ZpeCB0byBhYnNvbHV0ZSB0b3AnKTtcbiAgICAgICAgc3R5bGVzLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgc3R5bGVzLnRvcCA9IE1hdGguYWJzKHRoaXMuZnJhbWUuY29udGFpbmVyUmVjdC50b3ApIC0gTWF0aC5hYnModGhpcy5mcmFtZS5lbGVtZW50UmVjdC50b3ApO1xuICAgICAgICBzdHlsZXMuYm90dG9tID0gJyc7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuZWxlbWVudEJvdHRvbUFib3ZlQm90dG9tUG9pbnQoKSkge1xuICAgICAgICB0aGlzLmRlYnVnKCdlbGVtZW50Qm90dG9tQWJvdmVCb3R0b21Qb2ludCcpO1xuICAgICAgICBzdHlsZXMucG9zaXRpb24gPSAnZml4ZWQnO1xuICAgICAgICBzdHlsZXMudG9wID0gJyc7XG4gICAgICAgIHN0eWxlcy5ib3R0b20gPSB0aGlzLmZyYW1lLmJvdHRvbVBvaW50O1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuZGVidWcoJ3JlbmRlckZyYW1lKCkgc3R5bGVzJywgc3R5bGVzKTtcbiAgICB0aGlzLmVsZW1lbnQuY3NzKHN0eWxlcyk7XG4gIH1cblxuICBhbmltYXRpb25Mb29wICgpIHtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5hbmltYXRpb25Mb29wKTtcbiAgICB0aGlzLnJlbmRlckZyYW1lKCk7XG4gIH1cbn1cblxuXG4iXX0=
