/*jshint expr:true*/
$(function($){
describe("jquery.animatetimeline", function(){
  chai.should();
  beforeEach(function () {
    $('#temp').remove();
    $('body').append('<div id="temp" />');
  });

  it('Animates a simple slide with text', function (done) {
    this.timeout(3*1000);
    $('#temp').html(
      '<div id="slide">'+
      '<div class="bg"/>'+
      '<div class="tx"/>'+
      '</div>'
    );
    var elements = {
      'bg': '.bg',
      'tx': '.tx'
    };
    var timeline = [
      // Prep
      {start: 0,    el: 'el', props: {display: 'none'}},
      {start: 0,    el: 'bg', props: {left: '0px', opacity: 0}},
      {start: 0,    el: 'tx', props: {left: '0px', opacity: 0}},
      {start: 0,    el: 'el', props: {display: 'block'}},
      // Intro
      {start: 0,    el: 'bg', props: {left: '500px', opacity: 1}, duration: 2000},
      {start: 1000, el: 'tx', props: {left: '5500px', opacity: 1}, duration: 1000},
    ];
    $('#slide').animatetimeline(elements, timeline, function () {
      // all done
      $('#slide').css('display').should.equal('block');
      $('#slide .bg').css('opacity').should
        .equal('1');
      $('#slide .tx').css('opacity').should
        .equal('1');
      if (Modernizr.csstransitions && Modernizr.csstransforms3d) {
        $('#slide .bg').css('transition').should
          .contain('opacity').contain('transform')
          .match(/2s|2000ms/);
        $('#slide .tx').css('transition').should
          .contain('opacity').contain('transform')
          .match(/1s|1000ms/);
        // Sometimes we get fancy matrix conversion
        if ($('#slide .bg').css('transform').match(/matrix/)) {
          $('#slide .bg').css('transform').should
            .contain('matrix').contain('500');
          $('#slide .tx').css('transform').should
            .contain('matrix').contain('5500');
        } else {
          $('#slide .bg').css('transform').should
            .contain('translate').contain('500px');
          $('#slide .tx').css('transform').should
            .contain('translate').contain('5500px');
        }
      } else if (Modernizr.csstransitions) {
        $('#slide .tx').css('transition').should
          .contain('opacity').contain('left')
          .match(/1s|1000ms/);
        $('#slide .tx').css('left').should
          .equal('5500px');
      } else {
        $('#slide .tx').css('left').should
          .equal('5500px');
      }
      done();
    });
  });

  it('Animates a simple slide with text', function (done) {
    this.timeout(3*1000);
    $('#temp').html(
      '<div id="slide1" style="">'+
      '<div class="background"/>'+
      '<div class="text"/>'+
      '</div>'+
      '<div id="slide2">'+
      '<div class="background"/>'+
      '<div class="text"/>'+
      '</div>'
    );
    var elements = {
     'oldBack': $('#slide1 .background'),
     'newBack': $('#slide2 .background'),
     'oldText': $('#slide1 .text'),
     'newText': $('#slide2 .text')
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
    var animTimeline = $.animatetimeline(elements, timeline, function () {
     $('#slide1 .background').css('display').should.equal('none');
     $('#slide1 .background').css('opacity').should.equal('0');
     $('#slide1 .text').css('display').should.equal('none');
     $('#slide1 .text').css('opacity').should.equal('0');
     $('#slide2 .background').css('display').should.equal('block');
     $('#slide2 .background').css('opacity').should.equal('1');
     $('#slide2 .text').css('display').should.equal('block');
     $('#slide2 .text').css('opacity').should.equal('1');
     done();
    });
    animTimeline.getDuration().should.equal(2060);
  });

});
});