//= require jquery.fileupload
//= require jquery.iframe-transport
//= require dui/uploader/uploader

var UploaderView = Backbone.View.extend({
  events: {
    'click [data-uploader-button]': 'selectFile',
    'click .uploader-filename': 'download',
    'click .uploader-remove-file': 'removeOrAbort'
  },

  availableStatus: ['existing', 'started', 'failed', 'done', 'finished'],
  bytesUnits: [' bytes', 'kb', 'mb', 'gb', 'tb'],

  initialize: function () {
    _(this).bindAll()

    this.configureModel()
    this.configureModelListeners()
    this.configureUI()
    this.configureInitialState()
    this.configureFileUpload()
  },

  configureModel: function () {
    var model = new Uploader

    model.url           = this.$el.data('uploader-status-url')
    model.dataType      = this.$el.data('uploader-status-data-type')
    model.pusherApiKey  = this.$el.data('uploader-pusher-api-key')
    model.pusherChannel = this.$el.data('uploader-pusher-channel') || this._generatePusherChannel()

    this.model = model
  },

  configureModelListeners: function () {
    this.listenTo(this.model, 'change:filename',   this.filenameChanged, this)
    this.listenTo(this.model, 'change:size',       this.sizeChanged, this)
    this.listenTo(this.model, 'change:url',        this.urlChanged, this)
    this.listenTo(this.model, 'change:started_at', this.started, this)
    this.listenTo(this.model, 'change:loaded',     this.updateProgress, this)
    this.listenTo(this.model, 'change:error',      this.error, this)
    this.listenTo(this.model, 'change:done',       this.done, this)
    this.listenTo(this.model, 'change:finished',   this.finished, this)
    this.listenTo(this.model, 'reset',             this.reset, this)
  },

  configureUI: function () {
    this.$input           = this.$('input[type=hidden]')
    this.$progress        = this.$('.uploader-progress')
    this.$details         = this.$('.uploader-details')
    this.$detailsTemplate = this.$('[data-template-name=uploader-details]')
    this.$removeButton    = this.$('.uploader-remove-file')

    this.messages         = this.$el.data('uploader-messages') || {}

    this.$removeButton.tooltip({
      placement: 'left',
      title: this._removeButtonTooltipTitle,
      delay: 200
    })

    this.$details.toggleClass('no-textual-progress', !$.support.xhrFileUpload)
  },

  configureInitialState: function () {
    var fileAttributes = this.$el.data('uploader-file')

    if (fileAttributes && !_(fileAttributes).isEmpty()) {
      fileAttributes = _(fileAttributes).pick('filename', 'url', 'size')

      this.model.set(fileAttributes)
      this._updateStatusClass('existing')
    } else {
      this.reset()
    }
  },

  configureFileUpload: function () {
    var url       = this.$el.data('uploader-url'),
        redirect  = this.$el.data('uploader-iframe-redirect-url')
        params    = _(this.$el.data('uploader-params') || {}).extend({
          channel: this.model.pusherChannel
        })

    this.$('input:file').fileupload({
      url:         url,
      redirect:    redirect,
      formData:    params,
      dataType:    'json',
      dropZone:    null,
      start:       this.uploadStart,
      add:         this.uploadAdd,
      progressall: this.uploadProgressAll,
      fail:        this.uploadFail,
      done:        this.uploadDone
    })
  },

  filenameChanged: function () {
    var filename = this.model.get('filename') || ''

    this._updateDetail('filename', filename)
    this.$input.val(filename)
  },

  sizeChanged: function () {
    var size      = this.model.get('size'),
        humanSize = this._toHumanFileSize(size)

    this._updateDetail('total-size', humanSize)
    this.$details.toggleClass('no-size', _(size).isUndefined())
                 .find('.uploader-text-progress').attr('title', humanSize)
  },

  urlChanged: function () {
    this.$details.find('.uploader-filename').attr('href', this.model.get('url'))
  },

  started: function () {
    if (this.model.get('started_at')) {
      this._updateStatusClass('started')
      this.trigger('uploader:started', this.model)
    }
  },

  reset: function () {
    this._updateDetail('message', this.messages.initial)
    this._updateStatusClass()
    this.trigger('uploader:reset', this.model)
  },

  uploadAdd: function (e, data) {
    var file = data.files[0]

    if (file) {
      this.model.set({
        filename: file.name,
        size: file.size
      })
    }

    this.currentUpload = data.submit()
  },

  updateProgress: function () {
    var percentualProgress = this._toHumanPercentage(this.model.percentualProgress()),
        loadedBytes        = this._toHumanFileSize(this.model.loadedBytes()),
        size               = this.model.get('size'),
        totalSize          = this._toHumanFileSize(size),
        title              = percentualProgress + " - " + loadedBytes + " - " + totalSize

    this.$progress.find('.bar').css('width', percentualProgress)

    if (size) {
      this._updateDetail('loaded-size', loadedBytes)
      this._updateDetail('percentual',  percentualProgress)

      this.$details.removeClass('no-size').find('.uploader-text-progress').attr('title', title)
    } else {
      this.$details.addClass('no-size')
    }
  },

  error: function () {
    var currentError = this.model.get('error')

    if (currentError) {
      this._updateDetail('message', this.messages.error)
      this.$progress.find('.bar').css('width', '')
      this._updateStatusClass('failed')
      this.trigger('error', this.model.get('error'))
    }
  },

  done: function () {
    if (this.model.isDone()) {
      this._updateStatusClass('done')
    }
  },

  finished: function () {
    if (this.model.get('finished')) {
      this._updateStatusClass('finished')
      this.trigger('uploader:finished', this.model)
    }
  },

  uploadStart: function () {
    this.model.set({
      started_at: new Date,
      url: '',
      loaded: 0,
      total: 0,
      error: undefined,
      done: undefined,
      finished: undefined
    })
  },

  uploadProgressAll: function (e, data) {
    this.model.set({ total: parseInt(data.total, 10), loaded: parseInt(data.loaded, 10) })
  },

  uploadFail: function (e, options) {
    if (options.errorThrown == 'abort') {
      this.model.unset('error')
    } else {
      this.model.set({ error: options, started_at: undefined })
    }
  },

  uploadDone: function (e, data) {
    var url  = data.result[0].url,
        size = data.result[0].size

    this.model.set({ url: url, size: size, done: true })
  },

  selectFile: function () {
    if (!this.model.isUploading()) {
      this.$('input:file').click()
    }

    return false
  },

  download: function () {
    return !this.model.isUploading()
  },

  removeOrAbort: function (event) {
    var $element = $(event.currentTarget)

    $element.tooltip('hide')

    if (this.model.isUploading()) {
      this.currentUpload && this.currentUpload.abort()
      this.model.abort()
    } else {
      this._reset()
    }

    return false
  },

  _reset: function () {
    this.model.reset()
  },

  _updateStatusClass: function (status) {
    var removeStatus = _(this.availableStatus).map(function (s) { return 'uploader-' + s }),
        addClass     = status ? 'uploader-' + status : undefined

    this.$el.removeClass(removeStatus.join(' ')).addClass(addClass)
  },

  _updateDetail: function (name, value) {
    this.$details.find('.uploader-' + name).text(value)
  },

  _toHumanPercentage: function(percentual) {
    return ((percentual * 100).toFixed(1) * 1) + '%'
  },

  _toHumanFileSize: function (size) {
    var power       = size > 0 ? Math.floor(Math.log(size) / Math.log(1024)) : 0,
        sizeInBytes = (size / Math.pow(1024, power)).toFixed(2) * 1

    return sizeInBytes + '' + this.bytesUnits[power]
  },

  _generatePusherChannel: function () {
    return 'uploader-' + Math.floor(Math.random() * 1000000)
  },

  _removeButtonTooltipTitle: function () {
    return this.model.isUploading() ? this.messages.abort : this.messages.remove
  }
})
