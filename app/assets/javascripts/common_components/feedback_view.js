var FeedbackView = Backbone.View.extend({
  _queue: [],

  events: {
    'click .feedback-content': 'close'
  },

  initialize: function () {
    this.$template = this.$('script')
    this.$content  = this.$('.feedback-content').hide()

    _(this.options).defaults({
      animationDuration: 200,
      delay: 10000,
      queueDelay: 2000
    })

    _(this).bindAll()
  },

  render: function (message, message_type, now) {
    if (!now && this._isBeingDisplayed()) {
      this.queue(message, message_type)
    } else {
      this._cancelDelayedClose()
      this.show(message, message_type)
      this._delayedClose()
    }
  },

  queue: function (message, message_type) {
    this._queue.push({message: message, message_type: message_type})

    this._cancelDelayedClose()
    // reducing delayed close so that the queued message is displayed faster
    this._delayedClose(this.options.queueDelay)
  },

  show: function (message, message_type) {
    if (message) {
      this._updateFeedback(message, message_type)
    }

    this._displayed = true
    this.$content.slideDown(this.options.animationDuration)
  },

  close: function () {
    this._cancelDelayedClose()
    this._displayed = false
    this.$content.slideUp(this.options.animationDuration, this._dequeue)

    return false
  },

  delayedRender: function () {
    _(this.render).delay(200)
  },

  _isBeingDisplayed: function () {
    return this._displayed
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
    this._closeTimeoutId = _(this.close).delay(delayFor || this.options.delay)
  },

  _dequeue: function () {
    if (!_(this._queue).isEmpty()) {
      var queuedMessage = this._queue.shift()

      this.render(queuedMessage.message, queuedMessage.message_type)
    }
  }
})
