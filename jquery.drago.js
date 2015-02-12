/**
 * jQuery Drago v0.1.2
 * A lightweight drag and resize plugin meant for editorial design
 * in the browser.
 *
 * Original author: @kuroi_kenshi (hostsamurai)
 * Licensed under the WTFPL http://sam.zoy.org/wtfpl/COPYING
 */
(function(global, factory) {
  if (typeof define === 'function' && define.amd) {
  	define(function() {
    	return factory(global, document);
    });
  } else if (typeof module !== 'undefined' && module.exports) {
		require('zepto');	
		module.exports = factory(global, document);
  } else {
    factory(global, document);
  }
}(Zepto, function($, document) {

  var Drago = function(el, opts) {
    this._$el = $(el);
    this.opts = opts;
    this.init();
  };


  // store the original height and width of the current element to detect
  // if element is being resized, and bind events
  Drago.prototype.init = function () {
    var $this = this._$el,
        orig = { height: $this[0].offsetHeight, width: $this[0].offsetWidth };

    $this.data('drago', orig);

    if (this.opts.resize && $this.css('resize') !== 'both') {
      $this.css({ resize: 'both', overflow: 'hidden' });
    }

    this.bindEvents();
  };


  // updates the location of the element only if it's not being resized
  Drago.prototype.drag = function(e, data) {
    var $this = $(this);
    $this.css({ left: data.x, top: data.y });
    $this.data({ height: $this[0].offsetHeight, width: $this[0].offsetWidth });
  };


  // displays the current element's CSS
  Drago.prototype.showCSS = function(el) {
    var $el = $(this);

    if ($el[0].style.left !== '' && $el[0].style.top !== '') {
      var $div = $('<div/>'),
          $pre = $('<pre/>'),
          $a = $('<a>x</a>');

      $div.addClass('drago').css({ top: $el.offset().top - 50, left: $el.offset().left + 50 });

      var text = 'left: ' + $el[0].style.left + '; top: ' + $el[0].style.top + '; ' +
                 'width: ' + $el.width() + 'px; height: ' + $el.height() + 'px;';
      $pre.text(text);

      $a.prop('href', '#').on('click', function(e) {
          e.preventDefault();
          $el.trigger('drago.hide', { elem: $(this) });
        });

      $div.append($pre).prepend($a).appendTo($el.offsetParent());
    }
  };


  Drago.prototype.hideCSS = function(e, data) {
    $(data.elem).offsetParent().remove();
  };


  Drago.prototype.bindEvents = function () {
    this._$el.on('drago.drag', this.drag)
             .on('drago.show', this.showCSS)
             .on('drago.hide', this.hideCSS);

    this._$el.on('mousedown', { options: this.opts, ctx: this }, this.events.mousedown)
             .on('dblclick', function(e) { $(this).trigger('drago.show') });
  };


  // Events
  // ----------------
  var _events = {};

  // gets the current coordinates and options and passes them
  // to the mousemove event
  _events.mousedown = function(e) {
    var $this = $(this);
    $this.css({ cursor: 'move', userSelect: 'none' });

    var opts = {
      dimensions: {
        x: parseInt($this.css('left') !== 'auto' ? $this.css('left') : $this.position().left),
        y: parseInt($this.css('top') !== 'auto' ? $this.css('top') : $this.position().top),
        pageX: e.pageX,
        pageY: e.pageY
      },
      options: e.data.options,
      context: e.data.ctx
    };

    $this.on('mousemove', opts, _events.mousemove)
         .on('dragstart', function(e) { e.preventDefault(); })
         .on('mouseup', opts, _events.mouseup);
  };

  // calculates new coordinates
  _events.mousemove = function(e) {
    var edim = e.data.dimensions,
        opts = e.data.options,
        ctx = e.data.context,
        grid = opts.grid,
        moveX = edim.x + e.pageX - edim.pageX,
        moveY = edim.y + e.pageY - edim.pageY;

    if (opts.snap === true) {
      var snapX = grid.x * Math.round(moveX/grid.x),
          snapY = grid.y * Math.round(moveY/grid.y);

      $(this).trigger('drago.drag', { x: snapX, y: snapY, ctx: ctx });
    } else {
      $(this).trigger('drago.drag', { x: moveX, y: moveY, ctx: ctx });
    }
  };

  // preserves vertical rhythm and unbinds the mousemove event
  _events.mouseup = function(e, data) {
    var $this = $(this),
        opts = e.data.context.opts,
        grid = opts.grid,
        adjustY = opts.snap ? Math.round($this.offset().top/grid.y) * grid.y
                            : $this.offset().top;

    $(this).off('mousemove').offset({ top: adjustY });
  };


  Drago.prototype.events = _events;


  // disables user selection for draggable elements
  function userSelectHook () {
    var div = document.createElement('div'),
        divStyle = div.style;

    $.support.userSelect = divStyle.WebkitUserSelect === '' ? 'WebkitUserSelect' :
                           divStyle.MozUserSelect    === '' ? 'MozUserSelect'    :
                           divStyle.userSelect       === '' ? 'userSelect'       : false;

    if ($.support.userSelect && $.support.userSelect !== 'userSelect') {
      $.cssHooks.userSelect = {
        get: function(elem, computed, extra) {
          return $.css(elem, $.support.userSelect);
        },
        set: function(elem, value) {
          elem.style[$.support.userSelect] = value;
        }
      };
    }
  }


  !function _createBaseStyles() {
    var css = [
      '.drago, .drago a { color: #000; position: absolute; }',
      '.drago { background: #fff; border: 1px solid gray; padding: 9px; z-index: 1; font-family: monospace; }',
      '.drago a { display: inline; top: 2px; right: 5px; font-family: sans-serif; font-weight: bold; text-decoration: none; }',
      '.drago a:hover { cursor: pointer; color: red; }'
    ].join().replace(/\},/g, '} ');

    var style = document.createElement('style');
    style.type = 'text/css';
    style.textContent = css;
    $('head').append(style);
  }()


  $.fn.drago = function(options) {
    userSelectHook();

    options = $.extend({}, $.fn.drago.options, options);

    return this.each(function(i, val) {
      if (!$.data(this, 'plugin_drago')) { // prevent against multiple instantiations
        $.data(this, 'plugin_drago');
        new Drago(this, options);
      }
    });
  };


  // default options
  // ---------------
  //
  // grid: an object containing the number of pixels to move when snapping
  //       elements to a grid
  // snap: snap element to grid values?
  // resize: if set, allows element to be resized in addition to dragged
  $.fn.drago.options = {
    grid: { x: 20, y: 20 },
    snap: true,
    resize: true
  };

}))
