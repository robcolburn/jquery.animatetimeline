/**
 * jquery.animatetimeline
 * Provides the ability to animate a declaritive animation timeline.
 *
 * To minify:
 *   uglifyjs jquery.animatetimeline.js -mc -o jquery.animatetimeline.min.js
 *
 * @example With parent element
  var elements = {
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
  $('#slide1').animatetimeline(elements, timeline, function () {
    // all done
  });
 *
 * @example w/o Parent element
 *  
  var elements = {
   'newBg': $('#slide1 .background'),
   'oldBg': $('#slide2 .background'),
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
 $.animatetimeline(elements, timeline, function () {
   // all done
 });
*/
(function ($) {
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
    // Support jQuery-style multi-element application
    if (this.length > 1) {
      return this.each(function () {
        $(this).animatetimeline(elements, timeline, callback);
      });
    }
    // Support direct calling of child methods via string.
    if (arguments.length === 1 && typeof elements === 'string') {
      var instance = this.data('animatetimeline');
      var args = Array.prototype.slice.call(arguments, 1);
      if (instance) {
        return instance[elements].apply(instance, args);
      }
    }
    // Support optional elements parameter.
    if (arguments.length === 1 ||
      (arguments.length === 2 && typeof timeline === 'function')
    ) {
      callback = arguments[1];
      timeline = arguments[0];
      elements = {};
    }
    for (var key in elements) {
      // Support passing elements as jQuery objects.
      if (!elements[key] || !elements[key].jquery) {
        continue;
      }
      // Support passing elements as child selectors.
      elements[key] = this.find(elements[key]);
    }
    // Support a default element corresponding to this node.
    if (!elements.el) {
      elements.el = this;
    }
    // Store the instance for direct access.
    this.data('animatetimeline', new AnimationTimeline(elements, timeline, callback));
    return this;
  };

  /**
   * A simpler static version $.fn.animate w/ Transitions & Transforms support
   * 
   * @param {object<css property: css value>} props
   *   CSS properties to apply.
   * @param {integer} duration
   *   Milliseconds of duration of animation.
   * @param {string} easing (optional)
   *   Easing function to use. Default: 'easeOutQuad'.
   * @return this
   */
  $.fn.animatetimeline_animate = function (props, duration, easing) {
    return this.each(function () {
      animate(this, props, duration, easing);
    });
  };

  /**
   * Apply CSS transition property(ies) to an element.
   *
   * @param {object|string} props
   *   Key/value of CSS properties to duration and easing properties.
   *   Or, CSS property to transition.
   * @param {[string, string]} duration_easing
   *   Unused if props is an object
   *   If null/undefined, unsets the transition
   *   Number of milliseconds transition should last.
   *   Key to easing function in CSS_EASING, defaults to ease-in-out.
   * @return this
   */
  $.fn.animatetimeline_transition = function (props, duration, easing) {
    return this.each(function () {
      transition(this, props, duration, easing);
    });
  };

  // Export Classes globally for possible extension.
  $.animatetimeline = AnimationTimeline;
  AnimationTimeline.Frame = AnimationFrame;
  AnimationTimeline.Step = AnimationStep;
  // Export Utility Functions globaly for possible extension.
  AnimationTimeline.animate = animate;
  AnimationTimeline.stopAnimate = stopAnimate;
  AnimationTimeline.transition = transition;
  // Export Constants for lookups
  AnimationTimeline.CSS_EASING = CSS_EASING;
  AnimationTimeline.BUFFER = 60;

  /**
   * Animates a timeline of steps.
   *
   * Data Structure:
   * Timeline < startTime : Frame < Step[] > >
   * A Timeline contains a map of Frames, such that the keys are
   * start-times relative to the animation as a whole.
   * A Frame contains an array of Steps, that will execute at a
   * specifc start-time.
   * A Step contains a specific set of instructions to apply to a
   * single element.
   *
   * @constructor
   * @param {object<string:jQuery selector>} elements
   *   Optional. Map of string names to jQuery objects or selectors
   *   skips to timeline if not specified.
   * @param {object[]} timeline
   *   Required. Array of timeline steps, see animate() for details
   *   - el: jQuery object | (string) elements key
   * @param {function} callback
   *   Called when last timeline step has completed
   * @return this
   */
  function AnimationTimeline (elements, timeline, callback) {
    if ( ! (this instanceof AnimationTimeline) ) {
      return new AnimationTimeline(elements, timeline, callback);
    }
    this.frames = {};
    this.duration = 0;
    this.timeout = null;
    var $element;
    for (var i = 0, l = timeline.length; i < l; i++) {
      // Support jQuery objects, jQuery elements keys, selector elements keys.
      $element = null;
      if (timeline[i].el.jquery) {
        $element = timeline[i].el;
      } else if (elements[timeline[i].el] && elements[timeline[i].el].jquery) {
        $element = elements[timeline[i].el];
      } else if (elements[timeline[i].el]) {
        $element = $(elements[timeline[i].el]);
      }
      // Do not waste time on invalids.
      if (!$element) {
        throw new Error('Invalid element ' + i + ':' + timeline[i].el);
      }
      this.push(new AnimationStep($element.get(0), timeline[i]));
    }
    if (callback) {
      this.timeout = setTimeout(callback, this.getDuration() + AnimationTimeline.BUFFER);
    }
    this.play();
  }
  /**
   * Start the timeline animation.
   */
  AnimationTimeline.prototype.play = function () {
    var timeouts = [];
    for (var startTime in this.frames) {
      this.frames[startTime].play();
    }
  };
  /**
   * Stop the timeline animation.
   */
  AnimationTimeline.prototype.stop = function () {
    for (var startTime in this.frames) {
      this.frames[startTime].stop();
    }
    if (this.timeout !== null) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  };
  /**
   * Add a step to the timeline.
   *
   * @param {AnimationStep} animationStep
   *   The step of animation to add to this timeline.
   */
  AnimationTimeline.prototype.push = function (animationStep) {
    if (!this.frames[animationStep.start]) {
      this.frames[animationStep.start] = new AnimationFrame(animationStep.start);
    }
    this.frames[animationStep.start].push(animationStep);
  };
  /**
   * Get the duration of the entire timeline.
   */
  AnimationTimeline.prototype.getDuration = function () {
    var duration = 0;
    for (var startTime in this.frames) {
      duration = Math.max(duration, this.frames[startTime].getTotalTime());
    }
    return duration;
  };

  /**
   * A frame of animation.
   *
   * Contains an array of all instructions to execture.
   * @param {}
   */
  function AnimationFrame (start) {
    this.steps = [];
    this.start = start;
    this.delayTimeout = null;
    this.runTimeout = null;
    this.isRunning = false;
  }
  /**
   * Add a step to this animation frame.
   */
  AnimationFrame.prototype.push = function (step) {
    this.steps.push(step);
  };
  /**
   * Queue Animations of this frame to start time.
   */
  AnimationFrame.prototype.play = function () {
    var self = this;
    this.delayTimeout = setTimeout(function () {
      self.run();
      self.delayTimeout = null;
    }, this.start);
  };
  /**
   * Stop animations and enqueued animations of this frame.
   */
  AnimationFrame.prototype.stop = function () {
    if (this.delayTimeout !== null) {
      clearTimeout(this.delayTimeout);
      this.delayTimeout = null;
    }
    if (this.runTimeout !== null) {
      clearTimeout(this.runTimeout);
      this.runTimeout = null;
    }
    if (this.isRunning) {
      for (var i = 0, l = this.steps.length; i < l; i++) {
        this.steps[i].stop();
      }
      this.isRunning = false;
    }
  };
  /**
   * Play animations attached to this animation frame.
   */
  AnimationFrame.prototype.run = function () {
    var self = this;
    for (var i = 0, l = this.steps.length; i < l; i++) {
      this.steps[i].run();
    }
    this.isRunning = true;
    this.runTimeout = setTimeout(function () {
      self.isRunning = false;
      self.runTimeout = null;
    });
  };
  /**
   * Get the duration of this frame of animation.
   */
  AnimationFrame.prototype.getDuration = function () {
    var duration = 0;
    for (var i = 0, l = this.steps.length; i < l; i++) {
      duration = Math.max(duration, this.steps[i].duration || 0);
    }
    return duration;
  };
  /**
   * Get the total time of this frame of animation,
   * considering delayed start time.
   */
  AnimationFrame.prototype.getTotalTime = function () {
    return this.start + this.getDuration();
  };

  /**
   * Represents a single animation step.
   * @constructor
   * @param {DOMElement} element
   *   The element to be animated.
   * @param {object} step
   *   How to animate the element.
   *   {integer} start: milliseconds of delay before animation start
   *   {object<css property: css value>} props : css properties to apply.
   *   {integer} duration (optional) milliseconds of duration of animation.
   *   {string} easing (optional) easing function to use.
   */
  function AnimationStep (element, step) {
    this.element = element;
    this.start = step.start;
    this.duration = step.duration;
    this.props = step.props;
    this.easing = step.easing;
    if (!this.element) {
      throw new Error('Invalid Step');
    }
  }
  AnimationStep.prototype.run = function () {
    animate(this.element, this.props, this.duration, this.easing);
  };
  AnimationStep.prototype.stop = function () {
    stopAnimate(this.element, this.props);
  };

  // Vender prefix constants
  var JS_TRANSFORM = prefixed('transform');
  var JS_TRANSITION = prefixed('transition');
  var CSS_TRANSFORM = cssProp(JS_TRANSFORM);

  /**
   * A simpler static version $.fn.animate w/ Transitions & Transforms support
   *
   * @param {DOMElement} element
   *   Element to be animated
   * @param {object<css property: css value>} props
   *   CSS properties to apply.
   * @param {integer} duration
   *   Milliseconds of duration of animation.
   * @param {string} easing (optional)
   *   Easing function to use. Default: 'easeOutQuad'.
   */
  function animate (element, props, duration, easing) {
    if (JS_TRANSITION) {
      if (JS_TRANSFORM) {
        props = mapTransformProps(props);
      }
      transition(element, keys(props), duration, easing);
      for (var prop in props) {
        element.style[prop] = props[prop];
      }
    } else {
      if (duration) {
        $(element).animate(props, {duration: duration, easing: easing || 'easeOutQuad', queue: 'animatetimeline'});
      } else {
        $(element).css(props);
      }
    }
    if (props.display === 'block') {
      // Force reflow.
      $.noop($(element).offset().left);
    }
  }

  /**
   * The corresponding $.fn.stop to the animate function.
   *
   * @param {jQuery} $el
   *   Element to cease animations on.
   */
  function stopAnimate ($el) {
    if (JS_TRANSITION) {
      clearTransitions($el.get(0), props);
    } else {
      $el.stop('animatetimeline', true, true);
    }
  }

  /**
   * Apply CSS transition property(ies) to an element.
   *
   * @param {DOMElement} element
   *   Raw DOM ELement to apply transition to.
   * @param {object|string} props
   *   Key/value of CSS properties to duration and easing properties.
   *   Or, CSS property to transition.
   * @param {[string, string]} duration_easing
   *   Unused if props is an object
   *   If null/undefined, unsets the transition
   *   Number of milliseconds transition should last.
   *   Key to easing function in CSS_EASING, defaults to ease-in-out.
   * @return {object}
   *   Kay/value map of current transitions.
   */
  function transition (element, props, duration, easing) {
    var transitions = $.data(element, 'transitions.animatetimeline') || {};
    if (arguments.length === 2 && typeof props === 'string') {
      return transition[prop];
    } else if (!props) {
      transitions = {};
    } else {
      props = (typeof props === 'string') ? [props] : props;
      $.map(props, function (prop) {
        transitions[prop] = !duration ? null : (
          (prop === JS_TRANSFORM ? CSS_TRANSFORM : prop) + ' ' +
          duration + 'ms ' +
          (CSS_EASING[easing] ? 'cubic-bezier(' + CSS_EASING[easing] + ')' : 'ease-in-out')
        );
      });
    }
    element.style[JS_TRANSITION] = values(transitions).join(',');
    $.data(element, 'transitions.animatetimeline', transitions);
    return transitions;
  }

  /**
   * Replaces position props for corresponding Transform props.
   *
   * @param {object} props
   *   CSS Properties to be translated.
   * @return {object}
   *   Translated CSS Properties.
   */
  function mapTransformProps (props) {
    var mapped = {};
    for (var name in props) {
      if (name !== 'left' && name !== 'top') {
        mapped[name] = props[name];
      }
    }
    if (props.left && props.top) {
      props.left = props.left;
      props.top = props.top;
      mapped[JS_TRANSFORM] = 'translate(' + props.left + ',' + props.top + ')';
    }
    else if (props.left) {
      mapped[JS_TRANSFORM] = 'translateX(' + props.left + ')';
    }
    else if (props.top) {
      mapped[JS_TRANSFORM] = 'translateY(' + props.left + ')';
    }
    return mapped;
  }

  /**
   * Get the prefixed JS Style prop for a given css prop.
   * @param {string} cssProp
   *   Common name for the css property
   * @return {string}
   *   Prefixed property for JS DOM
   */
  function prefixed (cssProp) {
    try {
      var el = document.createElement('div');
      if (typeof el.style[cssProp] !== 'undefined') {
        return cssProp;
      }
      cssProp = cssProp.charAt(0).toUpperCase() + cssProp.slice(1);
      var prefixes = ['webkit', 'Moz', 'ms', 'O'];
      for (var i = 0; i < prefixes.length; i++) {
        if (typeof el.style[prefixes[i] + cssProp] !== 'undefined') {
          return prefixes[i] + cssProp;
        }
      }
    } catch (e) { }
    return '';
  }

  /*
   * Returns a css prop from a js-dom prop name
   * Thanks Modernizer! http://modernizr.com/docs/#prefixed
   * @param {string} jsProp
   *   Prefixed property for JS DOM
   * @return {string}
   *   Prefixed propery for CSS
   */
  function cssProp (jsProp) {
    return jsProp && '-' + jsProp.replace(/([A-Z])/g, function(str,m1){
      return '-' + m1.toLowerCase();
    });
  }

  /**
   * Return the keys of a generic object.
   *
   * @param {object} obj
   *   Generic object to convert.
   * @return {array}
   *   Of keys from object.
   */
  var keys = Object.keys || function (obj) {
    var arr = [];
    for (var key in obj) {
      arr.push(key);
    }
    return arr;
  };

  /**
   * Return the values of a generic object.
   *   Without falsey values
   *
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
   * @link http://www.robertpenner.com/easing/
   * @link http://matthewlein.com/ceaser/
   */
  var CSS_EASING = {
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

})(jQuery);