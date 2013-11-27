var ListingView = Backbone.View.extend({
  events: {
    'click [data-order]': 'order'
  },

  initialize: function () {
    _(this).bindAll('render', 'reloadError', 'complete', 'search')

    this.$paginationContainerEl = this.options.paginationContainerEl
    this.feedbackView = this.options.feedbackView
    this.$searchEl = this.options.searchEl

    this.model     = new Listing(this.$el.data('initial-listing-data'))
    this.model.url = this.$el.data('url')

    this.configureSearch()
    this.configurePagination()
    this.setOrderClass()

    this.listenTo(this.model, 'change:term',            this.reload)
    this.listenTo(this.model, 'change:currentPage',     this.reload)
    this.listenTo(this.model, 'change:order_field',     this.reload)
    this.listenTo(this.model, 'change:order_direction', this.reload)
  },

  configureSearch: function() {
    if(!_(this.$searchEl).isUndefined()) {
      this.$searchEl.searchableField().on('searchable.search', this.search)
    }
  },

  configurePagination: function() {
    if (!_(this.$paginationContainerEl).isUndefined()) {
      this.pagerView = new PagerView({
        model: this.model
      })

      this.$paginationContainerEl.html(this.pagerView.render().$el)
    }
  },

  search: function(e, term) {
    this.model.set({ term: term, currentPage: 1 })
  },

  order: function(e) {
    element = $(e.currentTarget)

    this.model.changeOrder(element.data('order'))
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
      data: this.model.toJSON()
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

    this.setOrderClass()

    return this
  },

  reloadError: function () {
    if (this.feedbackView) {
      this.feedbackView.render(this.$el.data('error-message'), 'alert-error', true)
    }
  },

  complete: function () {
    this.$el.loadingOverlay('hide')

    if (this.pagerView) {
      this.model.set({ itemCount: this.$('table').data('item-count') })

      this.pagerView.render()
    }

    this.trigger('complete')
  },

  setOrderClass: function () {
    $('[data-order=' + this.model.get('order_field') + ']').addClass('selected ' + this.model.get('order_direction'))
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
