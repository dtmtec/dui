describe("Uploader", function() {
  beforeEach(function() {
    jasmine.Ajax.useMock()
    uploader = new Uploader
  })

  it("should not be uploading", function() {
    expect(uploader.isUploading()).toBeFalsy()
  })

  it("should not be done", function() {
    expect(uploader.isDone()).toBeFalsy()
  })

  it("should not be finished", function() {
    expect(uploader.isFinished()).toBeFalsy()
  })

  it("should not have file", function() {
    expect(uploader.hasFile()).toBeFalsy()
  })

  describe("percentualProgress", function() {
    describe("when total is undefined", function() {
      it("returns 0", function() {
        expect(uploader.percentualProgress()).toBe(0)
      })
    })

    describe("when total is 0", function() {
      beforeEach(function() {
        uploader.set('total', 0)
      })

      it("returns 0", function() {
        expect(uploader.percentualProgress()).toBe(0)
      })
    })

    describe("when total greater than 0", function() {
      beforeEach(function() {
        uploader.set('total', 100)
      })

      describe("and the loaded is not defined", function() {
        it("returns 0", function() {
          expect(uploader.percentualProgress()).toBe(0)
        })
      })

      describe("and the loaded is 0", function() {
        beforeEach(function() {
          uploader.set('loaded', 0)
        })

        it("returns 0", function() {
          expect(uploader.percentualProgress()).toBe(0)
        })
      })

      describe("and the loaded is greater than 0", function() {
        it("returns loaded / total", function() {
          uploader.set('loaded', 10)
          expect(uploader.percentualProgress()).toBe(10 / 100)
        })
      })
    })
  })

  describe("loadedBytes", function() {
    describe("when size is undefined", function() {
      it("returns 0", function() {
        expect(uploader.loadedBytes()).toBe(0)
      })
    })

    describe("when size is defined", function() {
      beforeEach(function() {
        uploader.set({ size: 123456 })
      })

      describe("and percentualProgress() is 0.01, or 10%", function() {
        beforeEach(function() {
          spyOn(uploader, 'percentualProgress').andReturn(0.01)
        })

        it("returns 10% of the total bytes", function() {
          expect(uploader.loadedBytes()).toEqual(1234.56)
        })
      })
    })
  })

  describe("elapsedTime", function() {
    describe("when started_at is not defined", function() {
      it("returns 0", function() {
        expect(uploader.elapsedTime()).toEqual(0)
      })
    })

    describe("when started_at is defined", function() {
      beforeEach(function() {
        var now = new Date(),
            started_at = new Date(now.getFullYear(), now.getMonth(), now.getDate(),  now.getHours(), now.getMinutes() - 1, 0)


        uploader.set({ started_at: started_at })
      })

      it("returns the difference to now", function() {
        expect(uploader.elapsedTime()).toBeGreaterThan(0)
      })
    })
  })

  describe("meanUploadRate", function() {
    var elapsedTime, loadedBytes

    beforeEach(function() {
      elapsedTime = 123.456
      loadedBytes = 987654321
    })

    it("returns the division of loaded bytes per elapsedTime", function() {
      spyOn(uploader, 'elapsedTime').andReturn(elapsedTime)
      spyOn(uploader, 'loadedBytes').andReturn(loadedBytes)
      expect(uploader.meanUploadRate()).toEqual(loadedBytes/elapsedTime)
    })

    describe("when elapsed time is zero", function() {
      beforeEach(function() {
        elapsedTime = 0
      })

      it("returns 0", function() {
        spyOn(uploader, 'elapsedTime').andReturn(elapsedTime)
        spyOn(uploader, 'loadedBytes').andReturn(loadedBytes)
        expect(uploader.meanUploadRate()).toEqual(0)
      })
    })
  })

  describe("pusher", function() {
    it("does not create new instances of Pusher on other instances with the same API key", function() {
      var otherUploader = new Uploader

      uploader.pusherApiKey  = otherUploader.pusherApiKey  = '123'
      uploader.pusherChannel = otherUploader.pusherChannel = 'uploader-channel'

      expect(otherUploader.pusher()).toBe(uploader.pusher())
    })

    it("creates new instances of Pusher for other instances with a different API key", function() {
      var otherUploader = new Uploader

      uploader.pusherApiKey      = '123'
      otherUploader.pusherApiKey = '321'

      uploader.pusherChannel     = otherUploader.pusherChannel = 'uploader-channel'

      expect(otherUploader.pusher()).not.toBe(uploader.pusher())
    })

    describe("when the pusherApiKey is not defined", function() {
      it("cannot use pusher", function() {
        expect(uploader.canUsePusher()).toBeFalsy()
      })
    })

    describe("when the pusherApiKey is an empty string", function() {
      it("cannot use pusher", function() {
        uploader.pusherApiKey = ''
        expect(uploader.canUsePusher()).toBeFalsy()
      })
    })

    describe("when the pusherApiKey is defined", function() {
      it("can use pusher", function() {
        uploader.pusherApiKey = '123'
        expect(uploader.canUsePusher()).toBeTruthy()
      })
    })
  })

  describe("when it has started", function() {
    var called

    beforeEach(function() {
      called = false
      uploader.on('uploader:started', function () { called = true })
      uploader.set({ started_at: new Date })
    })

    it("should be uploading", function() {
      expect(uploader.isUploading()).toBeTruthy()
    })

    it("should not be done", function() {
      expect(uploader.isDone()).toBeFalsy()
    })

    it("should not be finished", function() {
      expect(uploader.isFinished()).toBeFalsy()
    })

    it("should not have file", function() {
      expect(uploader.hasFile()).toBeFalsy()
    })

    it("triggers a uploader:started event on the model", function() {
      expect(called).toBeTruthy()
    })
  })

  describe("when it is done", function() {
    var called

    function markAsDone() {
      uploader.set({
        started_at: new Date,
        filename: 'some-file.pdf',
        url: 'http://uploader/some-file.pdf',
        size: 123,
        done: true
      })
    }

    beforeEach(function() {
      called = false
    })

    it("should be uploading", function() {
      spyOn(uploader, "startPollingStatus")
      markAsDone()
      expect(uploader.isUploading()).toBeTruthy()
    })

    it("should be done", function() {
      spyOn(uploader, "startPollingStatus")
      markAsDone()
      expect(uploader.isDone()).toBeTruthy()
    })

    it("should not be finished", function() {
      spyOn(uploader, "startPollingStatus")
      markAsDone()
      expect(uploader.isFinished()).toBeFalsy()
    })

    it("should not have file", function() {
      spyOn(uploader, "startPollingStatus")
      markAsDone()
      expect(uploader.hasFile()).toBeFalsy()
    })

    it("triggers a uploader:done event on the model", function() {
      uploader.on('uploader:done', function () { called = true })

      spyOn(uploader, "startPollingStatus")
      markAsDone()
      expect(called).toBeTruthy()
    })

    describe("and pusherApiKey is set", function() {
      beforeEach(function() {
        uploader.pusherApiKey  = '123'
        uploader.pusherChannel = 'uploader-channel'
      })

      it("waits for pusher to update its status", function() {
        spyOn(uploader, "waitForPusher")
        markAsDone()
        expect(uploader.waitForPusher).toHaveBeenCalled()
      })

      describe("and a upload-completed message comes from pusher", function() {
        beforeEach(function() {
          uploader.on('uploader:finished', function () { called = true })
          Pusher.instances[0].connection.state = 'connected'
          markAsDone()
          Pusher.dispatch(uploader.pusherChannel, 'upload-completed', { name: 'some-file.pdf' })
        })

        it("sets finished to true", function() {
          expect(uploader.get('finished')).toBeTruthy()
        })

        it("should not be uploading", function() {
          expect(uploader.isUploading()).toBeFalsy()
        })

        it("should not be done", function() {
          expect(uploader.isDone()).toBeFalsy()
        })

        it("should be finished", function() {
          expect(uploader.isFinished()).toBeTruthy()
        })

        it("should have file", function() {
          expect(uploader.hasFile()).toBeTruthy()
        })

        it("triggers a uploader:finished event on the model", function() {
          expect(called).toBeTruthy()
        })
      })

      describe("and a upload-failed message comes from pusher", function() {
        var error = { message: 'some error' }

        beforeEach(function() {
          uploader.pusher()
          Pusher.instances[0].connection.state = 'connected'
          markAsDone()
          Pusher.dispatch(uploader.pusherChannel, 'upload-failed', error)
        })

        it("sets error to the value that came from pusher", function() {
          expect(uploader.get('error')).toEqual(error)
        })

        it("should not be uploading", function() {
          expect(uploader.isUploading()).toBeFalsy()
        })

        it("should not be done", function() {
          expect(uploader.isDone()).toBeFalsy()
        })

        it("should not be finished", function() {
          expect(uploader.isFinished()).toBeFalsy()
        })

        it("should not have file", function() {
          expect(uploader.hasFile()).toBeFalsy()
        })

        it("should clear the url", function() {
          expect(uploader.get('url')).toEqual('')
        })

        it("does not triggers a uploader:finished event", function() {
          expect(called).toBeFalsy();
        });
      })

      describe("and it cannot connect to pusher channel", function() {
        describe("because it failed to connect", function() {
          beforeEach(function() {
            Pusher.instances[0].connection.state = 'failed'
          })

          it("falls back to polling", function() {
            spyOn(uploader, "startPollingStatus")
            markAsDone()
            expect(uploader.startPollingStatus).toHaveBeenCalled()
          })
        })

        describe("because it is not available", function() {
          beforeEach(function() {
            Pusher.instances[0].connection.state = 'unavailable'
          })

          it("falls back to polling", function() {
            spyOn(uploader, "startPollingStatus")
            markAsDone()
            expect(uploader.startPollingStatus).toHaveBeenCalled()
          })
        })
      })
    })

    describe("and pusherApiKey is not set", function() {
      afterEach(function() {
        if (uploader._pollIntervalId) {
          clearInterval(uploader._pollIntervalId)
        }
      })

      it("starts polling its status from the URL set", function() {
        spyOn(uploader, "startPollingStatus")
        markAsDone()
        expect(uploader.startPollingStatus).toHaveBeenCalled()
      })

      it("calls pollStatus immediately", function() {
        spyOn(uploader, "pollStatus")
        markAsDone()
        expect(uploader.pollStatus).toHaveBeenCalled()
      })

      it("calls pollStatus after an interval", function() {
        uploader.url = 'http://uploder/upload'
        jasmine.Clock.useMock()
        markAsDone()

        spyOn($, 'ajax')
        jasmine.Clock.tick(201)

        expect($.ajax).toHaveBeenCalled()
      })

      describe("pollStatus", function() {
        beforeEach(function() {
          jasmine.Ajax.useMock()

          uploader.url = 'http://some-url'
          uploader.set({ filename: 'some-file.pdf', done: true })
        })

        it("polls for the status, passing the filename", function() {
          spyOn($, 'ajax')
          uploader.pollStatus()

          expect($.ajax).toHaveBeenCalledWith({
            url: uploader.url,
            dataType: 'json',
            data: {
              file: uploader.get('filename')
            },
            success: uploader.onStatus
          })
        })

        describe("when the dataType is given", function() {
          it("polls for the status, passing the filename", function() {
            spyOn($, 'ajax')
            uploader.dataType = 'jsonp'
            uploader.pollStatus()

            expect($.ajax).toHaveBeenCalledWith({
              url: uploader.url,
              dataType: 'jsonp',
              data: {
                file: uploader.get('filename')
              },
              success: uploader.onStatus
            })
          })
        })

        describe("and it has not yet finished uploading", function() {
          var data = { finished_uploading: false }

          it("does not set finished to true", function() {
            uploader.pollStatus()

            request = mostRecentAjaxRequest();
            request.response({status: 200, responseText: JSON.stringify(data)})

            expect(uploader.get('finished')).toBeFalsy()
          })

          it("continues polling", function() {
            uploader._pollIntervalId = '123'
            uploader.pollStatus()

            request = mostRecentAjaxRequest();
            request.response({status: 200, responseText: JSON.stringify(data)})

            expect(uploader._pollIntervalId).toBeDefined()
          })
        })

        describe("and it has finished uploading", function() {
          var data = { finished_uploading: true }

          beforeEach(function () {
            uploader.set({ filename: 'some-file.pdf', url: 'http://uploader/path', size: 123 })
            uploader._pollIntervalId = '123'
            uploader.pollStatus()

            request = mostRecentAjaxRequest();
            request.response({status: 200, responseText: JSON.stringify(data)})
          })

          it("sets finished to true", function() {
            expect(uploader.get('finished')).toBeTruthy()
          })

          it("should not be uploading", function() {
            expect(uploader.isUploading()).toBeFalsy()
          })

          it("should not be done", function() {
            expect(uploader.isDone()).toBeFalsy()
          })

          it("should be finished", function() {
            expect(uploader.isFinished()).toBeTruthy()
          })

          it("should have file", function() {
            expect(uploader.hasFile()).toBeTruthy()
          })

          it("does not continue polling", function() {
            expect(uploader._pollIntervalId).toBeUndefined()
          })
        })
      })
    })
  })

  describe("when it has filename, url and size", function () {
    it("should have file", function() {
      uploader.set({ filename: 'foo.png', url: 'http://somedomain.com/foo.png', size: 123 })
      expect(uploader.hasFile()).toBeTruthy()
    })
  })

  describe("abort", function() {
    it("resets the model", function() {
      spyOn(uploader, 'reset')
      uploader.abort()
      expect(uploader.reset).toHaveBeenCalled()
    })

    it("clears the poll interval", function() {
      uploader._pollIntervalId = '123'
      uploader.abort()
      expect(uploader._pollIntervalId).toBeUndefined()
    })

    it("unbinds from channel", function() {
      spyOn(uploader, '_unbindFromChannel')
      uploader.abort()
      expect(uploader._unbindFromChannel).toHaveBeenCalled()
    })
  })

  describe("reset", function() {
    beforeEach(function() {
      uploader.reset()
    })

    it("triggers a uploader:reset event on the model", function() {
      var called = false
      uploader.on('uploader:reset', function () { called = true })

      uploader.reset()
      expect(called).toBeTruthy()
    })

    it("sets started_at to undefined", function() {
      expect(uploader.get('started_at')).toBeUndefined()
    })

    it("sets filename to undefined", function() {
      expect(uploader.get('filename')).toBeUndefined()
    })

    it("sets size to undefined", function() {
      expect(uploader.get('size')).toBeUndefined()
    })

    it("sets url to ''", function() {
      expect(uploader.get('url')).toEqual('')
    })

    it("sets loaded to 0", function() {
      expect(uploader.get('loaded')).toEqual(0)
    })

    it("sets total to 0", function() {
      expect(uploader.get('total')).toEqual(0)
    })

    it("sets error to undefined", function() {
      expect(uploader.get('error')).toBeUndefined()
    })

    it("sets done to false", function() {
      expect(uploader.get('done')).toBeFalsy()
    })

    it("sets finished to false", function() {
      expect(uploader.get('finished')).toBeFalsy()
    })
  })
})
