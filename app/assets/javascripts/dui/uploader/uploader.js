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

  waitForPusher: function () {
    var pusher = this.pusher()

    if (pusher.connection.state == 'connected') {
      this.channel = this.channel || this.pusher().subscribe(this.pusherChannel || 'uploader')
      this.channel.bind('upload-completed', this.onUploadCompleted)
      this.channel.bind('upload-failed', this.onUploadFailed)
    } else {
      this.startPollingStatus()
    }
  },

  startPollingStatus: function () {
    this.pollStatus()
    this._pollIntervalId = setInterval(this.pollStatus, 200)
  },

  pollStatus: function () {
    $.ajax({
      url: this.url,
      data: {
        file: this.get('filename')
      },
      success: this.onStatus
    })
  },

  onStartedAt: function () {
    if (this.pusherApiKey) {
      // we connect to pusher right when it starts uploading, so that it is
      // connected when it finishes.
      this.pusher()
    }
  },

  onDone: function () {
    !_(this.pusherApiKey).isUndefined() ? this.waitForPusher() : this.startPollingStatus()
  },

  onUploadCompleted: function () {
    this.set({ finished: true })

    this.channel.unbind('upload-completed', this.onUploadCompleted)
    this.channel.unbind('upload-failed', this.onUploadFailed)
  },

  onUploadFailed: function (data) {
    this.set({ error: data })

    this.channel.unbind('upload-completed', this.onUploadCompleted)
    this.channel.unbind('upload-failed', this.onUploadFailed)
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
    }

    return pusherInstance
  }
}, {
  pusherInstances: []
})
