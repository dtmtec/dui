var PagerView = Backbone.View.extend({
  tagName: 'div',

  events: {
    'click li a': 'paginate'
  },

  initialize: function() {
    if (this.options.labels) {
      this.model.set({ labels: this.options.labels })
    }

    this.size = this.options.size

    this.listenTo(this.model, 'change:item_count change:current_page', this.render)
  },

  render: function() {
    this.$el.html(this.pagerList())

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
  },

  pagerList: function() {
    if (this.size === 'large') {
      return '<ul class="pagination pagination-lg"></ul>'

    } else if (this.size === 'small') {
      return '<ul class="pagination pagination-sm"></ul>'

    } else {
      return '<ul class="pagination"></ul>'
    }
  }
})