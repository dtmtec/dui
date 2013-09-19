module Dui
  module CrudBoxHelper
    def crud_box_url_for(resource)
      if resource.persisted?
        main_app.send("#{resource.class.name.underscore}_path", resource)
      else
        main_app.send("#{resource.class.name.underscore.pluralize}_path")
      end
    end

    def crud_box_for(model, collection = nil)
      class_name      = model.class.name
      collection_name = class_name.underscore.pluralize

      render 'dui/crud_box/crud_box', model: model,
                                  class_name: class_name,
                                  collection_name: collection_name,
                                  collection: collection
    end
  end
end