$(function () {
  window.uploaderViews = []

  $('.uploader').each(function () {
    window.uploaderViews.push(new UploaderView({
      el: this
    }))
  })
})
