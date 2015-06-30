moment = require 'moment'
blame = require './utils/blame'
{CompositeDisposable} = require 'atom'

class BlameGutterView

  constructor: (@editor) ->

    @colors = {}
    @gutter = @editor.addGutter( name: 'blame' )
    @markers = []

    @setVisible(yes)

  toggleVisible: ->
    @setVisible(not @visible)

  setVisible: (@visible) ->
    if @editor.isModified() then @visible = no

    if @visible
      @update()
      @subscriptions ?= new CompositeDisposable
      @subscriptions.add @editor.onDidSave => @update()
      @gutter.show()

    else
      @gutter.hide()
      @removeAllMarkers()
      @subscriptions?.dispose()
      @subscriptions = null

  update: () ->

    blame @editor.getPath(), (result) =>

      @removeAllMarkers()

      blameLines = []
      lastHash = null

      commitCount = 0
      commitColor = null

      for key, line of result
        idx = Number(key) - 1
        hash = line.rev.replace(/\s.*/, '')

        unless lastHash is hash
          dateStr = @formateData(line.date)
          lineStr = "#{hash} #{dateStr} #{line.author}"
          if commitCount++ % 2 is 0
            rowCls = 'blame-even'
          else
            rowCls = 'blame-odd'
        else
          lineStr = '<br>'

        lastHash = hash

        @addMarker idx, hash, rowCls, lineStr

  itemClicked: (hash) ->

  formateData: (date) ->
    date = new Date date
    yyyy = date.getFullYear()
    mm = date.getMonth() + 1
    mm = "0#{mm}" if mm < 10
    dd = date.getDate()
    dd = "0#{dd}" if dd < 10

    return yyyy + '-' + mm + '-' + dd

  addMarker: (lineNo, hash, rowCls, lineStr) ->
    item = document.createElement('div')
    item.classList.add 'blame-gutter-inner'
    item.classList.add rowCls
    item.innerHTML = lineStr

    item.addEventListener 'click', => @itemClicked(hash)

    marker = @editor.markBufferRange([[lineNo, 0], [lineNo, 0]])
    @editor.decorateMarker marker, {
      type: 'gutter'
      gutterName: 'blame'
      class: 'blame-gutter'
      item: item
    }
    @markers.push marker

  removeAllMarkers: ->
    marker.destroy() for marker in @markers
    @markers = []

  deactivate: ->
    @subscriptions.dispose()

module.exports = BlameGutterView
