var PagerView = Backbone.View.extend({
  tagName: 'div',
  className: 'pagination',

  events: {
    'click li a': 'paginate'
  },

  initialize: function() {
    if (this.options.labels) {
      this.model.set({ labels: this.options.labels })
    }

    this.listenTo(this.model, 'change:item_count change:current_page pager_reset', this.render)
  },

  render: function() {
    this.$el.html('<ul>')

    this.model.getItems().each(function(item) {
      var pagerItemView = new PagerItemView({ model: item })
      this.$('ul').append(pagerItemView.render().$el)
    }, this)

    return this
  },

  paginate: function(e) {
    var current_page = $(e.currentTarget).data('real-value')

    this.model.set({ current_page: parseInt(current_page, 10) })

    return false
  }
})
