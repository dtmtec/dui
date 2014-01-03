var MarionetteMultiSelect = {}

MarionetteMultiSelect.Model = Backbone.Model.extend({
  remove: function () {
    if (this.collection) {
      this.collection.remove(this)
    }
  }
})

MarionetteMultiSelect.Collection = Backbone.Collection.extend({
  model: MarionetteMultiSelect.Model,

  connectTo: function (connectedCollection, rejectFromConnected) {
    this.rejectFromConnected = rejectFromConnected
    this.connectedCollection = connectedCollection

    this.listenTo(connectedCollection, 'remove move:all', this.addFromAnother)
  },

  addFromAnother: function (modelOrCollection) {
    this.add(modelOrCollection.toJSON())
  },

  parse: function (models, options) {
    if (this.rejectFromConnected) {
      var connectedCollectionValues = this.connectedCollection.pluck('value')

      return _(models).reject(function (model) {
        return _(connectedCollectionValues).include(model.value)
      })
    } else {
      return models
    }
  },

  moveAll: function () {
    this.trigger('move:all', this)
    this.reset()
  },

  search: function (term) {
    this.fetch({ data: { term: term } })
  },

  fetch: function (options) {
    var params = _({}).extend(this.params, options && options.data)

    options = _({}).extend({ data: params, reset: true }, options)

    if (this.lastRequest) {
      this.lastRequest.abort()
      delete this.lastRequest
    }

    return this.lastRequest = Backbone.Collection.prototype.fetch.call(this, options)
  }
})

MarionetteMultiSelect.EmptyView = Marionette.ItemView.extend({
  tagName: 'li',
  className: 'no-items-message',

  initialize: function () {
    this.template = this.options.templates.empty
  }
})

MarionetteMultiSelect.ItemView = Marionette.ItemView.extend({
  tagName: 'li',

  events: {
    'click': 'move'
  },

  initialize: function () {
    this.template = this.options.templates.item
  },

  move: function () {
    this.model.remove()
    return false
  },

  onRender: function () {
    this.$el.attr({
      'title': this.model.get('label'),
      'data-value': this.model.get('value')
    })
  }
})

MarionetteMultiSelect.CollectionView = Marionette.CollectionView.extend({
  itemView: MarionetteMultiSelect.ItemView,
  emptyView: MarionetteMultiSelect.EmptyView,

  itemViewOptions: function () {
    return {
      templates: this.templates
    }
  },

  appendHtml: function (collectionView, itemView, index) {
    if (collectionView.isBuffering) {
      // buffering happens on reset events and initial renders
      // in order to reduce the number of inserts into the
      // document, which are expensive.
      collectionView.elBuffer.appendChild(itemView.el);
    } else {
      // If we've already rendered the main collection, just
      // append the new items directly into the element, in this case,
      // append them on the proper index.
      this.appendHtmlWhenNotBuffering(collectionView, itemView, index)
    }
  },

  appendHtmlWhenNotBuffering: function (collectionView, itemView, index) {
    var childrenContainer = collectionView.itemViewContainer ? collectionView.$(collectionView.itemViewContainer) : collectionView.$el,
        children = childrenContainer.children()

    if (children.size() <= index) {
      childrenContainer.append(itemView.el);
    } else {
      children.eq(index).before(itemView.el);
    }
  }
})

MarionetteMultiSelect.ColumnView = Marionette.View.extend({
  ui: {
    contentContainer: '.multi-select-content',
    content: '.multi-select-content > ul',
    allButton: '.multi-select-all-button',
    searchField: '.multi-select-search input',
    emptyTemplate: '[data-template-name="multi-select-empty-item"]',
    itemTemplate: '[data-template-name="multi-select-item"]'
  },

  events: {
    'click @ui.allButton': 'moveAll',
    'searchable.search @ui.searchField': 'search'
  },

  collectionEvents: {
    add: 'clearSearch',
    request: 'loading',
    sync: 'loaded'
  },

  collectionViewClass: MarionetteMultiSelect.CollectionView,

  initialize: function () {
    _(this).bindAll('search')

    this.collectionView = new this.collectionViewClass(_({}).extend(this.options, {
      collection: this.collection
    }))
  },

  render: function () {
    this.triggerMethod("before:render", this)

    this.bindUIElements()

    this.ui.content.html('')

    this.collection.url = this.$el.data('url')

    this.collectionView.setElement(this.ui.content)
    this.collectionView.templates = {
      empty: this.ui.emptyTemplate,
      item: this.ui.itemTemplate
    }

    this.ui.searchField.searchableField()

    this.triggerMethod("render", this)

    return this
  },

  moveAll: function () {
    this.collection.moveAll()
    return false
  },

  search: function (event, term) {
    this.collection.search(term)
  },

  clearSearch: function () {
    this.ui.searchField.trigger('searchable.clear')
  },

  loading: function () {
    this.ui.contentContainer.loadingOverlay('show')
  },

  loaded: function () {
    this.ui.contentContainer.loadingOverlay('hide')
  }
})

MarionetteMultiSelect.View = Marionette.View.extend({
  availableCollectionClass: MarionetteMultiSelect.Collection,
  selectedCollectionClass: MarionetteMultiSelect.Collection,

  availableViewClass: MarionetteMultiSelect.ColumnView,
  selectedViewClass: MarionetteMultiSelect.ColumnView,

  ui: function () {
    return {
      available: '.available',
      selected: '.selected'
    }
  },

  initialize: function () {
    this.available = new this.availableCollectionClass({}, { comparator: this.options.sortByField })
    this.selected = new this.selectedCollectionClass({}, { comparator: this.options.sortByField })

    this.available.connectTo(this.selected, true)
    this.selected.connectTo(this.available)

    this.availableView = new this.availableViewClass(_({}).extend(this.options, {
      collection: this.available,
      params: this.params
    }))

    this.selectedView = new this.selectedViewClass(_({}).extend(this.options, {
      collection: this.selected,
      params: this.params
    }))
  },

  reset: function (params, selected) {
    this.available.params = params

    this.render()

    this.available.reset()
    this.selected.reset(selected)

    this.available.fetch()
  },

  render: function () {
    this.triggerMethod("before:render", this)

    this.bindUIElements()

    this.availableView.setElement(this.ui.available)
    this.selectedView.setElement(this.ui.selected)

    this.availableView.render()
    this.selectedView.render()

    this.triggerMethod("render", this)

    return this
  },

  getSelected: function () {
    return this.selected.toJSON()
  },

  getAvailable: function () {
    return this.available.toJSON()
  }
})
