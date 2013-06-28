module Dui
  module UploaderHelper
    def render_uploader(options)
      render 'dui/uploader/uploader', {
        url: options[:url],
        status_url: options[:status_url],
        iframe_redirect_url: options[:iframe_redirect_url],
        uploader_params: options[:uploader_params] || {},
        error_message: i18n_for('error', options[:scope]),
        upload_label: i18n_for('label', options[:scope]),
        percentage_separator: i18n_for('percentage_separator', options[:scope]),
        loaded_to_total_size: i18n_for('loaded_to_total_size', options[:scope]),
        input: options[:input]
      }
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
