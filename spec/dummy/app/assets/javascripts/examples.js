$(function () {
  $('.uploader').each(function () {
    window.uploaderView = new UploaderView({
      el: this
    })
  })
})
