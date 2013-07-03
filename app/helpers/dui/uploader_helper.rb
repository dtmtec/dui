module Dui
  module UploaderHelper
    def render_uploader(options)
      render 'dui/uploader/uploader', {
        url: uploader_url_for(options[:url], '/upload', :uploader_url),
        iframe_redirect_url: iframe_redirect_url_for(options),
        status_url: uploader_url_for(options[:status_url], '/status', :uploader_status_url),
        status_data_type: options[:status_data_type].presence || 'json',
        uploader_params: uploader_params(options),
        pusher_api_key: options[:pusher_api_key] || Dui.uploader_pusher_api_key,
        pusher_channel: channel_for(options),
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

      def channel_for(options)
        options[:pusher_channel] || "#{Dui.uploader_pusher_channel}-#{rand(100000..999999)}"
      end

      def iframe_redirect_url_for(options)
        url = uploader_url_for(options[:iframe_redirect_url], nil, :uploader_iframe_redirect_url)
        url.ends_with?('?%s') ? url : "#{url}?%s"
      end

      def uploader_url_for(url, suffix, default_url)
        uploader_url = suffix.present? && Dui.uploader_server_host ? "#{Dui.uploader_server_host}#{suffix}" : nil
        default_url = dui.respond_to?(default_url) ? dui.send(default_url) : ''

        url.presence || uploader_url || default_url
      end
  end
end
