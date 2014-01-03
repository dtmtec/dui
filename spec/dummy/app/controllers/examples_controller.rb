class ExamplesController < ApplicationController
  def listing
    order_field     = params[:order_field]     || 'name'
    order_direction = params[:order_direction] || 'asc'
    per_page        = (params[:per_page] || 2).to_i
    current_page    = (params[:current_page] || 1).to_i

    offset          = (current_page - 1) * per_page

    @collection = [
      { name: "The godfather", description: "A movie about gansters" },
      { name: "Pulp fiction", description: "A movie about more gangsters" },
      { name: "Titanic", description: "A shipwreck movie" },
      { name: "Inception", description: "Dream movie" }
    ].sort_by { |item| item[order_field.to_sym] }

    if params[:term]
      term = params[:term].parameterize

      @collection.select! do |item|
        item[:name].parameterize.include?(term) || item[:description].parameterize.include?(term)
      end
    end

    @collection.reverse! if order_direction == 'desc'

    @item_count = @collection.count
    @collection = @collection[offset, per_page]

    @initial_listing_data = {
      order_field: order_field,
      order_direction: order_direction,
      item_count: @item_count,
      per_page: per_page,
      current_page: current_page
    }

    render partial: 'listing' if request.xhr?
  end
end
