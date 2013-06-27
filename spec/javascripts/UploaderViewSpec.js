describe("UploaderView", function() {
  var uploader, uploader_view, data, widget, url, options,
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

    uploader_view = new UploaderView({
      el: $uploaderElement
    })

    widget = $fileInputElement.data('fileupload')
  })

  function triggerProgressAllEvent(loaded, total) {
    var event = $.Event('progress', {
      lengthComputable: true,
      loaded: loaded,
      total: total
    })

    widget._trigger('progressall', event, { loaded: loaded, total: total })
  }

  it("initializes a fileupload widget on the input file element", function() {
    expect($fileInputElement.data('fileupload')).toBeDefined()
  })

  it("opens the file select dialog when clicking the button", function() {
    var clicked = false
    $fileInputElement.on('click', function () {
      clicked = true
    })

    $button.click()
    expect(clicked).toBeTruthy()
  })

  describe("default options for fileupload widget", function() {
    it("does not replace file input", function() {
      expect($fileInputElement.fileupload('option', 'replaceFileInput')).toBeFalsy()
    })

    it("does not allow a drop zone", function() {
      expect($fileInputElement.fileupload('option', 'dropZone')).not.toExist()
    })
  })

  describe("data attributes", function() {
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
      it("sends these params when uploading file with fileupload widget", function() {
        expect($fileInputElement.fileupload('option', 'formData')).toEqual($uploaderElement.data('uploader-params'))
      })
    })
  })

  describe("when a file is selected", function() {
    beforeEach(function() {
      data = {
        files: [{ name: 'some-file.pdf', size: 123456789 }]
      }

      $fileInputElement.fileupload('add', data)
    })

    it("starts uploading it", function() {
      expect($uploaderElement).toHaveClass('uploader-started')
      expect($uploaderElement).not.toHaveClass('uploader-failed')
      expect($uploaderElement).not.toHaveClass('uploader-done')
      expect($uploaderElement).not.toHaveClass('uploader-finished')
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
        progressWidth = $progress.css('width').replace('px', '')
        barWidth = $bar.css('width').replace('px', '')

        expect((barWidth / progressWidth) * 100).toEqual(10)
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

    describe("and the upload is done", function() {
      beforeEach(function() {
        triggerProgressAllEvent(100, 100)
        widget._trigger('done', null, {})
      })

      it("marks the uploader as done", function() {
        widget._trigger('done', null, {})

        expect($uploaderElement).not.toHaveClass('uploader-started')
        expect($uploaderElement).not.toHaveClass('uploader-failed')
        expect($uploaderElement).toHaveClass('uploader-done')
        expect($uploaderElement).not.toHaveClass('uploader-finished')
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

      describe("and the upload is finished in uploader server", function() {
        beforeEach(function() {
          uploader_view.model.set({ finished: true })
        })

        it("marks the uploader as finished", function() {
          expect($uploaderElement).not.toHaveClass('uploader-started')
          expect($uploaderElement).not.toHaveClass('uploader-failed')
          expect($uploaderElement).not.toHaveClass('uploader-done')
          expect($uploaderElement).toHaveClass('uploader-finished')
        })

        it("sets the filename as value of the hidden field inside the widget", function() {
          expect($filenameInputElement).toHaveValue(uploader_view.model.get('filename'))
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
      })

      it("displays the error message, defined in data-uploader-error-message", function() {
        widget._trigger('fail', null, {})
        expect($detailsElement.find('.uploader-error')).toHaveText($uploaderElement.data('uploader-error-message'))
      })
    })
  })
})
