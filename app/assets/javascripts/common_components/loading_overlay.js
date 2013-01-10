(function (window, navigator) {
  var $ = window.jQuery,
      _ = window._,
      useEffects   = (navigator.appName !== 'Microsoft Internet Explorer')

  function LoadingOverlay(element, options) {
    this.$element = $(element)
    this.options = _(options).isObject() ? options : {}
    this.$overlayElement = $('<div class="loading-overlay"><div class="loading"></div></div>').hide()
    this.$element.parent().append(this.$overlayElement)

    this.fadeDuration = useEffects ? LoadingOverlay.fadeDuration : 0

    $(window).resize(_(this.resize).bind(this))
  }

  LoadingOverlay.prototype = {
    show: function () {
      this.resize()
      this.$overlayElement.fadeIn(this.fadeDuration)
    },

    hide: function () {
      this.$overlayElement.fadeOut(this.fadeDuration)
    },

    resize: function () {
      if (this.options.fixed) {
        this._resizeToBeFixed()
      } else {
        this._resizeToFitContainer()
      }
    },

    _resizeToBeFixed: function () {
      var $window = $(window)

      this.$overlayElement.width($window.width())
                          .height($window.height())
                          .css('top', 0)
                          .css('left', 0)
                          .addClass('fixed-overlay')
    },

    _resizeToFitContainer: function () {
      var position = this.$element.position()

      this.$overlayElement.width(this.$element.width())
                          .height(this.$element.height())
                          .css('top', position.top)
                          .css('left', position.left)
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
})(window, navigator);