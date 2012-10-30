var FeedbackView = Backbone.View.extend({
  events: {
    'click': 'close'
  },

  initialize: function () {
    this.$el.hide()

    _(this).bindAll()
  },

  render: function () {
    this.cancelDelayedClose()
    this.show()
    this.closeDelayed()
  },

  show: function () {
    this.$el.slideDown()
  },

  close: function () {
    this.$el.slideUp()
    this.cancelDelayedClose()
    return false
  },

  delayedRender: function () {
    _(this.render).delay(200)
  },

  cancelDelayedClose: function () {
    if (this.closeTimeoutId) {
      clearTimeout(this.closeTimeoutId)
    }
  },

  closeDelayed: function () {
    this.closeTimeoutId = _(this.close).delay(10000)
  }
})
