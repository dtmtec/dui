$(function () {
  window.uploaderViews = []

  $('.uploader').each(function () {
    window.uploaderViews.push(new UploaderView({
      el: this
    }))
  })

  $('.listing-container').each(function () {
    window.listingView = new ListingView({
      el: this,
      paginationContainerEl: $('.pagination-container'),
      searchEl: $('input[name=search]')
    })
  })
})
