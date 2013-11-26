var Listing = Pager.extend({
  changeOrder: function (changed_field) {
    if (changed_field != this.get('order_field')) {
      this.set(
        { order_field: changed_field, order_direction: 'asc' }
      )
    } else {
      this.get('order_direction') == 'asc' ? this.set('order_direction', 'desc') : this.set('order_direction', 'asc')
    }
  }
})