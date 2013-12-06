var Listing = Pager.extend({
  dataType: 'html',

  initialize: function() {
    this.on('change:term change:current_page change:order_field change:order_direction', this.fetchList, this)
  },

  changeOrder: function (changed_field) {
    if (changed_field != this.get('order_field')) {
      this.set({
        order_field: changed_field, order_direction: 'asc'
      })
    } else {
      var newDirection = this.get('order_direction') == 'asc' ? 'desc' : 'asc'

      this.set('order_direction', newDirection)
    }
  },

  fetchList: function () {
    if (this.lastRequest) {
      this.lastRequest.abort()
    }

    this.lastRequest = this.fetch({ dataType: 'html', data: this.toJSON() })

    return this.lastRequest
  },

  parse: function (resp, options) {
    if (this.dataType == 'html') {
      return this.attributes
    } else {
      return resp
    }
  }
})