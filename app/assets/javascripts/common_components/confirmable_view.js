var ConfirmableView = Backbone.View.extend({
  events: {
    'click': 'open'
  },

  initialize: function () {
    _(this).bindAll('confirmed', 'error')

    this.labels = this.$el.data('confirmable-labels')

    this.modal = this.options.modal || new ConfirmableModalView()
    this.modal.on('confirmable:confirm', this.confirm, this)
  },

  open: function () {
    this.render()
    return false
  },

  render: function () {
    this.modal.render(this.labels)
    return this
  },

  confirm: function () {
    $.ajax({
      url: this.$el.attr('href'),
      type: this.$el.data('method') || 'DELETE',
      success: this.confirmed,
      error: this.error
    })

    this.$el.trigger('confirmable:confirm')
  },

  confirmed: function (data) {
    this.$el.trigger('confirmable:confirmed', data)
  },

  error: function (jqXHR) {
    this.$el.trigger('confirmable:error', jqXHR)
  }
})

var ConfirmableModalView = Backbone.View.extend({
  events: {
    'click [data-confirmable-confirm]': 'confirm'
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
      '<a href="#" class="btn btn-danger" data-confirmable-confirm="true" data-disable-with="{{disabled_with}}">{{confirm}}</a>',
    '</div>'
  ].join('\n'),

  defaultLabels: {
    title: 'Confirm this action?',
    body: '<p>Are you sure you want to perform this action?</p>',
    cancel: 'Cancel',
    confirm: 'Yes',
    disabled_with: 'Confirming...'
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

    return this
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
    this.trigger('confirmable:confirm')
    return false
  }
})
