(function (window, navigator) {
  var $ = window.jQuery,
      useEffects   = (navigator.appName !== 'Microsoft Internet Explorer')

  function LoadingOverlay(element) {
    this.$element = $(element)
    this.$overlayElement = $('<div class="loading-overlay"><div class="loading"></div></div>').hide()
    this.$element.parent().append(this.$overlayElement)

    this.fadeDuration = useEffects ? LoadingOverlay.fadeDuration : 0
  }

  LoadingOverlay.prototype = {
    show: function () {
      var position = this.$element.position()

      this.$overlayElement.width(this.$element.width())
                          .height(this.$element.height())
                          .css('top', position.top)
                          .css('left', position.left)
                          .fadeIn(this.fadeDuration)
    },

    hide: function () {
      this.$overlayElement.fadeOut(this.fadeDuration)
    }
  }

  window.LoadingOverlay = LoadingOverlay

  $.fn.loadingOverlay = function (method) {
    return $(this).each(function () {
      var loadingOverlay = $(this).data('loading-overlay') || new LoadingOverlay(this)

      if (method === 'show' || method === 'hide') {
        loadingOverlay[method].call(loadingOverlay)
      }

      $(this).data('loading-overlay', loadingOverlay)
    });
  };
})(window, navigator);