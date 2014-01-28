  var ListingView = Backbone.View.extend({
  events: {
    'click [data-order]': 'order'
  },

  initialize: function () {
    _(this).bindAll('render', 'reloadError', 'complete', 'search')

    this.$paginationContainerEl = this.options.paginationContainerEl
    this.feedbackView           = this.options.feedbackView
    this.$searchEl              = this.options.searchEl

    this.model     = new Listing(this.$el.data('initial-listing-data'))
    this.model.url = this.$el.data('url')
    this.model.dataType = this.$el.data('data-type') || 'html'

    this.configurePager()
    this.configureOrder()
    this.configureSearch()

    this.listenTo(this.model, 'request', this.loading)
    this.listenTo(this.model, 'sync',    this.render)
    this.listenTo(this.model, 'error',   this.reloadError)
  },

  configurePager: function() {
    if (!_(this.$paginationContainerEl).isUndefined()) {
      this.pagerView = new PagerView({
        model:  this.model,
        labels: this.$paginationContainerEl.data('labels')
      })

      this.$paginationContainerEl.html(this.pagerView.render().$el)
    }
  },

  configureOrder: function () {
    this.$('[data-order=' + this.model.get('order_field') + ']')
        .addClass('selected ' + this.model.get('order_direction'))
  },

  configureSearch: function() {
    if(!_(this.$searchEl).isUndefined()) {
      this.$searchEl.searchableField().on('searchable.search', this.search)
    }
  },

  search: function(e, term) {
    this.model.set({ term: term, current_page: 1 })
  },

  order: function(e) {
    var order = $(e.currentTarget).data('order')
    this.model.changeOrder(order)
  },

  loading: function () {
    this.$el.loadingOverlay('show')
  },

  reload: function() {
    this.model.fetchList()
  },

  abortSearch: function() {
    if (this.lastRequest) {
      this.lastRequest.abort()
    }
  },

  render: function (model, data) {
    if (data) {
      this.$el.html(data).loadingOverlay('show')

      if (this.feedbackView) {
        this.feedbackView.close()
      }

      this.complete()
    }

    return this
  },

  reloadError: function (model, jqXHR, options) {
    if (this.feedbackView && jqXHR.statusText !== 'abort') {
      this.feedbackView.render(this.$el.data('error-message'), 'alert-error', true)
      this.complete()
    }
  },

  complete: function () {
    this.configureOrder()
    this.reconfigurePager()
    this.$el.loadingOverlay('hide')

    this.trigger('complete')
  },

  reconfigurePager: function() {
    this.model.set({ item_count: this.$('[data-item-count]').data('item-count') })
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
