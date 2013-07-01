module Dui
  class UploaderController < Dui::ApplicationController
    def upload
      path = Rails.root.join('public/system/uploads')
      FileUtils.mkdir_p(path)
      FileUtils.cp(params[:file].path, path.join(params[:file].original_filename))

      render json: [{
        name: params[:file].original_filename,
        type: params[:file].content_type,
        size: params[:file].size,
        url:  "system/uploads/#{params[:file].original_filename}"
      }]
    end

    def status
      render json: { finished_uploading: true }
    end

    def result
      render action: :result, layout: false
    end
  end
end
