//= require dui/uploader/uploader

var UploaderView = Backbone.View.extend({
  events: {
    'click [data-uploader-button]': 'selectFile',
    'click .uploader-filename': 'download'
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
  },

  configureUI: function () {
    this.$input           = this.$('input[type=hidden]')
    this.$progress        = this.$('.uploader-progress')
    this.$details         = this.$('.uploader-details')
    this.$detailsTemplate = this.$('[data-template-name=uploader-details]')

    this.messages         = this.$el.data('uploader-messages') || {}
  },

  configureInitialState: function () {
    var fileAttributes = this.$el.data('uploader-file')

    if (fileAttributes && !_(fileAttributes).isEmpty()) {
      fileAttributes = _(fileAttributes).pick('filename', 'url', 'size')

      this.model.set(fileAttributes)
      this._updateStatusClass('existing')
    } else {
      this._updateDetail('message', this.messages.initial)
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
    this._updateDetail('filename', this.model.get('filename'))
  },

  sizeChanged: function () {
    var totalSize = this._toHumanFileSize(this.model.get('size'))
    this._updateDetail('total-size', totalSize)
    this.$details.find('.uploader-text-progress').attr('title', totalSize)
  },

  urlChanged: function () {
    this.$details.find('.uploader-filename').attr('href', this.model.get('url'))
  },

  started: function () {
    this._updateStatusClass('started')
  },

  uploadAdd: function (e, data) {
    var file = data.files[0]

    if (file) {
      this.model.set({
        filename: file.name,
        size: file.size
      })
    }

    data.submit()
  },

  updateProgress: function () {
    var percentualProgress = this._toHumanPercentage(this.model.percentualProgress()),
        loadedBytes        = this._toHumanFileSize(this.model.loadedBytes()),
        totalSize          = this._toHumanFileSize(this.model.get('size')),
        title              = percentualProgress + " - " + loadedBytes + " - " + totalSize

    this.$progress.find('.bar').css('width', percentualProgress)

    this._updateDetail('loaded-size', loadedBytes)
    this._updateDetail('percentual',  percentualProgress)

    this.$details.find('.uploader-text-progress').attr('title', title)
  },

  error: function () {
    var currentError = this.model.get('error')

    if (currentError) {
      this._updateDetail('message', this.messages.error)
      this._updateStatusClass('failed')
      this.trigger('error', this.model.get('error'))
    }
  },

  done: function () {
    if (this.model.get('done')) {
      this._updateStatusClass('done')
    }
  },

  finished: function () {
    if (this.model.get('finished')) {
      this.$input.val(this.model.get('filename'))
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
      done: false,
      finished: false
    })
  },

  uploadProgressAll: function (e, data) {
    this.model.set({ total: parseInt(data.total, 10), loaded: parseInt(data.loaded, 10) })
  },

  uploadFail: function (e, options) {
    this.model.set({ error: options })
  },

  uploadDone: function (e, data) {
    var url = data.result[0].url

    this.model.set({ url: url, done: true })
  },

  selectFile: function () {
    if (!this.model.isUploading()) {
      this.$('input:file').click()
    }

    return false
  },

  download: function () {
    return this.model.get('finished') == true
  },

  _updateStatusClass: function (status) {
    var removeStatus = _(this.availableStatus).map(function (s) { return 'uploader-' + s })

    this.$el.removeClass(removeStatus.join(' ')).addClass('uploader-' + status)
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
  }
})
