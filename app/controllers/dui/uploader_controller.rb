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
      }], root: false
    end

    def status
      result = { finished_uploading: true }

      if params[:callback]
        render text: "#{params[:callback]}(#{result.to_json})"
      else
        render json: { finished_uploading: true }
      end
    end

    def result
      render action: :result, layout: false
    end
  end
end
