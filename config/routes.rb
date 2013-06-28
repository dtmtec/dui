Dui::Engine.routes.draw do
  post 'upload' => 'uploader#upload', as: :uploader
  get 'status' => 'uploader#status', as: :uploader_status
  get 'result' => 'uploader#result', as: :uploader_iframe_redirect
end
