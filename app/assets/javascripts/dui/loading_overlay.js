(function (window) {
  var $ = window.jQuery,
      _ = window._

  function LoadingOverlay(element, options) {
    this.$element = $(element).addClass('loading-overlay')
  }

  LoadingOverlay.prototype = {
    show: function () {
      this.$element.addClass('active-overlay')
    },

    hide: function () {
      this.$element.removeClass('active-overlay')
    }
  }

  window.LoadingOverlay = LoadingOverlay

  $.fn.loadingOverlay = function (method_or_options) {
    return $(this).each(function () {
      var loadingOverlay = $(this).data('loading-overlay') || new LoadingOverlay(this, method_or_options)

      if (method_or_options === 'show' || method_or_options === 'hide') {
        loadingOverlay[method_or_options].call(loadingOverlay)
      }

      $(this).data('loading-overlay', loadingOverlay)
    });
  };
})(window);
