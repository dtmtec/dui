module Dui
  class CrudBoxController < Dui::ApplicationController
    inherit_resources

    respond_to :json, only: [:destroy]

    def index
      index! do |format|
        format.html { render partial: 'index' }
      end
    end

    def create
      create! do |success, failure|
        success.html { render partial: 'dui/crud_box/form_head', locals: { resource: end_of_association_chain.build } }
        failure.html { render partial: 'dui/crud_box/form_head', status: 422  }
      end
    end

    def edit
      edit! do |format|
        format.html { render partial: 'dui/crud_box/form_head' }
      end
    end

    def update
      update! do |success, failure|
        success.html { render partial: 'dui/crud_box/form_head' }
        failure.html { render partial: 'dui/crud_box/form_head', status: 422  }
      end
    end

    def destroy
      destroy! do |success, failure|
        success.json { render json: {} }
      end
    end
  end
end