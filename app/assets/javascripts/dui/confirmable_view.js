var ConfirmableView = Backbone.View.extend({
  events: {
    'click [data-confirmable]': 'open'
  },

  initialize: function () {
    _(this).bindAll('confirmed', 'error', 'hideModal')

    this.feedbackView = this.options.feedbackView

    this.labelsPrefix = this.options.labelsPrefix || 'confirmable'

    this.messages = this.$el.data(this.labelsPrefix + '-messages')
    this.labels = this.$el.data(this.labelsPrefix + '-labels')

    this.modal = this.options.modal || new ConfirmableModalView()
    this.modal.on('confirmable:confirm', this.confirm, this)
  },

  open: function (event) {
    this.$current = $(event.currentTarget)

    if(this.shouldOpen()) {
      this.render()
    }

    return false
  },

  shouldOpen: function() {
    return !(this.$current.hasClass('disabled'))
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
    'keyup [data-confirmation-text]': 'verifyConfirmationText',
    'hide': 'dismiss'
  },

  el: function() {
    return $('<div class="modal confirmable-modal fade hide"></div>')
  },

  template: [
    '<div class="modal-header">',
      '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>',
      '<h3>{{title}}</h3>',
    '</div>',
    '<div class="modal-body">',
      '{{{body}}}',
      '{{#confirmation_text}}',
        '<div class="modal-confirmation-text">',
          '<p>{{{ confirmation_label_html }}}</p>',
          '<input type="text" data-confirmation-text="{{confirmation_text}}"/>',
        '</div>' ,
      '{{/confirmation_text}}',
    '</div>',
    '<div class="modal-footer">',
      '<a href="#" class="btn" data-dismiss="modal">{{cancel}}</a>',
      '<a href="#" class="btn {{#confirmation_text}}disabled{{/confirmation_text}}" data-confirmable-confirm="true" data-disable-with="{{disable_with}}">{{confirm}}</a>',
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
    this.modalId = this.options.id || 'confirmable-modal'
    this.submitBtnClass = this.options.submitBtnClass || 'btn-danger'

    this.$el.attr('id', this.modalId)
  },

  render: function (labels) {
    if (!this.isAppended()) {
      this.create()
    } else {
      this.setElement($('#' + this.modalId))
    }

    this.$el.html(this.renderContent(labels))
    this.$el.find('[data-confirmable-confirm=true]').addClass(this.submitBtnClass)
    this.$el.modal('show')
    this.delegateEvents()

    this.confirmed = false
    this.$el.removeClass('correct')

    if (labels) {
      this.confirmationText = labels.confirmation_text
    }

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
    var id = '#' + this.$el.attr('id')
    return $(id).length > 0
  },

  create: function () {
    this.$el.appendTo('body')
  },

  confirm: function () {
    if (!this.$('[data-confirmable-confirm]').hasClass('disabled')) {
      $.rails.disableElement(this.$('[data-confirmable-confirm]'))
      this.trigger('confirmable:confirm')
      this.confirmed = true
    }

    return false
  },

  dismiss: function () {
    if (!this.confirmed) {
      this.trigger('confirmable:dismiss')
      this.$el.removeClass('error')
      this.$el.removeClass('correct')
    }
  },

  verifyConfirmationText: function() {
    var confirmationInputText = this.$('[data-confirmation-text]')

    var currentText = confirmationInputText.val()

    if (currentText == this.confirmationText) {
      this.$el.removeClass('error')
      this.$el.addClass('correct')

      this.$el.find('[data-confirmable-confirm]').removeClass('disabled')
    } else {
      this.$el.addClass('error')
      this.$el.removeClass('correct')

      this.$el.find('[data-confirmable-confirm]').addClass('disabled')
    }
  }
})
