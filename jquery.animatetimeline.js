/**
 * jQuery.animatetimeline
 * Library provides the ability to animate a declaritive animation timeline
 *
 * To minify:
 *   uglifyjs jquery.animatetimeline.js -mc -o jquery.animatetimeline.min.js
 *
 * @example With parent element
  var elements: {
    'bg': '.background',
    'tx': '.text'
  };
  var timeline = [
    // Prep
    {start: 0,    el: 'el', props: {display: 'none'}},
    {start: 0,    el: 'bg', props: {left: 600, opacity: 0}},
    {start: 0,    el: 'tx', props: {left: 30, opacity: 0}},
    {start: 0,    el: 'el', props: {display: 'block'}},
    // Intro
    {start: 0,    el: 'bg', props: {left: 0, opacity: 1}, duration: 2000},
    {start: 1000, el: 'tx', props: {left: 0, opacity: 1}, duration: 1000},
  ];
  $('#slide1').animateTimeline(elements, timeline, function () {
    // all done
  });
 *
 * @example w/o Parent element
 *  
  var elements = {
   'newBg': $('#slide1 .bg'),
   'oldBg': $('#slide2 .bg'),
   'newText': $('#slide1 .text'),
   'oldText': $('#slide2 .text')
  };
  // This transition requires two elements name "new" and "old"
  var timeline = [
    // Preperation
    {start: 0, el: 'newBack', props: {left: '600px', opacity: 0, zIndex: 5}},
    {start: 0, el: 'newText', props: {left: '-15px', opacity: 0, zIndex: 10}},
    {start: 0, el: 'oldBack', props: {left: '0px', opacity: 1, zIndex: 7}},
    {start: 0, el: 'oldText', props: {left: '0px', opacity: 1, zIndex: 11}},
    {start: 0, el: 'newBack', props: {display: 'block'}},
    {start: 0, el: 'newText', props: {display: 'block'}},
    // Start moving backgrounds and old text
    {start: 0, el: 'newBack', props: {left: '0px', opacity: 1}, duration: 2000},
    {start: 0, el: 'oldBack', props: {left: '-600px', opacity: 0}, duration: 2000},
    {start: 0, el: 'oldText', props: {left: '15px', opacity: 0}, duration: 1000},
    // Slide In new Text
    {start: 1000, el: 'newText', props: {left: '0px', opacity: 1}, duration: 1000},
    // Clean-up old Text
    {start: 1060, el: 'oldText', props: {display: 'none'}},
    // Clean-up old BG
    {start: 2060, el: 'oldBack', props: {zIndex: 5, display: 'none'}}
 ];
 $.animateTimeline(elements, timeline, function () {
   // all done
 });
*/
/*global Modernizr*/
(function ($, Modernizr) {
  /**
   * Starts animating a timeline of steps
   *
   * @param {object<string:jQuery>} elements
   *   Optional. Map of string names to jQuery objects
   *   skips to timeline if not specified.
   * @param {object[]} timeline
   *   Required. Array of timeline steps, see animate() for details
   * @param {function} callback
   *   Called when last timeline step has completed
   * @return this
   */
  $.fn.animatetimeline = function (elements, timeline, callback) {
    if (this.length > 1) {
      return this.each(function () {
        $(this).animatetimeline(elements, timeline, callback);
      });
    }
    if (arguments.length === 1 ||
      (arguments.length === 2 && typeof timeline === 'function')
    ) {
      callback = arguments[1];
      timeline = arguments[0];
      elements = {};
    }
    for (var key in elements) {
      elements[key] = this.find(elements[key]);
    }
    elements.el = this;
    animateTimeline(elements, timeline, callback);
    return this;
  };

  /**
   * Starts animating a timeline of steps
   *
   * @param {object<string:jQuery>} elements
   *   Optional. Map of string names to jQuery objects
   *   skips to timeline if not specified.
   * @param {object[]} timeline
   *   Required. Array of timeline steps, see animate() for details
   * @param {function} callback
   *   Called when last timeline step has completed
   * @return this
   */
  $.animatetimeline = function animateTimeline (elements, timeline, callback) {
    var step;
    var i;
    var frames = {};
    var totalDuration = 0;
    for (i in timeline) {
      step = timeline[i];
      step.$el = elements[step.el];
      if (!frames[step.start]) {
        frames[step.start] = [step];
      } else {
        frames[step.start].push(step);
      }
      if (step.duration && step.duration + step.start > totalDuration) {
        totalDuration = step.duration + step.start;
      }
    }
    for (var startTime in frames) {
      setTimeout(getKeyframe(frames[startTime]), startTime);
    }
    if (callback) {
      setTimeout(callback, totalDuration);
    }
  };

  /**
   * Apply a set of CSS transition properties.
   *
   * @param {DOMElement}
   *   Raw DOM ELement to apply transtion to.
   * @param {object} props
   *   Key/value map of CSS properties to transtion.
   * @param {int} duration
   *   Number of milliseconds transtion should last.
   * @param {string} easing
   *   CSS3 Easing formula to apply, or key in css_easing.
   * @return {object}
   *   Kay/value map of current transitions.
   */
  $.animatetimeline.addTransitions = function addTransitions (element, props, duration, easing) {
    var transitions = $.data(element, 'transitions.animatetimeline') || {};
    for (var prop in props) {
      if (prop === JS_TRANSFORM) {
        prop = CSS_TRANSFORM;
      }
      transitions[prop] = prop + ' ' + duration + 'ms cubic-bezier(' + (css_easing[easing] || css_easing.ease) + ')';
    }
    element.style[JS_TRANSITION] = values(transitions).join(',');
    $.data(element, 'transitions.animatetimeline', transitions);
    return transitions;
  };

  /**
   * Apply a single CSS transition property.
   *
   * @param {DOMElement}
   *   Raw DOM ELement to apply transtion to.
   * @param {string} prop
   *   CSS property to transition.
   * @param {int} duration
   *   Number of milliseconds transtion should last.
   * @param {string} easing
   *   CSS3 Easing formula to apply, or key in css_easing.
   * @return {object}
   *   Kay/value map of current transitions.
   */
  $.animatetimeline.addTransition = function addTransition (element, prop, duration, easing) {
    var transitions = $.data(element, 'transitions.animatetimeline') || {};
    if (prop === JS_TRANSFORM) {
      prop = CSS_TRANSFORM;
    }
    transitions[prop] = prop + ' ' + duration + 'ms cubic-bezier(' + (css_easing[easing] || css_easing.ease) + ')';
    element.style[JS_TRANSITION] = values(transitions).join(',');
    $.data(element, 'transitions.animatetimeline', transitions);
    return transitions;
  };

  /**
   * Remove a set of CSS transition properties.
   *
   * @param {DOMElement}
   *   Raw DOM ELement to apply transtion to.
   * @param {object} props
   *   Key/value map of CSS properties to un-transtion.
   * @return {object}
   *   Kay/value map of current transitions.
   */
  $.animatetimeline.removeTransitions = function removeTransitions (element, props) {
    var transitions = $.data(element, 'transitions.animatetimeline') || {};
    for (var prop in props) {
      if (prop === JS_TRANSFORM) {
        prop = CSS_TRANSFORM;
      }
      transitions[prop] = null;
    }
    element.style[JS_TRANSITION] = values(transitions).join(',');
    $.data(element, 'transitions.animatetimeline', transitions);
    return transitions;
  };

  /**
   * Remove a single CSS transition properties.
   *
   * @param {DOMElement}
   *   Raw DOM ELement to apply transtion to.
   * @param {string} prop
   *   CSS property to un-transition
   * @return {object}
   *   Kay/value map of current transitions.
   */
  $.animatetimeline.removeTransition = function addTransition (element, prop, duration, easing) {
    var transitions = $.data(element, 'transitions.animatetimeline') || {};
    transitions[prop] = null;
    element.style[JS_TRANSITION] = values(transitions).join(',');
    $.data(element, 'transitions.animatetimeline', transitions);
    return transitions;
  };

  // Vender prefix constants
  var JS_TRANSFORM = Modernizr.prefixed('transform');
  var JS_TRANSITION = Modernizr.prefixed('transition');
  var CSS_TRANSFORM = cssProp(JS_TRANSFORM);

  /*
   * Wrapper for making keyframe callbacks
   * @param {Object[]} set of animation steps to apply
   */
  function getKeyframe (steps) {
    return function () {
      for (var i = 0, l = steps.length; i < l; i++) {
        animate(steps[i].$el, steps[i].name, steps[i].props, steps[i].duration, steps[i].easing);
      }
    };
  }

  /*
   * A simpler static version $.fn.animate w/ Transitions & Transforms support
   * 
   * @param {jQuery} $el element to be animated
   * @param {string} name element to be animated (just for debugging)
   * @param {Map} props : css properties to apply
   * @param {Integer} duration (optional) amout of time to animate
   * @param {String} easing (optional) easing function to use 
   * @requires Modernizr
   */
  function animate ($el, name, props, duration, easing) {
    easing = easing || 'easeOutQuad';
    if (Modernizr.csstransitions && Modernizr.csstransforms3d) {
      props = getPropsForCSS3(props);
      if (duration) {
        addTransitions($el.get(0), props, duration, easing);
        $el.css(props);
      } else {
        removeTransitions($el.get(0), props);
        $el.css(props);
      }
    } else {
      props = getPropsForAnimate(props);
      if (duration) {
        $el.animate(props, duration, easing);
      } else {
        $el.css(props);
      }
    }
    if (props.display === 'block') {
      $el.offset().left; // force reflow
    }
  }

  /**
   * Applies any specific prop translates for CSS3
   *
   * @param {object} props
   *   CSS Properties to be translated
   * @return {object}
   *   Translated CSS Properties
   */
  function getPropsForCSS3 (props) {
    var mapped = {};
    for (var name in props) {
      if (name !== 'left' && name !== 'top') {
        mapped[name] = props[name];
      }
    }
    if (props.left || props.top) {
      props.left = props.left || '0px';
      props.top = props.top || '0px';
      mapped[JS_TRANSFORM] = 'translate(' + props.left + ',' + props.top + ')';
    }
    return mapped;
  }

  /**
   * Applies any specific prop translates for jQuery.animate
   *
   * @param {object} props
   *   CSS Properties to be translated
   * @return {object}
   *   Translated CSS Properties
   */
  function getPropsForAnimate (props) {
    var mapped = {};
    for (var name in props) {
      mapped[name] = props[name];
    }
    return mapped;
  }

  /*
   * Returns a css prop from a js-dom prop name
   * Thanks Modernizer! http://modernizr.com/docs/#prefixed
   */
  function cssProp (jsProp) {
    return jsProp && jsProp.replace(/([A-Z])/g, function(str,m1){
      return '-' + m1.toLowerCase();
    }).replace(/^ms-/,'-ms-');
  }

  /**
   * Return the values of a generic object.
   * @param {object} obj
   *   Generic object to convert.
   * @return {array}
   *   Of keys from object.
   */
  function values (obj) {
    var arr = [];
    for (var key in obj) {
      if (obj[key]) {
        arr.push(obj[key]);
      }
    }
    return arr;
  }

  /**
   * Easing funcitons for CSS3
   *
   * Penner's equations
   * http://www.robertpenner.com/easing/ | http://matthewlein.com/ceaser/
   */
  var css_easing = {
    ease: '0.250, 0.100, 0.250, 1.000',
    easeInQuad: '0.550, 0.085, 0.680, 0.530',
    easeInCubic: '0.550, 0.055, 0.675, 0.190',
    easeInQuart: '0.895, 0.030, 0.685, 0.220',
    easeInQuint: '0.755, 0.050, 0.855, 0.060',
    easeInSine: '0.470, 0.000, 0.745, 0.715',
    easeInExpo: '0.950, 0.050, 0.795, 0.035',
    easeInCirc: '0.600, 0.040, 0.980, 0.335',
    easeInBack: '0.600, -0.280, 0.735, 0.045',

    easeOutQuad: '0.250, 0.460, 0.450, 0.940',
    easeOutCubic: '0.215, 0.610, 0.355, 1.000',
    easeOutQuart: '0.165, 0.840, 0.440, 1.000',
    easeOutQuint: '0.230, 1.000, 0.320, 1.000',
    easeOutSine: '0.390, 0.575, 0.565, 1.000',
    easeOutExpo: '0.190, 1.000, 0.220, 1.000',
    easeOutCirc: '0.075, 0.820, 0.165, 1.000',
    easeOutBack: '0.175, 0.885, 0.320, 1.275',

    easeInOutQuad: '0.455, 0.030, 0.515, 0.955',
    easeInOutCubic: '0.645, 0.045, 0.355, 1.000',
    easeInOutQuart: '0.770, 0.000, 0.175, 1.000',
    easeInOutQuint: '0.860, 0.000, 0.070, 1.000',
    easeInOutSine: '0.445, 0.050, 0.550, 0.950',
    easeInOutExpo: '1.000, 0.000, 0.000, 1.000',
    easeInOutCirc: '0.785, 0.135, 0.150, 0.860',
    easeInOutBack: '0.680, -0.550, 0.265, 1.550'
  };

})(jQuery, Modernizr);