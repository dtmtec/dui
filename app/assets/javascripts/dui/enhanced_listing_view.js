var EnhancedListingView = Marionette.View.extend({
  events: {
    'click [data-order]': 'changeOrder'
  },

  collectionEvents: {
    'meta:change:order_field meta:change:order_direction': 'renderOrder'
  },

  initialize: function () {
    Marionette.View.prototype.initialize.call(this)

    this.$searchEl              = this.options.searchEl
    this.$paginationContainerEl = this.options.paginationContainerEl
    this.feedbackView           = this.options.feedbackView
    this.collectionViewClass    = this.options.collectionViewClass || Marionette.CollectionView

    this.collection = new (this.options.collectionClass || ListingCollection)
    this.collection.url = this.$el.data('url')
    this.collection.meta.set(this.$el.data('initial-listing-data'), { silent: true })

    this.listenTo(this.collection, 'request', this.loading)
    this.listenTo(this.collection, 'sync', this.loaded)
    this.listenTo(this.collection, 'error', this.error)

    this.configureCollectionView()
    this.configurePager()
    this.configureSearch()
  },

  configureCollectionView: function () {
    this.collectionView = new this.collectionViewClass({
      collection: this.collection
    })

    this.$el.html(this.collectionView.$el)
  },

  configurePager: function() {
    if (this.$paginationContainerEl) {
      this.pagerView = new PagerView({
        model:  this.collection.meta,
        labels: this.$paginationContainerEl.data('labels')
      })

      this.$paginationContainerEl.html(this.pagerView.render().$el)
    }
  },

  configureSearch: function () {
    if (this.$searchEl) {
      this.$searchEl.searchableField().on('searchable.search', _(this.search).bind(this))
    }
  },

  render: function () {
    this.bindUIElements()
    this.collectionView.render()

    return this
  },

  loading: function () {
    this.$el.loadingOverlay('show')
  },

  loaded: function () {
    this.$el.loadingOverlay('hide')

    if (this.feedbackView) {
      this.feedbackView.close()
    }
  },

  error: function (model, jqXHR) {
    if (this.feedbackView && jqXHR.statusText !== 'abort') {
      this.feedbackView.render(this.$el.data('error-message'), 'alert-error', true)
      this.$el.loadingOverlay('hide')
    }
  },

  search: function(e, term) {
    this.collection.meta.set({ term: term, current_page: 1 })
  },

  changeOrder: function (event) {
    var order = $(event.currentTarget).data('order')
    this.collection.meta.changeOrder(order)
  },

  renderOrder: function () {
    var meta = this.collection.meta

    this.$('[data-order]').removeClass('selected asc desc')
    this.$('[data-order="' + meta.get('order_field') + '"]')
        .addClass('selected ' + meta.get('order_direction'))
  }
})


// Listing Table marionette views

var ListingTableEmptyView = Marionette.ItemView.extend({
  tagName: 'tr',
  template: "[data-template-name=listing-table-empty-view]"
})

var ListingTableItemView = Marionette.ItemView.extend({
  tagName: 'tr',
  template: "[data-template-name=listing-table-item-view]"
})

var ListingTableCompositeView = Marionette.CompositeView.extend({
  tagName: 'table',
  className: '.table .table-striped',
  itemViewContainer: 'tbody',
  template: "[data-template-name=listing-table-composite-view]",
  itemView: ListingTableItemView,
  emptyView: ListingTableEmptyView
})
