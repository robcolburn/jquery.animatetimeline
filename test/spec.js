/*jshint expr:true*/
$(function($){
var transform = $.animatetimeline.prefixed('transform');
var transition = $.animatetimeline.prefixed('transition');
describe("jquery.animatetimeline", function(){
  chai.should();
  beforeEach(function () {
    $('body').append('<div id="temp" />');
  });
  afterEach(function () {
    $('#temp').remove();
  });

  it('Animates a simple slide', function (done) {
    this.timeout(3*1000);
    $('#temp').html(
      '<div id="parent" style="position: absolute;top:0;left:0;width:100%;height:300px">'+
      '<div id="slide" style="position: absolute;top:0;left:0;width:100%;height:300px">'+
      '<div class="background" style="background:red;position:relative;height:100%;width:100%"/>'+
      '<div class="text" style="color:white;position:absolute;top:50px;left:50px">'+
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry</div>'+
      '</div>'+
      '</div>'
    );
    var elements = {
      'bg': '.background',
      'tx': '.text'
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
      $('#slide').css('display')
        .should.equal('block');
      $('#slide .background').attr('style')
        .should.contain('opacity: 1');
      $('#slide .text').attr('style')
        .should.contain('opacity: 1');

      if (transition && transform) {
        $('#slide .background').attr('style')
          .should.match(/transition[^;]+opacity/)
          .and.match(/transition[^;]+(2s|2000ms)/);
        $('#slide .text').attr('style')
          .should.match(/transition[^;]+opacity/)
          .and.match(/transition[^;]+(1s|1000ms)/);
        // Sometimes we get fancy matrix conversion
        if ($('#slide .background').css('transform').match(/matrix/)) {
          $('#slide .background').css('transform')
            .should.contain('matrix')
            .and.contain('500');
          $('#slide .text').css('transform')
            .should.contain('matrix')
            .and.contain('5500');
        } else {
          $('#slide .background').css('transform')
            .should.contain('translate')
            .and.contain('500px');
          $('#slide .text').css('transform')
            .should.contain('translate')
            .and.contain('5500px');
        }
      } else if (transition) {
        $('#slide .text').attr('style')
          .should.match(/transition[^;]+opacity/)
          .and.match(/transition[^;]+(1s|1000ms)/)
          .and.contain('left: 5500px');
      } else {
        $('#slide .text').attr('style')
          .should.contain('left: 5500px');
      }
      done();
    });
  });

  it('Animates a slide with text', function (done) {
    this.timeout(3*1000);
    $('#temp').html(
      '<div id="parent" style="position: absolute;top:0;left:0;width:100%;height:300px">'+
      '<div id="slide1" style="position: absolute;top:0;left:0;width:100%;height:300px">'+
      '<div class="background" style="background:red;position:relative;height:100%;width:100%"/>'+
      '<div class="text" style="color:white;position:absolute;top:50px;left:50px">'+
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry</div>'+
      '</div>'+
      '<div id="slide2" style="position: absolute;top:0;left:0;width:100%;height:300px">'+
      '<div class="background" style="background:blue;position:relative;height:100%;width:100%;display:none"/>'+
      '<div class="text" style="color:white;position:absolute;top:50px;left:50px;display:none">'+
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry</div>'+
      '</div>'
    );
    var elements = {
     'oldBack': $('#slide1 .background'),
     'oldText': $('#slide1 .text'),
     'newBack': $('#slide2 .background'),
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
      $('#slide1 .background').attr('style')
        .should.contain('display: none')
        .and.contain('opacity: 0');
      $('#slide1 .background').attr('style')
        .should.contain('display: none')
        .and.contain('opacity: 0');
      $('#slide1 .text').attr('style')
        .should.contain('display: none')
        .and.contain('opacity: 0');
      $('#slide2 .background').attr('style')
        .should.contain('display: block')
        .and.contain('opacity: 1');
      $('#slide2 .text').attr('style')
        .should.contain('display: block')
        .and.contain('opacity: 1');
      done();
    });
    animTimeline.getDuration().should.equal(2060);
  });

});
});