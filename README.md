jquery.animatetimeline
======================

Provides the ability to animate a declaritive animation timeline

Example w/ Parent Element
-------
```js
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
});
```

Example w/o Parent element
-------
```js
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
$.animatetimeline(elements, timeline, function () {
 // all done
});
```
