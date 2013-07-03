describe("UploaderView", function() {
  var uploader, uploader_view, data, widget, url, options, messages,
      $button, $progress, $uploaderElement, $fileInputElement, $filenameInputElement,
      $detailsElement, barWidth, progressWidth, $bar

  beforeEach(function() {
    loadFixtures('uploader_view.html')

    $uploaderElement = $('.uploader')
    $fileInputElement = $uploaderElement.find('input:file')
    $filenameInputElement = $uploaderElement.find('input[type=hidden]')
    $detailsElement = $uploaderElement.find('.uploader-details')
    $button = $uploaderElement.find('[data-uploader-button]')
    $progress = $('.uploader-progress', $uploaderElement)
    $bar = $progress.find('.bar')

    messages = $uploaderElement.data('uploader-messages')
  })

  function createView() {
    uploader_view = new UploaderView({
      el: $uploaderElement
    })

    spyOn(uploader_view.model, 'startPollingStatus')

    widget = $fileInputElement.data('fileupload')
  }

  function triggerProgressAllEvent(loaded, total) {
    var event = $.Event('progress', {
      lengthComputable: true,
      loaded: loaded,
      total: total
    })

    widget._trigger('progressall', event, { loaded: loaded, total: total })
  }

  it("initializes a fileupload widget on the input file element", function() {
    createView()
    expect($fileInputElement.data('fileupload')).toBeDefined()
  })

  it("opens the file select dialog when clicking the button", function() {
    var clicked = false
    $fileInputElement.on('click', function () {
      clicked = true
    })

    createView()

    $button.click()
    expect(clicked).toBeTruthy()
  })

  describe("initial state", function() {
    beforeEach(createView)

    it("displays the initial message", function() {
      expect($detailsElement.find('.uploader-message')).toHaveText(messages.initial)
    })

    it("does not diplays the link to the file", function() {
      expect($detailsElement.find('.uploader-filename')).not.toBeVisible()
    })
  })

  describe("default options for fileupload widget", function() {
    beforeEach(createView)

    it("replaces file input", function() {
      expect($fileInputElement.fileupload('option', 'replaceFileInput')).toBeTruthy()
    })

    it("does not allow a drop zone", function() {
      expect($fileInputElement.fileupload('option', 'dropZone')).not.toExist()
    })
  })

  describe("data attributes", function() {
    beforeEach(createView)

    describe("data-uploader-url", function() {
      it("sets the URL to post the file on the fileupload widget", function() {
        expect($fileInputElement.fileupload('option', 'url')).toEqual($uploaderElement.data('uploader-url'))
      })
    })

    describe("data-uploader-iframe-redirect-url", function() {
      it("sets the redirect URL on the fileupload widget", function() {
        expect($fileInputElement.fileupload('option', 'redirect')).toEqual($uploaderElement.data('uploader-iframe-redirect-url'))
      })
    })

    describe("data-uploader-params", function() {
      it("sends these params when uploading file with fileupload widget, together with the pusherChannel", function() {
        var params = _($uploaderElement.data('uploader-params')).extend({
          channel: uploader_view.model.pusherChannel
        })

        expect($fileInputElement.fileupload('option', 'formData')).toEqual(params)
      })
    })

    describe("data-status-url", function() {
      it("sets the model url to its value", function() {
        expect(uploader_view.model.url).toEqual($uploaderElement.data('uploader-status-url'))
      })
    })

    describe("data-status-data-type", function() {
      it("sets the model dataType to its value", function() {
        expect(uploader_view.model.dataType).toEqual($uploaderElement.data('uploader-status-data-type'))
      })
    })

    describe("data-uploader-pusher-api-key", function() {
      it("sets model pusherApiKey with its value", function() {
        expect(uploader_view.model.pusherApiKey).toEqual($uploaderElement.data('uploader-pusher-api-key'))
      })
    })

    describe("data-uploader-pusher-channel", function() {
      it("sets model pusherChannel with its value", function() {
        expect(uploader_view.model.pusherChannel).toEqual($uploaderElement.data('uploader-pusher-channel'))
      })

      describe("when it has no value", function() {
        beforeEach(function() {
          $uploaderElement.removeAttr('data-uploader-pusher-channel')
                          .removeData('uploader-pusher-channel')

          spyOn(Math, "random").andReturn(0.123456789)
          createView()
        })

        it("generates one with a value of uploader-<6-digit-random-number>", function() {
          expect(uploader_view.model.pusherChannel).toEqual('uploader-123456')
        })
      })
    })
  })

  describe("when a file is selected", function() {
    beforeEach(function() {
      data = {
        files: [{ name: 'some-file.pdf', size: 123456789 }]
      }

      createView()

      $fileInputElement.fileupload('add', data)
    })

    it("disables the upload button", function() {
      var clicked = false
      $fileInputElement.on('click', function () {
        clicked = true // this should not be called
      })

      $button.click()
      expect(clicked).toBeFalsy()
    })

    it("starts uploading it", function() {
      expect($uploaderElement).toHaveClass('uploader-started')
      expect($uploaderElement).not.toHaveClass('uploader-failed')
      expect($uploaderElement).not.toHaveClass('uploader-done')
      expect($uploaderElement).not.toHaveClass('uploader-finished')
      expect($uploaderElement).not.toHaveClass('uploader-existing')
    })

    it("displays a link to the file with its filename", function() {
      expect($detailsElement.find('.uploader-filename')).toHaveText('some-file.pdf')
    })

    it("displays a textual progress of the upload, now at 0%", function() {
      expect($detailsElement.find('.uploader-percentual')).toHaveText('0%')
    })

    it("displays the loaded size of file, now at 0 bytes", function() {
      expect($detailsElement.find('.uploader-loaded-size')).toHaveText('0 bytes')
    })

    it("displays the total size of the file, in human readable format", function() {
      expect($detailsElement.find('.uploader-total-size')).toHaveText('117.74mb')
    })

    describe("and its progress is updated", function() {
      beforeEach(function() {
        triggerProgressAllEvent(10, 100)
      })

      it("changes the width of the progress bar", function() {
        progressWidth = parseInt($progress.css('width').replace('px', ''), 10)
        barWidth = parseInt($bar.css('width').replace('px', ''), 10)

        expect(Math.round((barWidth / progressWidth) * 100)).toEqual(10)
      })

      it("displays a textual progress of the upload, now at 10%", function() {
        expect($detailsElement.find('.uploader-percentual')).toHaveText('10%')
      })

      it("displays the loaded size of file, now at 11.77mb", function() {
        expect($detailsElement.find('.uploader-loaded-size')).toHaveText('11.77mb')
      })

      it("displays the total size of the file, in human readable format", function() {
        expect($detailsElement.find('.uploader-total-size')).toHaveText('117.74mb')
      })
    })

    describe("and the abort button is clicked", function() {
      beforeEach(function() {
        spyOn(uploader_view.model, 'abort').andCallThrough()
        spyOn(uploader_view.currentUpload, 'abort').andCallThrough()
        $uploaderElement.find('.uploader-remove-file').click()
      })

      it("aborts the upload", function() {
        expect(uploader_view.currentUpload.abort).toHaveBeenCalled()
        expect(uploader_view.model.abort).toHaveBeenCalled()
      })

      it("displays the initial message", function() {
        expect($detailsElement.find('.uploader-message')).toHaveText(messages.initial)
      })

      it("does not diplays the link to the file", function() {
        expect($detailsElement.find('.uploader-filename')).not.toBeVisible()
      })

      it("resets the uploader widget status", function() {
        expect($uploaderElement).not.toHaveClass('uploader-started')
        expect($uploaderElement).not.toHaveClass('uploader-failed')
        expect($uploaderElement).not.toHaveClass('uploader-done')
        expect($uploaderElement).not.toHaveClass('uploader-finished')
        expect($uploaderElement).not.toHaveClass('uploader-existing')
      })
    })

    describe("and the upload is done", function() {
      beforeEach(function() {
        url = 'http://google.com'
        triggerProgressAllEvent(100, 100)
        widget._trigger('done', null, { result: [{ url: url, size: 123456789 }] })
      })

      it("marks the uploader as done", function() {
        expect($uploaderElement).not.toHaveClass('uploader-started')
        expect($uploaderElement).not.toHaveClass('uploader-failed')
        expect($uploaderElement).toHaveClass('uploader-done')
        expect($uploaderElement).not.toHaveClass('uploader-finished')
        expect($uploaderElement).not.toHaveClass('uploader-existing')
      })

      it("displays a textual progress of the upload, now at 100%", function() {
        expect($detailsElement.find('.uploader-percentual')).toHaveText('100%')
      })

      it("displays the loaded size of file, now at 117.74mb", function() {
        expect($detailsElement.find('.uploader-loaded-size')).toHaveText('117.74mb')
      })

      it("displays the total size of the file, in human readable format", function() {
        expect($detailsElement.find('.uploader-total-size')).toHaveText('117.74mb')
      })

      it("saves the returned URL on the model", function() {
        expect(uploader_view.model.get('url')).toEqual(url)
      })

      describe("and the abort button is clicked", function() {
        beforeEach(function() {
          spyOn(uploader_view.model, 'abort').andCallThrough()
          spyOn(uploader_view.currentUpload, 'abort').andCallThrough()
          $uploaderElement.find('.uploader-remove-file').click()
        })

        it("aborts the upload", function() {
          expect(uploader_view.currentUpload.abort).toHaveBeenCalled()
          expect(uploader_view.model.abort).toHaveBeenCalled()
        })

        it("displays the initial message", function() {
          expect($detailsElement.find('.uploader-message')).toHaveText(messages.initial)
        })

        it("does not diplays the link to the file", function() {
          expect($detailsElement.find('.uploader-filename')).not.toBeVisible()
        })

        it("resets the uploader widget status", function() {
          expect($uploaderElement).not.toHaveClass('uploader-started')
          expect($uploaderElement).not.toHaveClass('uploader-failed')
          expect($uploaderElement).not.toHaveClass('uploader-done')
          expect($uploaderElement).not.toHaveClass('uploader-finished')
          expect($uploaderElement).not.toHaveClass('uploader-existing')
        })
      })

      describe("and the upload is finished in uploader server", function() {
        it("marks the uploader as finished", function() {
          uploader_view.model.set({ finished: true })
          expect($uploaderElement).not.toHaveClass('uploader-started')
          expect($uploaderElement).not.toHaveClass('uploader-failed')
          expect($uploaderElement).not.toHaveClass('uploader-done')
          expect($uploaderElement).toHaveClass('uploader-finished')
          expect($uploaderElement).not.toHaveClass('uploader-existing')
        })

        it("sets the filename as value of the hidden field inside the widget", function() {
          uploader_view.model.set({ finished: true })
          expect($filenameInputElement).toHaveValue(uploader_view.model.get('filename'))
        })

        it("triggers a uploader:finished event, with the model", function() {
          var calledWith

          uploader_view.on('uploader:finished', function (model) {
            calledWith = model
          })

          uploader_view.model.set({ finished: true })

          expect(calledWith).toEqual(uploader_view.model)
        })

        it("sets the url of the file on the widget", function() {
          uploader_view.model.set({ finished: true })
          expect($detailsElement.find('.uploader-filename').attr('href')).toEqual(url)
        })

        describe("and the remove button is clicked", function() {
          beforeEach(function() {
            spyOn(uploader_view.model, 'abort').andCallThrough()
            spyOn(uploader_view.currentUpload, 'abort').andCallThrough()

            uploader_view.model.set({ finished: true })
            $uploaderElement.find('.uploader-remove-file').click()
          })

          it("does not aborts the upload", function() {
            expect(uploader_view.currentUpload.abort).not.toHaveBeenCalled()
            expect(uploader_view.model.abort).not.toHaveBeenCalled()
          })

          it("clears the hidden field", function() {
            expect($filenameInputElement).toHaveValue('')
          })

          it("displays the initial message", function() {
            expect($detailsElement.find('.uploader-message')).toHaveText(messages.initial)
          })

          it("does not diplays the link to the file", function() {
            expect($detailsElement.find('.uploader-filename')).not.toBeVisible()
          })

          it("resets the uploader widget status", function() {
            expect($uploaderElement).not.toHaveClass('uploader-started')
            expect($uploaderElement).not.toHaveClass('uploader-failed')
            expect($uploaderElement).not.toHaveClass('uploader-done')
            expect($uploaderElement).not.toHaveClass('uploader-finished')
            expect($uploaderElement).not.toHaveClass('uploader-existing')
          })
        })
      })
    })

    describe("and an error occurs", function() {
      it("triggers an error event with the options of the widget fail event", function() {
        var errorCalled = false
        uploader_view.on('error', function (options) {
          errorCalled = options
        })

        options = { textStatus: 'some error', errorThrown: 'some error thrown' }
        widget._trigger('fail', null, options)

        expect(errorCalled).toEqual(options)
      })

      it("marks the uploader with error", function() {
        widget._trigger('fail', null, {})
        expect($uploaderElement).not.toHaveClass('uploader-started')
        expect($uploaderElement).toHaveClass('uploader-failed')
        expect($uploaderElement).not.toHaveClass('uploader-done')
        expect($uploaderElement).not.toHaveClass('uploader-finished')
        expect($uploaderElement).not.toHaveClass('uploader-existing')
      })

      it("displays the error message, defined in data-uploader-messages", function() {
        widget._trigger('fail', null, {})
        expect($detailsElement.find('.uploader-message')).toHaveText(messages.error)
      })
    })
  })

  describe("and a different file is selected after an upload has been started", function() {
    beforeEach(function() {
      createView()

      uploader_view.model.set({
        started_at: undefined,
        url: 'http://some-url',
        total: 123,
        loaded: 23,
        error: 'some error',
        done: true,
        finished: true
      })

      data = {
        files: [{ name: 'some-other-file.pdf', size: 2345 }]
      }

      $fileInputElement.fileupload('add', data)
    })

    it("defines a started_at, and clears all other values of the model", function() {
      expect(uploader_view.model.get('started_at')).toBeDefined()
      expect(uploader_view.model.get('url')).toEqual('')
      expect(uploader_view.model.get('total')).toEqual(0)
      expect(uploader_view.model.get('loaded')).toEqual(0)
      expect(uploader_view.model.get('error')).toBeUndefined()
      expect(uploader_view.model.get('done')).toBeFalsy()
      expect(uploader_view.model.get('finished')).toBeFalsy()
    })

    it("starts uploading it", function() {
      expect($uploaderElement).toHaveClass('uploader-started')
      expect($uploaderElement).not.toHaveClass('uploader-failed')
      expect($uploaderElement).not.toHaveClass('uploader-done')
      expect($uploaderElement).not.toHaveClass('uploader-finished')
      expect($uploaderElement).not.toHaveClass('uploader-existing')
    })

    it("displays a link to the file with its filename", function() {
      expect($detailsElement.find('.uploader-filename')).toHaveText('some-other-file.pdf')
    })

    it("displays a textual progress of the upload, now at 0%", function() {
      expect($detailsElement.find('.uploader-percentual')).toHaveText('0%')
    })

    it("displays the loaded size of file, now at 0 bytes", function() {
      expect($detailsElement.find('.uploader-loaded-size')).toHaveText('0 bytes')
    })

    it("displays the total size of the file, in human readable format", function() {
      expect($detailsElement.find('.uploader-total-size')).toHaveText('2.29kb')
    })
  })

  describe("when a data-uploader-file with filename, url and size is given", function() {
    beforeEach(function() {
      $uploaderElement.data({
        'uploader-file': {
          filename: 'some-given-file.pdf',
          url: 'http://someserver.com/some-given-file.pdf',
          size: 987654321
        }
      })

      createView()
    })

    it("displays the existing file data", function() {
      expect($uploaderElement).not.toHaveClass('uploader-started')
      expect($uploaderElement).not.toHaveClass('uploader-failed')
      expect($uploaderElement).not.toHaveClass('uploader-done')
      expect($uploaderElement).not.toHaveClass('uploader-finished')
      expect($uploaderElement).toHaveClass('uploader-existing')
    })

    it("displays a link to the file with its filename", function() {
      expect($detailsElement.find('.uploader-filename')).toHaveText('some-given-file.pdf')
    })

    it("sets the link to download file with the file url", function() {
      expect($detailsElement.find('.uploader-filename').attr('href')).toEqual('http://someserver.com/some-given-file.pdf')
    })

    it("sets the filename as value of the hidden field inside the widget", function() {
      expect($filenameInputElement).toHaveValue(uploader_view.model.get('filename'))
    })

    it("does not display the textual progress of the upload", function() {
      expect($detailsElement.find('.uploader-percentual')).not.toBeVisible()
    })

    it("does not display the loaded size of file", function() {
      expect($detailsElement.find('.uploader-loaded-size')).not.toBeVisible()
    })

    it("displays the total size of the file, in human readable format", function() {
      expect($detailsElement.find('.uploader-total-size')).toHaveText('941.9mb')
    })

    describe("and the remove button is clicked", function() {
      beforeEach(function() {
        $uploaderElement.find('.uploader-remove-file').click()
      })

      it("clears the hidden field", function() {
        expect($filenameInputElement).toHaveValue('')
      })

      it("displays the initial message", function() {
        expect($detailsElement.find('.uploader-message')).toHaveText(messages.initial)
      })

      it("does not diplays the link to the file", function() {
        expect($detailsElement.find('.uploader-filename')).not.toBeVisible()
      })

      it("resets the uploader widget status", function() {
        expect($uploaderElement).not.toHaveClass('uploader-started')
        expect($uploaderElement).not.toHaveClass('uploader-failed')
        expect($uploaderElement).not.toHaveClass('uploader-done')
        expect($uploaderElement).not.toHaveClass('uploader-finished')
        expect($uploaderElement).not.toHaveClass('uploader-existing')
      })
    })
  })

  describe("when it is reset", function() {
    it("triggers a uploader:reset event", function() {
      var calledWith
      uploader_view.on('uploader:reset', function (model) {
        calledWith = model
      })

      uploader_view.reset()
      expect(calledWith).toEqual(uploader_view.model)
    })
  })
})
