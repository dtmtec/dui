class ExamplesController < ApplicationController
  def upload
    path = Rails.root.join('tmp/uploads')
    FileUtils.mkdir_p(path)
    File.write(path.join(params[:file].original_filename), params[:file].tempfile.read.force_encoding('utf-8'))

    render json: [{
      name: params[:file].original_filename,
      type: params[:file].content_type,
      size: params[:file].size,
      url:  "#{path}/#{params[:file].original_filename}"
    }]
  end
end
