// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//
//= require common_components/feedback_view
//= require common_components/confirmable_view
//= require common_components/loading_overlay
//= require common_components/movable
//= require common_components/searchable_field
//= require common_components/multi_select/multi_select_view

$(function () {
  window.feedbackView = new FeedbackView({ el: $('.feedback') })
  window.feedbackView.delayedRender()
})
