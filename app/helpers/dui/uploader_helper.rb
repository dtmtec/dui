module Dui
  module UploaderHelper
    include Dui::ApplicationHelper

    def render_uploader(options)
      render 'dui/uploader/uploader', {
        url: uploader_url_for(options[:url], '/upload', :uploader_url),
        iframe_redirect_url: uploader_iframe_redirect_url_for(options),
        status_url: uploader_url_for(options[:status_url], '/status', :uploader_status_url),
        status_data_type: options[:status_data_type].presence || 'json',
        uploader_params: uploader_params(options),
        pusher_api_key: options[:pusher_api_key] || Dui.uploader_pusher_api_key,
        pusher_channel: uploader_channel_for(options),
        messages: scoped_t('messages', options[:scope], :uploader),
        upload_label: scoped_t('label', options[:scope], :uploader),
        percentage_separator: scoped_t('percentage_separator', options[:scope], :uploader),
        loaded_to_total_size: scoped_t('loaded_to_total_size', options[:scope], :uploader),
        before_rate: scoped_t('before_rate', options[:scope], :uploader),
        after_rate: scoped_t('after_rate', options[:scope], :uploader),
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
      def uploader_channel_for(options)
        options[:pusher_channel] || "#{Dui.uploader_pusher_channel}-#{rand(100000..999999)}"
      end

      def uploader_iframe_redirect_url_for(options)
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
