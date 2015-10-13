(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var BOTTOM_STICKY = 'bottom-sticky';
var SCROLLING_UP = 'scrolling-up';
var SCROLLING_DOWN = 'scrolling-down';
var SCROLLING_UNCH = 'not-scrolling';

module.exports = (function () {
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
      if (!this._lastScrollTop) {
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
        }
      }

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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY29sbGlubWlsbGVyL0NvZGUvb25pb24tc3RpY2t5L3NyYy9vbmlvbi1zdGlja3kuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxZQUFZLENBQUM7Ozs7OztBQUViLElBQU0sYUFBYSxHQUFHLGVBQWUsQ0FBQztBQUN0QyxJQUFNLFlBQVksR0FBRyxjQUFjLENBQUM7QUFDcEMsSUFBTSxjQUFjLEdBQUcsZ0JBQWdCLENBQUM7QUFDeEMsSUFBTSxjQUFjLEdBQUcsZUFBZSxDQUFBOztBQUV0QyxNQUFNLENBQUMsT0FBTztBQUNBLFdBRFMsV0FBVyxDQUNuQixPQUFPLEVBQUU7MEJBREQsV0FBVzs7QUFFOUIsS0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDeEIsUUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUNwRDs7ZUFKb0IsV0FBVzs7V0FNVixpQ0FBRzs7O0FBR3ZCLGFBQU8sSUFBSSxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQzlFOzs7V0FFWSx3QkFBRztBQUNkLFVBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQzs7QUFFNUIsVUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO0FBQzFELFVBQUksYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMscUJBQXFCLEVBQUUsQ0FBQzs7QUFFOUQsVUFBSSxDQUFDLEtBQUssR0FBRztBQUNYLG1CQUFXLEVB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RSxDQUFDO1NBQ3BCLE1BQ0ksSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLG9CQUFvQixFQUFFLEVBQUU7QUFDMUQsY0FBSSxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBQ2xDLGdCQUFNLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQztBQUM3QixnQkFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDM0YsZ0JBQU0sQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1NBQ3BCO09BQ0Y7O0FBRUQsVUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDMUI7OztXQUVhLHlCQUFHO0FBQ2YsMkJBQXFCLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQzFDLFVBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztLQUNwQjs7O1NBakpvQixXQUFXO0lBa0pqQyxDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgQk9UVE9NX1NUSUNLWSA9ICdib3R0b20tc3RpY2t5JztcbmNvbnN0IFNDUk9MTElOR19VUCA9ICdzY3JvbGxpbmctdXAnO1xuY29uc3QgU0NST0xMSU5HX0RPV04gPSAnc2Nyb2xsaW5nLWRvd24nO1xuY29uc3QgU0NST0xMSU5HX1VOQ0ggPSAnbm90LXNjcm9sbGluZydcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBPbmlvblN0aWNreSB7XG4gIGNvbnN0cnVjdG9yIChvcHRpb25zKSB7XG4gICAgXy5leHRlbmQodGhpcywgb3B0aW9ucyk7XG4gICAgdGhpcy5hbmltYXRpb25Mb29wID0gdGhpcy5hbmltYXRpb25Mb29wLmJpbmQodGhpcyk7XG4gIH1cblxuICBzaG91bGRSZW5kZXJBbmltYXRpb24gKCkge1xuICAgIC8vIFdlIHJ1biBhIGxpdHRsZSBjaGVjayBvbiBzb21lIHZhbHVlcyAgdG8gc2VlIGlmIHdlIHNob3VsZFxuICAgIC8vIGRvIGFueSBhbmltYXRpb246IGlmIHRoZXNlIGhhdmVuJ3QgY2hhbmdlZCwgd2UgYmFpbCBvdXQuXG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudE91dE9mVmlld3BvcnQoKSB8fCAhXy5pc0VxdWFsKHRoaXMubGFzdEZyYW1lLCB0aGlzLmZyYW1lKTtcbiAgfVxuXG4gIGdldEZyYW1lRGF0YSAoKSB7XG4gICAgdGhpcy5sYXN0RnJhbWUgPSB0aGlzLmZyYW1lO1xuXG4gICAgdmFyIGVsZW1lbnRSZWN0ID0gdGhpcy5lbGVtZW50WzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHZhciBjb250YWluZXJSZWN0ID0gdGhpcy5jb250YWluZXJbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICB0aGlzLmZyYW1lID0ge1xuICAgICAgZWxlbWVudFJlY3QgICAgIDogXy5waWNrKGVsZW1lbnRSZWN0LCBbJ3RvcCcsICdyaWdodCcsICdib3R0b20nLCAnbGVmdCcsICd3aWR0aCcsICdoZWlnaHQnXSksXG4gICAgICBjb250YWluZXJSZWN0ICAgOiBfLnBpY2soY29udGFpbmVyUmVjdCwgWyd0b3AnLCAncmlnaHQnLCAnYm90dG9tJywgJ2xlZnQnLCAnd2lkdGgnLCAnaGVpZ2h0J10pLFxuICAgICAgaW5uZXJIZWlnaHQgICAgIDogd2luZG93LmlubmVySGVpZ2h0LFxuICAgICAgaW5uZXJXaWR0aCAgICAgIDogd2luZG93LmlubmVyV2lkdGgsXG4gICAgICBjb250YWluZXJUb3AgICAgOiBjb250YWluZXJSZWN0LnRvcCxcbiAgICAgIGNvbnRhaW5lckJvdHRvbSA6IGNvbnRhaW5lclJlY3QuYm90dG9tLFxuICAgICAgemVyb1BvaW50ICAgICAgIDogdGhpcy5nZXREaXN0YW5jZUZyb21Ub3AoKSxcbiAgICAgIGJvdHRvbVBvaW50ICAgICA6IHRoaXMuZ2V0RGlzdGFuY2VGcm9tQm90dG9tKCksXG4gICAgICBzY3JvbGxEaXJlY3Rpb24gOiB0aGlzLmNhbGN1bGF0ZVNjcm9sbERpcmVjdGlvbigpLFxuICAgIH1cbiAgfVxuXG4gIGRlYnVnICgpIHtcbiAgICBpZiAodGhpcy5wcmludERlYnVnID09PSB0cnVlKSB7XG4gICAgICBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGVsZW1lbnRPdXRPZlZpZXdwb3J0ICgpIHtcbiAgICB2YXIgZWxlbWVudFJlY3QgPSB0aGlzLmZyYW1lLmVsZW1lbnRSZWN0O1xuICAgIHJldHVybiBlbGVtZW50UmVjdC50b3AgPiB3aW5kb3cuaW5uZXJIZWlnaHQgfHwgZWxlbWVudFJlY3QuYm90dG9tIDwgMDtcbiAgfVxuXG4gIGNvbnRhaW5lclRvcEJlbG93WmVyb1BvaW50ICgpIHtcbiAgICByZXR1cm4gdGhpcy5mcmFtZS5jb250YWluZXJSZWN0LnRvcCA+IHRoaXMuZnJhbWUuemVyb1BvaW50O1xuICB9XG5cbiAgY29udGFpbmVyQm90dG9tQWJvdmVCb3R0b21Qb2ludCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZnJhbWUuY29udGFpbmVyUmVjdC5ib3R0b20gPD0gdGhpcy5mcmFtZS5pbm5lckhlaWdodCAtIHRoaXMuZnJhbWUuYm90dG9tUG9pbnQ7XG4gIH1cblxuICBlbGVtZW50Qm90dG9tQWJvdmVCb3R0b21Qb2ludCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZnJhbWUuZWxlbWVudFJlY3QuYm90dG9tIDwgdGhpcy5mcmFtZS5pbm5lckhlaWdodCAtIHRoaXMuZnJhbWUuYm90dG9tUG9pbnQ7XG4gIH1cblxuICBlbGVtZW50VG9wQmVsb3daZXJvUG9pbnQgKCkge1xuICAgIHJldHVybiB0aGlzLmZyYW1lLmVsZW1lbnRSZWN0LnRvcCA+PSB0aGlzLmZyYW1lLnplcm9Qb2ludDtcbiAgfVxuXG4gIGVsZW1lbnRGaXhlZFRvVG9wICgpIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50WzBdLnN0eWxlLnRvcCAhPT0gXCJcIiAmJiB0aGlzLmVsZW1lbnQuY3NzKCdwb3NpdGlvbicpID09PSAnZml4ZWQnO1xuICB9XG5cbiAgZWxlbWVudEZpeGVkVG9Cb3R0b20gKCkge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRbMF0uc3R5bGUuYm90dG9tICE9PSBcIlwiICYmIHRoaXMuZWxlbWVudC5jc3MoJ3Bvc2l0aW9uJykgPT09ICdmaXhlZCc7XG4gIH1cblxuICBjYWxjdWxhdGVTY3JvbGxEaXJlY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5fbGFzdFNjcm9sbFRvcCkge1xuICAgICAgdGhpcy5fbGFzdFNjcm9sbFRvcCA9IHRoaXMuc2Nyb2xsQ29udGFpbmVyLnNjcm9sbFRvcCgpO1xuICAgIH1cblxuICAgIHZhciBzY3JvbGxEaXJlY3Rpb24gPSBTQ1JPTExJTkdfVU5DSDtcbiAgICB2YXIgc2Nyb2xsQ29udGFpbmVyU2Nyb2xsVG9wID0gdGhpcy5zY3JvbGxDb250YWluZXIuc2Nyb2xsVG9wKCk7XG5cbiAgICBpZiAodGhpcy5fbGFzdFNjcm9sbFRvcCA8IHNjcm9sbENvbnRhaW5lclNjcm9sbFRvcCkge1xuICAgICAgc2Nyb2xsRGlyZWN0aW9uID0gU0NST0xMSU5HX0RPV047XG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMuX2xhc3RTY3JvbGxUb3AgPiBzY3JvbGxDb250YWluZXJTY3JvbGxUb3ApIHtcbiAgICAgIHNjcm9sbERpcmVjdGlvbiA9IFNDUk9MTElOR19VUDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBzY3JvbGxEaXJlY3Rpb24gPSBTQ1JPTExJTkdfVU5DSDtcbiAgICB9XG5cbiAgICB0aGlzLl9sYXN0U2Nyb2xsVG9wID0gc2Nyb2xsQ29udGFpbmVyU2Nyb2xsVG9wOztcbiAgICByZXR1cm4gc2Nyb2xsRGlyZWN0aW9uO1xuICB9XG5cbiAgcmVuZGVyRnJhbWUgKCkge1xuICAgIHRoaXMuZ2V0RnJhbWVEYXRhKCk7XG5cbiAgICBpZiAoIXRoaXMuc2hvdWxkUmVuZGVyQW5pbWF0aW9uKCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgc3R5bGVzID0ge31cblxuICAgIGlmICh0aGlzLmNvbnRhaW5lclRvcEJlbG93WmVyb1BvaW50KCkpIHtcbiAgICAgIHRoaXMuZGVidWcoJ2NvbnRhaW5lclRvcEJlbG93WmVyb1BvaW50Jyk7XG4gICAgICBzdHlsZXMucG9zaXRpb24gPSAnJztcbiAgICAgIHN0eWxlcy50b3AgPSAnJztcbiAgICAgIHN0eWxlcy5ib3R0b20gPSAnJztcbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5jb250YWluZXJCb3R0b21BYm92ZUJvdHRvbVBvaW50KCkpIHtcbiAgICAgIHRoaXMuZGVidWcoJ2NvbnRhaW5lckJvdHRvbUFib3ZlQm90dG9tUG9pbnQnKTtcbiAgICAgIHN0eWxlcy5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICBzdHlsZXMudG9wID0gJyc7XG4gICAgICBzdHlsZXMuYm90dG9tID0gdGhpcy5mcmFtZS5ib3R0b21Qb2ludDtcbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5mcmFtZS5zY3JvbGxEaXJlY3Rpb24gPT09IFNDUk9MTElOR19ET1dOKSB7XG4gICAgICB0aGlzLmRlYnVnKHRoaXMuZnJhbWUuc2Nyb2xsRGlyZWN0aW9uLCB0aGlzLmVsZW1lbnQuY3NzKCd0b3AnKSk7XG4gICAgICBpZiAodGhpcy5lbGVtZW50Qm90dG9tQWJvdmVCb3R0b21Qb2ludCgpKSB7XG4gICAgICAgIHRoaXMuZGVidWcoJ2VsZW1lbnRCb3R0b21BYm92ZUJvdHRvbVBvaW50Jyk7XG4gICAgICAgIHN0eWxlcy5wb3NpdGlvbiA9ICdmaXhlZCc7XG4gICAgICAgIHN0eWxlcy50b3AgPSAnJztcbiAgICAgICAgc3R5bGVzLmJvdHRvbSA9IHRoaXMuZnJhbWUuYm90dG9tUG9pbnQ7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICghdGhpcy5mb2xsb3dTY3JvbGwgJiYgdGhpcy5lbGVtZW50Rml4ZWRUb1RvcCgpKSB7XG4gICAgICAgIHRoaXMuZGVidWcoJ2VsZW1lbnRGaXhlZFRvVG9wJyk7XG4gICAgICAgIHN0eWxlcy5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgIHN0eWxlcy50b3AgPSAoTWF0aC5hYnModGhpcy5mcmFtZS5jb250YWluZXJSZWN0LnRvcCkgLSBNYXRoLmFicyh0aGlzLmZyYW1lLmVsZW1lbnRSZWN0LnRvcCkpICsgdGhpcy5mcmFtZS56ZXJvUG9pbnQgKyB0aGlzLmZyYW1lLnplcm9Qb2ludDtcbiAgICAgICAgc3R5bGVzLmJvdHRvbSA9ICcnO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLmVsZW1lbnRPdXRPZlZpZXdwb3J0KCkgfHwgdGhpcy5mcmFtZS5zY3JvbGxEaXJlY3Rpb24gPT09IFNDUk9MTElOR19VUCkge1xuICAgICAgaWYgKHRoaXMuZWxlbWVudFRvcEJlbG93WmVyb1BvaW50KCkpIHtcbiAgICAgICAgdGhpcy5kZWJ1ZygnZml4IHRvIHplcm9Qb2ludCcpO1xuICAgICAgICBzdHlsZXMucG9zaXRpb24gPSAnZml4ZWQnO1xuICAgICAgICBzdHlsZXMudG9wID0gdGhpcy5mcmFtZS56ZXJvUG9pbnQ7XG4gICAgICAgIHN0eWxlcy5ib3R0b20gPSAnJztcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKCF0aGlzLmZvbGxvd1Njcm9sbCAmJiB0aGlzLmVsZW1lbnRGaXhlZFRvQm90dG9tKCkpIHtcbiAgICAgICAgdGhpcy5kZWJ1ZygnZml4IHRvIGFic29sdXRlIHRvcCcpO1xuICAgICAgICBzdHlsZXMucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICBzdHlsZXMudG9wID0gTWF0aC5hYnModGhpcy5mcmFtZS5jb250YWluZXJSZWN0LnRvcCkgLSBNYXRoLmFicyh0aGlzLmZyYW1lLmVsZW1lbnRSZWN0LnRvcCk7XG4gICAgICAgIHN0eWxlcy5ib3R0b20gPSAnJztcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmVsZW1lbnQuY3NzKHN0eWxlcyk7XG4gIH1cblxuICBhbmltYXRpb25Mb29wICgpIHtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5hbmltYXRpb25Mb29wKTtcbiAgICB0aGlzLnJlbmRlckZyYW1lKCk7XG4gIH1cbn1cblxuXG4iXX0=
