var Uploader = Backbone.Model.extend({
  initialize: function () {
    _(this).bindAll()

    this.on('change:started_at', this.onStartedAt)
    this.on('change:done', this.onDone)
  },

  percentualProgress: function () {
    var total  = this.get('total') || 0,
        loaded = this.get('loaded') || 0

    return total > 0 ? loaded / total : 0
  },

  loadedBytes: function () {
    var size       = this.get('size') || 0,
        percentage = this.percentualProgress()

    return percentage * size
  },

  isUploading: function () {
    return this.has('started_at') && !this.get('finished')
  },

  canUsePusher: function () {
    return !_(this.pusherApiKey).isUndefined() && !_(this.pusherApiKey).isEmpty()
  },

  waitForPusher: function () {
    if (!this.isPusherConnected()) {
      this.startPollingStatus()
    }
  },

  startPollingStatus: function () {
    this.pollStatus()
    this._pollIntervalId = setInterval(this.pollStatus, 200)
  },

  pollStatus: function () {
    $.ajax({
      url: _(this).result('url'),
      data: {
        file: this.get('filename')
      },
      success: this.onStatus
    })
  },

  onStartedAt: function () {
    if (this.canUsePusher() && this.isPusherConnected()) {
      this._initializeChannel()
    }
  },

  onDone: function () {
    if (this.get('done')) {
      this.canUsePusher() ? this.waitForPusher() : this.startPollingStatus()
    }
  },

  onUploadCompleted: function () {
    this.set({ finished: true })
  },

  onUploadFailed: function (data) {
    this.set({ error: data, url: '', started_at: undefined })
  },

  onStatus: function (data, status, jqXHR) {
    if (data.finished_uploading) {
      clearInterval(this._pollIntervalId)
      delete this._pollIntervalId
      this.set({ finished: true })
    }
  },

  pusher: function () {
    var pusherInstance = Uploader.pusherInstances[this.pusherApiKey]

    if (!pusherInstance) {
      Uploader.pusherInstances[this.pusherApiKey] = pusherInstance = new Pusher(this.pusherApiKey)
      pusherInstance.connection.bind('connected', this._initializeChannel)
    }

    return pusherInstance
  },

  isPusherConnected: function () {
    return this.pusher().connection.state == 'connected'
  },

  _initializeChannel: function () {
    this.channel = this._getChannel()

    this.channel.unbind('upload-completed', this.onUploadCompleted)
    this.channel.unbind('upload-failed', this.onUploadFailed)

    this.channel.bind('upload-completed', this.onUploadCompleted)
    this.channel.bind('upload-failed', this.onUploadFailed)
  },

  _getChannel: function () {
    var pusher      = this.pusher(),
        channelName = this.pusherChannel,
        channel     = pusher.channel(channelName) || pusher.subscribe(channelName)

    return channel
  }
}, {
  pusherInstances: []
})
