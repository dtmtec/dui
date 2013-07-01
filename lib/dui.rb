require "dui/engine"

module Dui
  mattr_accessor :uploader_server_secret
  @@uploader_server_secret = ENV['UPLOADER_SERVER_SECRET'] || ''

  mattr_accessor :uploader_pusher_api_key
  @@uploader_pusher_api_key = ENV['UPLOADER_PUSHER_API_KEY'] || ''

  mattr_accessor :uploader_pusher_channel
  @@uploader_pusher_channel = ENV['UPLOADER_PUSHER_CHANNEL'] || 'cloud-uploader'
end
