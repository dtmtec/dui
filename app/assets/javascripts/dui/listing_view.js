var Listing = Backbone.Model.extend({
})

var ListingView = Backbone.View.extend({
  initialize: function () {
    _(this).bindAll('render', 'reloadError', 'complete', 'search')

    this.feedbackView = this.options.feedbackView
    this.searchEl     = this.options.searchEl

    this.configureSearch()
  },

  configureSearch: function() {
    this.model     = new Listing
    this.model.url = this.$el.data('url')

    if(!_(this.searchEl).isUndefined()) {
      this.searchEl.searchableField().on('searchable.search', this.search)
    }

    this.listenTo(this.model, 'change', this.reload)
  },

  search: function(e, term) {
    this.model.set({ term: term })
  },

  reload: function () {
    this.$el.loadingOverlay('show')

    this.abortSearch()

    this.lastRequest = $.ajax({
      url: this.$el.data('url'),
      dataType: this.$el.data('data-type') || 'html',
      success: this.render,
      error: this.reloadError,
      complete: this.complete,
      data: this.model.attributes
    })
  },

  abortSearch: function() {
    if (this.lastRequest) {
      this.lastRequest.abort()
    }
  },

  render: function (data) {
    if (data) {
      this.$el.html(data).loadingOverlay('show')
    }

    return this
  },

  reloadError: function () {
    if (this.feedbackView) {
      this.feedbackView.render(this.$el.data('error-message'), 'alert-error', true)
    }
  },

  complete: function () {
    this.$el.loadingOverlay('hide')

    this.trigger('complete')
  }
})

var DestroyableListingView = ListingView.extend({
  initialize: function () {
    ListingView.prototype.initialize.call(this)

    this.confirmableModalView = new ConfirmableModalView(this.options.modalOptions || {})

    this.confirmableView = new ConfirmableView({
      el: this.el,
      modal: this.confirmableModalView,
      feedbackView: this.feedbackView
    })

    this.confirmableView.on('confirmable:confirmed', this.reload, this)
  }
})
