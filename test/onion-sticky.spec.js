var assert = chai.assert;

function returnTrue () { return true; }
function returnFalse () { return false; }

function debugRect(element, label) {
  if (element.length) {
    element = element[0];
  }

  var rect = element.getBoundingClientRect();
  console.log('========= DEBUG RECT: ' + (label || ''));
  console.log('     top: ' + rect.top);
  console.log('   right: ' + rect.right);
  console.log('  bottom: ' + rect.bottom);
  console.log('    left: ' + rect.left);
  console.log('   width: ' + rect.width);
  console.log('  height: ' + rect.height);
}

function debugFrame(sticky, label) {
  var frame = sticky.frame;
  if (!frame) {
    return;
  }

  console.log('========= DEBUG FRAME: ' + (label || ''));
  console.log('       containerTop: ' + frame.containerTop);
  console.log('    containerBottom: ' + frame.containerBottom);
  console.log('        bottomPoint: ' + frame.bottomPoint);
  console.log('          zeroPoint: ' + frame.zeroPoint);
  console.log('    scrollDirection: ' + frame.scrollDirection);
  console.log('        innerHeight: ' + frame.innerHeight);
  console.log('         innerWidth: ' + frame.innerWidth);
}

describe('Onion Sticky', function () {
  var scrollContainer;
  before(function () {
    fixture.setBase('test');
    if (document.body.scrollHeight > document.documentElement.scrollHeight) {
      scrollContainer = document.body;
    }
    else {
      scrollContainer = document.documentElement;
    }
  });

  beforeEach(function() {
    scrollContainer.scrollTop = 0;
    this.markup = fixture.load('test.html')[0];
    document.body.insertBefore(this.markup, document.body.firstChild);

    this.header = $('header');
    this.footer = $('footer');
    this.sticky = new OnionSticky.OnionSticky({
      printDebug: false,
      element: this.element = $('aside'),
      container: this.container = $('main'),
      scrollContainer: this.scrollContainer = $(scrollContainer),
      getDistanceFromTop: function () {
        return this.header.outerHeight(true);
      }.bind(this),
      getDistanceFromBottom: function () {
        return this.footer.outerHeight(true);;
      }.bind(this),
      followScroll: false,
    });
  });

  afterEach(function(){
    fixture.cleanup();
    document.body.removeChild(this.markup);
    if (this.sticky && this.currentTest.state == 'failed') {
      debugFrame(this.sticky);
    }
  });


  describe('elementOutOfViewport', function () {
    it('false when element is in viewport', function () {
      this.sticky.getFrameData();

      assert.isFalse(this.sticky.elementOutOfViewport());
    });

    it('true when element is out of viewport (above)', function () {
      this.element.css({
        height: '100px',
        position: 'fixed',
        top: -101,
      });
      this.sticky.getFrameData();

      assert.isTrue(this.sticky.elementOutOfViewport());
    });

    it('true when element is out of viewport (below)', function () {
      this.element.css({
        height: '100px',
        position: 'fixed',
        top: window.innerHeight + 1,
      });
      this.sticky.getFrameData();

      assert.isTrue(this.sticky.elementOutOfViewport());
    });
  });

  describe('containerTopBelowZeroPoint', function () {
    it('true when scrolled below zero point', function () {
      this.container.css({ position: 'relative', top: '100px' });
      this.sticky.getFrameData();

      assert.isTrue(this.sticky.containerTopBelowZeroPoint());
    });

    it('false when scrolled above zero point', function () {
      scrollContainer.scrollTop = 200;
      this.sticky.getFrameData();

      assert.isFalse(this.sticky.containerTopBelowZeroPoint());
    });
  });

  describe('containerBottomAboveBottomPoint', function () {
    it('true when scrolled above bottom point', function () {
      scrollContainer.scrollTop = this.container.height() + this.header.height() + 10;
      console.log('scrollContainer.expectedScrollTop', this.container.height() + this.header.height() + 10)
      console.log('scrollContainer.actualScrollTop', scrollContainer.scrollTop);
      this.sticky.getFrameData();

      console.log('=========================');
      debugFrame(this.sticky);
      debugRect(this.container, 'containerRect');
      debugRect(this.element, 'elementRect');
      console.log('body.scrollTop', document.body.scrollTop);
      console.log('documentElement.scrollTop', document.documentElement.scrollTop);

      console.log('=========================');
      assert.isTrue(this.sticky.containerBottomAboveBottomPoint());
    });

    it('false when scrolled below bottom point', function () {
      this.sticky.getFrameData();

      assert.isFalse(this.sticky.containerBottomAboveBottomPoint());
    });
  });

  describe('elementBottomAboveBottomPoint', function () {
    it('true when scrolled above bottom point', function () {
      scrollContainer.scrollTop = this.element.height() + this.header.height() + 10;
      this.sticky.getFrameData();

      assert.isTrue(this.sticky.elementBottomAboveBottomPoint());
    });

    it('false when scrolled below bottom point', function () {
      this.sticky.getFrameData();

      assert.isFalse(this.sticky.elementBottomAboveBottomPoint());
    });
  });

  describe('elementTopBelowZeroPoint', function () {
    it('true when scrolled beyond zero point', function () {
      this.sticky.getFrameData();

      assert.isTrue(this.sticky.elementTopBelowZeroPoint());
    });

    it('false when not scrolled beyond zero point', function () {
      this.element.css({ position: 'relative', top: '100px' });
      scrollContainer.scrollTop = this.header.height();
      this.sticky.getFrameData();

      assert.isFalse(this.sticky.elementTopBelowZeroPoint());
    });
  });

  describe('containerTopBelowZeroPoint', function () {
    it('true when container top below zero point', function () {
      this.container.css({ position: 'relative', top: '1px' })
      this.sticky.getFrameData();

      assert.isTrue(this.sticky.containerTopBelowZeroPoint());
    });

    it('false when cointer top above zero point', function () {
      this.sticky.getFrameData();

      assert.isFalse(this.sticky.containerTopBelowZeroPoint());
    });
  });

  describe('elementFixedToTop', function () {
    it('true when element fixed to top', function () {
      this.element.css({ top: '10px', position: 'fixed' });
      this.sticky.getFrameData();

      assert.isTrue(this.sticky.elementFixedToTop());
    });

    it('false when element not fixed to top', function () {
      this.sticky.getFrameData();

      assert.isFalse(this.sticky.elementFixedToTop());
    });
  });

  describe('elementFixedToBottom', function () {
    it('true when element fixed to bottom', function () {
      this.element.css({ bottom: '10px', position: 'fixed' });
      this.sticky.getFrameData();

      assert.isTrue(this.sticky.elementFixedToBottom());
    });

    it('false when element not fixed to bottom', function () {
      this.sticky.getFrameData();

      assert.isFalse(this.sticky.elementFixedToBottom());
    });
  });

  describe('calculateScrollDirection', function () {
    it('SCROLLING_UNCHANGED on first call', function () {
      assert.equal(this.sticky.calculateScrollDirection(), 'not-scrolling');
    });

    it('SCROLLING_UNCHANGED when scrolling unchanged', function () {
      this.scrollContainer.scrollTop(10);
      this.sticky.calculateScrollDirection();
      this.scrollContainer.scrollTop(10);

      assert.equal(this.sticky.calculateScrollDirection(), 'not-scrolling');
    });

    it('SCROLLING_DOWN when scrolling down', function () {
      this.scrollContainer.scrollTop(0);
      this.sticky.calculateScrollDirection();
      this.scrollContainer.scrollTop(10);

      assert.equal(this.sticky.calculateScrollDirection(), 'scrolling-down');
    });

    it('SCROLLING_UP when scrolling up', function () {
      this.scrollContainer.scrollTop(10);
      this.sticky.calculateScrollDirection();
      this.scrollContainer.scrollTop(0);

      assert.equal(this.sticky.calculateScrollDirection(), 'scrolling-up');
    });
  });

  describe('lessThanBreakpoint', function () {
    it('true when screen width is less than breakpoint', function () {
      this.sticky.breakpoint = window.innerWidth + 100;

      assert.isTrue(this.sticky.lessThanBreakpoint());
    });

    it('false when screen width is greater than breakpoint', function () {
      this.sticky.breakpoint = window.innerWidth - 100;

      assert.isFalse(this.sticky.lessThanBreakpoint());
    });

    it('false when no breakpoint set', function () {
      this.sticky.breakpoint = undefined;

      assert.isFalse(this.sticky.lessThanBreakpoint());
    });
  });

  describe('renderFrame', function () {
    beforeEach(function () {
      // Let's always render;
      this.sticky.shouldRenderAnimation = returnTrue;

      this.element.css({
        position: 'relative',
        top: '-10px',
        bottom: '-10px'
      });
    });

    it('sets styles when containerTopBelowZeroPoint', function () {
      this.sticky.containerTopBelowZeroPoint = returnTrue;
      this.sticky.renderFrame();

      assert.equal(this.element[0].style.position, '');
      assert.equal(this.element[0].style.top, '');
      assert.equal(this.element[0].style.bottom, '');
    });

    it('sets styles when containerBottomAboveBottomPoint', function () {
      this.sticky.containerBottomAboveBottomPoint = returnTrue;
      this.sticky.renderFrame();

      assert.equal(this.element[0].style.position, 'absolute');
      assert.equal(this.element[0].style.top, '');
      assert.equal(this.element[0].style.bottom, '200px');
    });

    context('when scrolling down', function () {
      beforeEach(function () {
        this.scrollContainer.scrollTop(0);
        this.sticky.calculateScrollDirection();
        this.scrollContainer.scrollTop(10);
      });

      it('sets styles when elementBottomAboveBottomPoint', function () {
        this.sticky.elementBottomAboveBottomPoint = returnTrue;
        this.sticky.renderFrame();

        assert.equal(this.element[0].style.position, 'fixed');
        assert.equal(this.element[0].style.top, '');
        assert.equal(this.element[0].style.bottom, '200px');
      });

      it('sets styles when !followSCroll and elementFixedToTop', function () {
        this.sticky.followScroll = false;
        this.sticky.elementFixedToTop = returnTrue;
        this.sticky.renderFrame();

        assert.equal(this.element[0].style.position, 'absolute');
        assert.equal(this.element[0].style.top, '410px');
        assert.equal(this.element[0].style.bottom, '');
      });
    });

    context('when element out of viewport', function () {
      beforeEach(function elementOutOfViewport () {
        this.element.css({
          position: 'fixed',
          top: '-101px',
          height: '100px',
        });
      });

      it('sets styles if elementTopBelowZeroPoint', function () {
        this.sticky.elementTopBelowZeroPoint = returnTrue;
        this.sticky.renderFrame();

        assert.equal(this.element[0].style.position, 'fixed');
        assert.equal(this.element[0].style.top, '200px');
        assert.equal(this.element[0].style.bottom, '');
      });

      it('sets styles if !followScroll and elementFixedToBottom', function () {
        this.sticky.followScroll = false;
        this.sticky.elementFixedToBottom = returnTrue;
        this.sticky.renderFrame();

        assert.equal(this.element[0].style.position, 'absolute');
        assert.equal(this.element[0].style.top, '99px');
        assert.equal(this.element[0].style.bottom, '');
      });

      it('sets styles if elementBottomAboveBottomPoint and followScroll = true', function () {
        this.sticky.followScroll = true;
        this.sticky.elementBottomAboveBottomPoint = returnTrue;
        this.sticky.renderFrame();

        assert.equal(this.element[0].style.position, 'fixed');
        assert.equal(this.element[0].style.top, '');
        assert.equal(this.element[0].style.bottom, '200px');
      });
    });

    context('when scrolling up', function () {
      beforeEach(function scrollingUp () {
        this.scrollContainer.scrollTop(10);
        this.sticky.calculateScrollDirection();
        this.scrollContainer.scrollTop(0);
      });

      it('sets styles if elementTopBelowZeroPoint', function () {
        this.sticky.elementTopBelowZeroPoint = returnTrue;
        this.sticky.renderFrame();

        assert.equal(this.element[0].style.position, 'fixed');
        assert.equal(this.element[0].style.top, '200px');
        assert.equal(this.element[0].style.bottom, '');
      });

      it('sets styles if !followScroll and elementFixedToBottom', function () {
        this.sticky.followScroll = false;
        this.sticky.elementFixedToBottom = returnTrue;
        this.sticky.renderFrame();

        assert.equal(this.element[0].style.position, 'absolute');
        assert.equal(this.element[0].style.top, '10px');
        assert.equal(this.element[0].style.bottom, '');
      });

      it('sets styles if elementBottomAboveBottomPoint', function () {
        this.sticky.elementBottomAboveBottomPoint = returnTrue;
        this.sticky.renderFrame();

        assert.equal(this.element[0].style.position, 'fixed');
        assert.equal(this.element[0].style.top, '');
        assert.equal(this.element[0].style.bottom, '200px');
      });
    });
  });

  describe('breakpoint', function () {
    context('when screen width less than breakpoint', function () {
      it('does not apply sticky rules', function () {
        this.sticky.lessThanBreakpoint = returnTrue;
        this.sticky.elementBottomAboveBottomPoint = returnTrue;
        this.sticky.renderFrame();

        assert.equal(this.element[0].style.position, '');
        assert.equal(this.element[0].style.top, '');
        assert.equal(this.element[0].style.bottom, '');
      });
    });

    context('when screen width greater than breakpoint', function () {
      it('does apply sticky rules', function () {
        this.sticky.shouldRenderAnimation = returnTrue;

        this.element.css({
          position: 'relative',
          top: '-10px',
          bottom: '-10px'
        });

        this.scrollContainer.scrollTop(10);
        this.sticky.calculateScrollDirection();
        this.scrollContainer.scrollTop(0);

        this.sticky.lessThanBreakpoint = returnFalse;
        this.sticky.elementBottomAboveBottomPoint = returnTrue;
        this.sticky.renderFrame();

        assert.equal(this.element[0].style.position, 'fixed');
        assert.equal(this.element[0].style.top, '');
        assert.equal(this.element[0].style.bottom, '200px');
      });
    });
  });
});
