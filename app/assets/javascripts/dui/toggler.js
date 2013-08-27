(function () {
  $.fn.toggler = function () {
    return $(this).each(function () {
      var $toggler = $(this)

      $toggler.click(function () {
        var selector = $toggler.data('toggler')
        $(selector).toggleClass('toggler-hide').trigger('toggled')
        return false
      })
    })
  }
})()
