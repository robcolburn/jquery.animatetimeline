/*jshint expr:true*/
$(function($){
$('body').append('<div id="temp" />');
describe("jquery.animatetimeline", function(){
  afterEach(function () {
    $('#temp').empty();
  });

  it('Animates a simple slide with text', function (done) {
    this.timeout(2100);
    $('#temp').html(
      '<div id="slide">'+
      '<div class="background"/>'+
      '<div class="text"/>'+
      '</div>'
    );
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
    $('#slide').animatetimeline(elements, timeline, function () {
      // all done
      done();
    });
  });

  it('Animates a simple slide with text', function (done) {
    this.timeout(2100);
    $('#temp').html(
      '<div id="slide1">'+
      '<div class="background"/>'+
      '<div class="text"/>'+
      '</div>'+
      '<div id="slide2">'+
      '<div class="background"/>'+
      '<div class="text"/>'+
      '</div>'
    );
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
     done();
    });
  });

});
});