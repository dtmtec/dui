var ConfirmableView = Backbone.View.extend({
  events: {
    'click [data-confirmable]': 'open'
  },

  initialize: function () {
    _(this).bindAll('confirmed', 'error', 'hideModal')

    this.feedbackView = this.options.feedbackView

    this.messages = this.$el.data('confirmable-messages')
    this.labels = this.$el.data('confirmable-labels')

    this.modal = this.options.modal || new ConfirmableModalView()
    this.modal.on('confirmable:confirm', this.confirm, this)
  },

  open: function (event) {
    this.$current = $(event.currentTarget)
    this.render()
    return false
  },

  render: function () {
    this.modal.render(this.labels)
    return this
  },

  confirm: function () {
    $.ajax({
      url: this.$current.attr('href'),
      type: this.$current.data('method') || 'DELETE',
      dataType: this.$current.data('data-type'),
      success: this.confirmed,
      error: this.error,
      complete: this.hideModal
    })

    this.$current.trigger('confirmable:confirm')
  },

  confirmed: function (data) {
    this.renderFeedback('notice', 'alert-success')
    this.trigger('confirmable:confirmed', data)
    this.$current.trigger('confirmable:confirmed', data)
  },

  error: function (jqXHR) {
    this.renderFeedback('alert', 'alert-error')
    this.trigger('confirmable:error', jqXHR)
    this.$current.trigger('confirmable:error', jqXHR)
  },

  hideModal: function () {
    this.modal.hide()
  },

  renderFeedback: function (message, message_type) {
    if (this.feedbackView) {
      this.feedbackView.render(this.messages[message], message_type, true)
    }
  }
})

var ConfirmableModalView = Backbone.View.extend({
  events: {
    'click [data-confirmable-confirm]': 'confirm',
    'click [data-dismiss=modal]': 'dismiss',
    'hide': 'dismiss'
  },

  el: $('<div id="confirmable-modal" class="modal fade hide"></div>'),

  template: [
    '<div class="modal-header">',
      '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>',
      '<h3>{{title}}</h3>',
    '</div>',
    '<div class="modal-body">{{{body}}}</div>',
    '<div class="modal-footer">',
      '<a href="#" class="btn" data-dismiss="modal">{{cancel}}</a>',
      '<a href="#" class="btn btn-danger" data-confirmable-confirm="true" data-disable-with="{{disable_with}}">{{confirm}}</a>',
    '</div>'
  ].join('\n'),

  defaultLabels: {
    title: 'Confirm this action?',
    body: '<p>Are you sure you want to perform this action?</p>',
    cancel: 'Cancel',
    confirm: 'Yes',
    disable_with: 'Confirming...'
  },

  initialize: function () {
    this.template = this.options.template || this.template
  },

  render: function (labels) {
    if (!this.isAppended()) {
      this.create()
    } else {
      this.setElement($('#confirmable-modal'))
    }

    this.$el.html(this.renderContent(labels))
    this.$el.modal('show')
    this.delegateEvents()
    this.confirmed = false

    return this
  },

  hide: function () {
    this.undelegateEvents()
    this.$el.modal('hide')
  },

  renderContent: function (labels) {
    return this.options.content || $.mustache(this.template, _(labels || {}).defaults(this.defaultLabels))
  },

  isAppended: function () {
    return $('#confirmable-modal').length > 0
  },

  create: function () {
    this.$el.appendTo('body')
  },

  confirm: function () {
    $.rails.disableElement(this.$('[data-confirmable-confirm]'))
    this.trigger('confirmable:confirm')
    this.confirmed = true
    return false
  },

  dismiss: function () {
    if (!this.confirmed) {
      this.trigger('confirmable:dismiss')
    }
  }
})
