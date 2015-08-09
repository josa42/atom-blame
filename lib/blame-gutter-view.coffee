blame = require './utils/blame'
{CompositeDisposable} = require 'atom'

class BlameGutterView

  constructor: (@state, @editor) ->
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
          dateStr = @formateDate(line.date)
          lineStr = "#{hash} #{dateStr} #{line.author}"
          if commitCount++ % 2 is 0
            rowCls = 'blame-even'
          else
            rowCls = 'blame-odd'
        else
          lineStr= ''

        lastHash = hash

        @addMarker idx, hash, rowCls, lineStr

  itemClicked: (hash) ->

  copyClicked: (event) ->
    hash = event.path[0].getAttribute('data-hash')
    atom.clipboard.write hash

  formateDate: (date) ->
    date = new Date date
    yyyy = date.getFullYear()
    mm = date.getMonth() + 1
    mm = "0#{mm}" if mm < 10
    dd = date.getDate()
    dd = "0#{dd}" if dd < 10

    return "#{yyyy}-#{mm}-#{dd}"

  addMarker: (lineNo, hash, rowCls, lineStr) ->
    item = @markerInnerDiv rowCls

    # no need to create objects and events on blank lines
    if lineStr.length > 0
      item.appendChild(@copySpan hash)
      item.appendChild(@lineSpan lineStr, hash)

    item.appendChild @resizeHandleDiv()

    marker = @editor.markBufferRange([[lineNo, 0], [lineNo, 0]])
    @editor.decorateMarker marker, {
      type: 'gutter'
      gutterName: 'blame'
      class: 'blame-gutter'
      item: item
    }
    @markers.push marker

  markerInnerDiv: (rowCls)  ->
    item = document.createElement('div')
    item.classList.add 'blame-gutter-inner'
    item.classList.add rowCls
    return item

  resizeHandleDiv: ->
    resizeHandle = document.createElement('div')
    resizeHandle.addEventListener 'mousedown', @resizeStarted
    resizeHandle.classList.add 'blame-gutter-handle'
    return resizeHandle

  lineSpan: (str, hash) ->
    span = document.createElement('span')
    span.innerHTML = str
    span.addEventListener 'click', => @itemClicked(hash)
    return span

  copySpan: (hash) ->
    span = document.createElement('span')
    span.setAttribute('data-hash', hash)
    span.classList.add 'icon-copy'
    span.addEventListener 'click', @copyClicked
    return span

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

  gutterStyle: ->
    sheet = document.createElement('style')
    sheet.type = 'text/css'
    sheet.id = 'blame-gutter-style'
    return sheet

  resizeMove: (e) =>
    diff = e.pageX - @resizeStartedAtX
    @setGutterWidth(@resizeWidth + diff)

    e.stopPropagation()
    e.preventDefault()

  setGutterWidth: (width) ->
    @state.width = Math.max(50, Math.min(width, 500))

    sheet = document.getElementById('blame-gutter-style')
    unless sheet
      sheet = @gutterStyle()
      document.head.appendChild sheet

    sheet.innerHTML = """
      atom-text-editor::shadow .gutter[gutter-name="blame"] {
        width: #{@state.width}px;
      }
    """

  deactivate: ->
    @subscriptions.dispose()

module.exports = BlameGutterView
