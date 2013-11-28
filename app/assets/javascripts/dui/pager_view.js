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

    this.listenTo(this.model, 'change:itemCount change:currentPage', this.render)
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
    var currentPage = $(e.currentTarget).data('real-value')

    this.model.set({ currentPage: parseInt(currentPage, 10) })

    return false
  }
})