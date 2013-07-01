module Dui
  module UploaderHelper
    def render_uploader(options)
      render 'dui/uploader/uploader', {
        url: options[:url],
        status_url: options[:status_url],
        iframe_redirect_url: options[:iframe_redirect_url],
        uploader_params: uploader_params(options),
        pusher_api_key: options[:pusher_api_key] || Dui.uploader_pusher_api_key,
        pusher_channel: options[:pusher_channel] || Dui.uploader_pusher_channel,
        messages: i18n_for('messages', options[:scope]),
        upload_label: i18n_for('label', options[:scope]),
        percentage_separator: i18n_for('percentage_separator', options[:scope]),
        loaded_to_total_size: i18n_for('loaded_to_total_size', options[:scope]),
        input: options[:input],
        file: options[:file] || {}
      }
    end

    def generate_uploader_token
      require 'digest/sha1'

      timestamp = Time.now.to_i.to_s
      random    = rand.to_s.gsub('.', '')[0..9]

      timestamp + random + Digest::SHA1.hexdigest(timestamp + random + Dui.uploader_server_secret)
    end

    def uploader_params(options)
      (options[:uploader_params] || {}).reverse_merge({
        token: generate_uploader_token
      })
    end

    private
      def i18n_key_for(key, scope=nil)
        scope = scope ? ".#{scope}" : ''
        "uploader#{scope}.#{key}"
      end

      def i18n_for(key, scope=nil)
        options = { default: I18n.t(i18n_key_for(key), default: '') }

        I18n.t(i18n_key_for(key, scope), options)
      end
  end
end
