'use strict';

const BOTTOM_STICKY = 'bottom-sticky';
const SCROLLING_UP = 'scrolling-up';
const SCROLLING_DOWN = 'scrolling-down';
const SCROLLING_UNCH = 'not-scrolling'

export class OnionSticky {
  constructor (options) {
    _.extend(this, options);
    this.animationLoop = this.animationLoop.bind(this);
  }

  shouldRenderAnimation () {
    // We run a little check on some values  to see if we should
    // do any animation: if these haven't changed, we bail out.
    return this.elementOutOfViewport() || !_.isEqual(this.lastFrame, this.frame);
  }

  getFrameData () {
    this.lastFrame = this.frame;

    let elementRect = this.element[0].getBoundingClientRect();
    let containerRect = this.container[0].getBoundingClientRect();

    this.frame = {
      elementRect     : _.pick(elementRect, ['top', 'right', 'bottom', 'left', 'width', 'height']),
      containerRect   : _.pick(containerRect, ['top', 'right', 'bottom', 'left', 'width', 'height']),
      innerHeight     : window.innerHeight,
      innerWidth      : window.innerWidth,
      containerTop    : containerRect.top,
      containerBottom : containerRect.bottom,
      zeroPoint       : this.getDistanceFromTop(),
      bottomPoint     : this.getDistanceFromBottom(),
      scrollDirection : this.calculateScrollDirection(),
    }
  }

  debug () {
    if (this.printDebug === true) {
      console.log.apply(console, arguments);
    }
  }

  elementOutOfViewport () {
    let elementRect = this.frame.elementRect;
    return elementRect.top > window.innerHeight || elementRect.bottom < 0;
  }

  containerTopBelowZeroPoint () {
    return this.frame.containerRect.top > this.frame.zeroPoint;
  }

  containerBottomAboveBottomPoint () {
    return this.frame.containerRect.bottom <= this.frame.innerHeight - this.frame.bottomPoint;
  }

  elementBottomAboveBottomPoint () {
    return this.frame.elementRect.bottom < this.frame.innerHeight - this.frame.bottomPoint;
  }

  elementTopBelowZeroPoint () {
    return this.frame.elementRect.top >= this.frame.zeroPoint;
  }

  elementFixedToTop () {
    return this.element[0].style.top !== "" && this.element.css('position') === 'fixed';
  }

  elementFixedToBottom () {
    return this.element[0].style.bottom !== "" && this.element.css('position') === 'fixed';
  }

  calculateScrollDirection () {
    if (typeof(this._lastScrollTop) === 'undefined') {
      this._lastScrollTop = this.scrollContainer.scrollTop();
    }

    let scrollDirection = SCROLLING_UNCH;
    let scrollContainerScrollTop = this.scrollContainer.scrollTop();

    if (this._lastScrollTop < scrollContainerScrollTop) {
      scrollDirection = SCROLLING_DOWN;
    }
    else if (this._lastScrollTop > scrollContainerScrollTop) {
      scrollDirection = SCROLLING_UP;
    }
    else {
      scrollDirection = SCROLLING_UNCH;
    }

    this._lastScrollTop = scrollContainerScrollTop;;
    return scrollDirection;
  }

  renderFrame () {
    this.getFrameData();

    if (!this.shouldRenderAnimation()) {
      return;
    }

    let styles = {};

    if (this.containerTopBelowZeroPoint()) {
      this.debug('containerTopBelowZeroPoint');
      styles.position = '';
      styles.top = '';
      styles.bottom = '';
    }
    else if (this.containerBottomAboveBottomPoint()) {
      this.debug('containerBottomAboveBottomPoint');
      styles.position = 'absolute';
      styles.top = '';
      styles.bottom = this.frame.bottomPoint;
    }
    else if (this.frame.scrollDirection === SCROLLING_DOWN) {
      this.debug(this.frame.scrollDirection, this.element.css('top'));
      if (this.elementBottomAboveBottomPoint()) {
        this.debug('elementBottomAboveBottomPoint');
        styles.position = 'fixed';
        styles.top = '';
        styles.bottom = this.frame.bottomPoint;
      }
      else if (!this.followScroll && this.elementFixedToTop()) {
        this.debug('elementFixedToTop');
        styles.position = 'absolute';
        styles.top = (Math.abs(this.frame.containerRect.top) - Math.abs(this.frame.elementRect.top)) + this.frame.zeroPoint + this.frame.zeroPoint;
        styles.bottom = '';
      }
    }
    else if (this.elementOutOfViewport() || this.frame.scrollDirection === SCROLLING_UP) {
      if (this.elementTopBelowZeroPoint()) {
        this.debug('fix to zeroPoint');
        styles.position = 'fixed';
        styles.top = this.frame.zeroPoint;
        styles.bottom = '';
      }
      else if (!this.followScroll && this.elementFixedToBottom()) {
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

  animationLoop () {
    requestAnimationFrame(this.animationLoop);
    this.renderFrame();
  }
}


