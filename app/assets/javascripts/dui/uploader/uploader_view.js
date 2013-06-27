//= require dui/uploader/uploader

var UploaderView = Backbone.View.extend({
  events: {
    'click [data-uploader-button]': 'selectFile'
  },

  availableStatus: ['started', 'failed', 'done', 'finished'],
  bytesUnits: [' bytes', 'kb', 'mb', 'gb', 'tb'],

  initialize: function () {
    _(this).bindAll()

    this.model = new Uploader
    this.model.url = this.$el.data('uploader-status-url')
    this.model.pusherChannel = this.$el.data('uploader-pusher-api-key')
    this.model.pusherApiKey  = this.$el.data('uploader-pusher-channel')

    this.listenTo(this.model, 'change:filename',   this.filenameChanged, this)
    this.listenTo(this.model, 'change:size',       this.sizeChanged, this)
    this.listenTo(this.model, 'change:started_at', this.started, this)
    this.listenTo(this.model, 'change:loaded',     this.updateProgress, this)
    this.listenTo(this.model, 'change:error',      this.error, this)
    this.listenTo(this.model, 'change:done',       this.done, this)
    this.listenTo(this.model, 'change:finished',   this.finished, this)

    this.$file = this.$('input:file')
    this.$input = this.$('input[type=hidden]')
    this.$progress = this.$('.uploader-progress')
    this.$details = this.$('.uploader-details')
    this.$detailsTemplate = this.$('[data-template-name=uploader-details]')

    this.$file.fileupload({
      url: this.$el.data('uploader-url'),
      redirect: this.$el.data('uploader-iframe-redirect-url'),
      formData: this.$el.data('uploader-params'),
      replaceFileInput: false,
      dropZone: null,
      start: this.uploadStart,
      add: this.uploadAdd,
      progressall: this.uploadProgressAll,
      fail: this.uploadFail,
      done: this.uploadDone
    })
  },

  filenameChanged: function () {
    this._updateDetail('filename', this.model.get('filename'))
  },

  sizeChanged: function () {
    this._updateDetail('total-size', this._toHumanFileSize(this.model.get('size')))
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
        loadedBytes        = this._toHumanFileSize(this.model.loadedBytes())

    this.$progress.find('.bar').css('width', percentualProgress)

    this._updateDetail('loaded-size', loadedBytes)
    this._updateDetail('percentual',  percentualProgress)
  },

  error: function () {
    var currentError = this.model.get('error')

    if (currentError) {
      this.$details.find('.uploader-error').text(this.$el.data('uploader-error-message'))
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
    }
  },

  uploadStart: function () {
    this.model.set({
      started_at: new Date,
      total: 0,
      loaded: 0,
      error: undefined,
      done: false
    })
  },

  uploadProgressAll: function (e, data) {
    this.model.set({ total: parseInt(data.total, 10), loaded: parseInt(data.loaded, 10) })
  },

  uploadFail: function (e, options) {
    this.model.set({ error: options })
  },

  uploadDone: function () {
    this.model.set({ done: true })
  },

  selectFile: function () {
    this.$file.click()
    return false
  },

  _updateStatusClass: function (status) {
    var removeStatus = _(this.availableStatus).chain()
                                              .without(status)
                                              .map(function (s) { return 'uploader-' + s })
                                              .value()

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
  }
})
