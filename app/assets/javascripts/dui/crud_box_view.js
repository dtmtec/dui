var LoadableSelectView = Backbone.View.extend({
  events: {
    'change select[data-selectable-load]': 'toggleDisabled'
  },

  initialize: function(){
    _(this).bindAll()

    this.feedbackView = this.options.feedbackView
  },

  toggleDisabled: function (event) {
    var $changed = $(event.currentTarget),
        $child   = this.$($changed.data('selectable-load'))

    $child.val('').trigger('change')

    if ($changed.val() === '') {
      this.disableSelect($child)
    } else {
      this.$currentChild = $child
      this.loadSelectOptions($changed)
    }
  },

  disableSelect: function ($select) {
    var $selectDisable = this.$($select.data('selectable-load'))

    $select.addClass('disabled').prop('disabled', true)

    if ($selectDisable.length > 0) {
      this.disableSelect($selectDisable)
    }
  },

  loadSelectOptions: function ($select){
    this.$el.parent().loadingOverlay('show')

    $.ajax({
      url: $select.data('selectable-url'),
      data: this.loadData(),
      dataType: 'html',
      success: this.updateCurrentChild,
      error: this.loadError,
      complete: this.complete
    })
  },

  loadData: function () {
    return _(this.$('select[data-selectable-load]')).inject(function (memo, element) {
      var $element = $(element)
      memo[$element.attr('name')] = $element.val()
      return memo
    }, {})
  },

  updateCurrentChild: function (data) {
    this.$currentChild.html(data).prop('disabled', false).removeClass('disabled')
    this.$el.parent().loadingOverlay('hide')
  },

  loadError: function () {
    if (this.feedbackView) {
      this.feedbackView.render(this.$el.data('error-message'), 'alert-error', true)
    }
  },

  complete: function () {
    this.trigger('complete')
  }
})

var CRUDFormView = Backbone.View.extend({
  events: {
    'click [data-save-and-close]': 'markToClose',
    'click [data-close]': 'close',
    'toggled': 'toggled',

    'ajax:success': 'success',
    'ajax:error':   'failed',
    'submit form':  'submit',
  },

  initialize: function() {
    _(this).bindAll()

    this.feedbackView = this.options.feedbackView

    this.loadableSelectView = new LoadableSelectView({
      el: this.el,
      feedbackView: this.feedbackView
    })

    this.configureForm()
  },

  updateForm: function (data) {
    this.$('form').loadingOverlay('hide').off().replaceWith(data)
    this.$('form').trigger('shown')
    this.configureForm()
  },

  configureForm: function () {
    this.shouldClose = false

    this.$('[data-type=currency]').autoNumeric({
      aSep: '.',
      aDec: ',',
      vMax: '999999999999.99'
    })

    this.$('[data-type=integer]').autoNumeric({
      aSep: '',
      aDec: ',',
      mDec: 0,
      vMax: '999999999999'
    })

    this.$('[data-type=year]').autoNumeric({
      aSep: '',
      aDec: ',',
      mDec: 0,
      vMax: '9999'
    })

    this.$(".error .help-inline").tooltip({
      title: function () { return $(this).text() },
      placement: 'left'
    })

    this.focus()
  },

  markToClose: function () {
    this.shouldClose = true
  },

  success: function (event, data) {
    if (this.shouldClose) {
      this.close()
    }

    this.feedbackView.render(this.$el.data('success-message'), 'alert-success', true)
    this.trigger('finished')
    this.updateForm(data)
  },

  failed: function (event, response) {
    if (response.status == 422) {
      this.updateForm(response.responseText)
    }

    this.feedbackView.render(this.$el.data('failed-message'), 'alert-error', true)
    this.focus()
  },

  focus: function () {
    var input = this.$('.error:first input')

    if (input.length == 0) {
      input = this.$('.control-group input:first')
    }

    input.focus()
  },

  loadPath: function(path) {
    this.$('form').loadingOverlay('show')

    $.ajax({
      url: this.$el.data('url') || path,
      dataType: this.$el.data('data-type') || 'html',
      success: this.updateForm,
      error: this.loadError,
      complete: this.complete
    })
  },

  loadError: function () {
    if (this.feedbackView) {
      this.feedbackView.render(this.$el.data('error-message'), 'alert-error', true)
    }
  },

  complete: function () {
    this.trigger('complete')
  },

  close: function(){
    this.$('.error').removeClass('error').find('span.help-inline').remove()
    this.$el.addClass('toggler-hide')
    this.trigger('closed')

    return false
  },

  toggled: function (event) {
    $($(event.currentTarget).data('toggler-close')).addClass('toggler-hide')

    setTimeout(this.focus, 300)
  },

  submit: function(){
    this.$('[data-type=currency], [data-type=integer]').each(function() {
      var element = $(this),
          value   = element.autoNumeric('get')

      element.autoNumeric('destroy').val(value)
    })
  }
})

