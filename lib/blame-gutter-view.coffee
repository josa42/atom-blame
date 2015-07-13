blame = require './utils/blame'
{CompositeDisposable} = require 'atom'

class BlameGutterView

  constructor: (@state, @editor) ->

    #unless @state.width
    @state.width = atom.config.get('blame.defaultWidth')
    @setGutterWidth @state.width

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
          neStr= 'removebr>'

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

    resizeHandle = document.createElement('div')
    resizeHandle.addEventListener 'mousedown', @resizeStarted
    resizeHandle.classList.add 'blame-gutter-handle'

    item.appendChild resizeHandle

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


  resizeStarted: (e) =>
    document.addEventListener 'mousemove', @resizeMove
    document.addEventListener 'mouseup', @resizeStopped
    @resizeStartedAtX = e.pageX
    @resizeWidth = @state.width

  resizeStopped: (e) =>
    document.removeEventListener 'mousemove', @resizeMove
    document.removeEventListener 'mouseup', @resizeStopped

    e.stopPropagation()
    e.preventDefault()

  resizeMove: (e) =>
    diff = e.pageX - @resizeStartedAtX
    @setGutterWidth(@resizeWidth + diff)

    e.stopPropagation()
    e.preventDefault()

  setGutterWidth: (width) ->
    @state.width = Math.max(50, Math.min(width, 500));

    sheet = document.getElementById('blame-gutter-style')
    unless sheet
      sheet = document.createElement('style')
      sheet.type = 'text/css'
      sheet.id = 'blame-gutter-style'

      document.head.appendChild sheet

    sheet.innerHTML = "
      atom-text-editor::shadow .gutter[gutter-name=\"blame\"] {
        width: #{@state.width}px;
      }
    "


  deactivate: ->
    @subscriptions.dispose()

module.exports = BlameGutterView