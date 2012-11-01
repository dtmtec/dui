var FeedbackView = Backbone.View.extend({
  _queue: [],

  events: {
    'click': 'close'
  },

  initialize: function () {
    this.$el.hide()
    this.$template = this.$('script')
    this.$content  = this.$('.feedback-content')

    _(this).bindAll()
  },

  render: function (message, message_type) {
    this._cancelDelayedClose()
    this.show(message, message_type)
    this._delayedClose()
  },

  queue: function (message, message_type) {
    this._queue.push({message: message, message_type: message_type})

    this._cancelDelayedClose()
    this._delayedClose(2000) // reducing delayed close so that the queued message is displayed faster
  },

  show: function (message, message_type) {
    if (message) {
      this._updateFeedback(message, message_type)
    }

    this.$el.slideDown()
  },

  close: function () {
    this.$el.slideUp()
    this._cancelDelayedClose()

    if (!_(this._queue).isEmpty()) {
      var queuedMessage = this._queue.shift()

      this.render(queuedMessage.message, queuedMessage.message_type)
    }

    return false
  },

  delayedRender: function () {
    _(this.render).delay(200)
  },

  _cancelDelayedClose: function () {
    if (this._closeTimeoutId) {
      clearTimeout(this._closeTimeoutId)
    }
  },

  _updateFeedback: function (message, message_type) {
    this.$content.html(this.$template.mustache({
      message: message,
      message_type: message_type
    }))
  },

  _delayedClose: function (delayFor) {
    this._closeTimeoutId = _(this.close).delay(delayFor || 10000)
  }
})