var CRUDDestroyView = Backbone.View.extend({
  events: {
    'click [data-confirmable-confirm]': 'confirm',
    'click [data-close]': 'hide',
    'toggled': 'toggled'
  },

  render: function () {
    var $button = this.$('[data-confirmable-confirm]')

    if ($button.hasClass('disabled')) {
      $.rails.enableElement($button.removeClass('disabled'))
    }

    this.$el.removeClass('toggler-hide').trigger('toggled')
  },

  hide: function () {
    this.$el.addClass('toggler-hide')
    return false
  },

  toggled: function (event) {
    $($(event.currentTarget).data('toggler-close')).addClass('toggler-hide')
  },

  confirm: function (event) {
    $.rails.disableElement($(event.currentTarget).addClass('disabled'))
    this.trigger('confirmable:confirm')
    return false
  }
})

var CRUDBoxView = Backbone.View.extend({
  events: {
    'click [data-toggle]': 'toggleForm',
    'click [data-update-button]': 'loadEditForm'
  },

  initialize: function() {
    _(this).bindAll()

    this.feedbackView = this.options.feedbackView

    this.listingView = new ListingView({
      el: this.$('.crud-box-list'),
      feedbackView: this.feedbackView
    })

    this.setUpConfirmableView()
    this.setUpNewFormView()
    this.setUpEditFormView()
  },

  setUpConfirmableView: function(){
    this.confirmableView = new ConfirmableView({
      el: this.$('.crud-box-list'),
      modal: new CRUDDestroyView({ el: this.$('.crud-box-destroy-form') }),
      feedbackView: this.feedbackView
    })

    this.listingView.listenTo(this.confirmableView, 'confirmable:confirmed', this.listingView.reload)
  },

  setUpNewFormView: function(){
    this.newFormView = new CRUDFormView({
      el: this.$('.crud-box-new-form'),
      feedbackView: this.feedbackView
    })

    this.listingView.listenTo(this.newFormView, 'finished', this.listingView.reload)
    this.listenTo(this.newFormView, 'closed', this.removeListingOverlay)
  },

  setUpEditFormView: function(){
    this.editFormView = new CRUDFormView({
      el: this.$('.crud-box-edit-form'),
      feedbackView: this.feedbackView
    })

    this.listingView.listenTo(this.editFormView, 'finished', this.listingView.reload)
    this.listenTo(this.editFormView, 'closed', this.removeListingOverlay)
  },

  loadEditForm: function(event){
    this.listingView.$el.loadingOverlay('show')
    this.editFormView.loadPath(event.currentTarget.href)

    return false
  },

  removeListingOverlay: function(){
    this.listingView.$el.loadingOverlay('hide')
  },

  toggleForm: function(event) {
    var selector = $(event.currentTarget).data('toggle')

    this.$(selector).toggleClass('toggler-hide').trigger('toggled')
  }
})
