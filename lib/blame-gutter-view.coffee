blame = require './utils/blame'
getCommit = require './utils/get-commit'
getCommitLink = require './utils/get-commit-link'
gravatar = require 'gravatar'
open = require 'open'
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

      @disposables ?= new CompositeDisposable
      @disposables.add @editor.onDidSave => @update()

      @gutter.show()

    else
      @gutter.hide()

      @disposables?.dispose()
      @disposables = null

      @removeAllMarkers()

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

          if @isCommited(hash)
            lineStr = "#{hash} #{dateStr} #{line.author}"
          else
            lineStr = "#{line.author}"

          if commitCount++ % 2 is 0
            rowCls = 'blame-even'
          else
            rowCls = 'blame-odd'
        else
          lineStr= ''

        lastHash = hash

        @addMarker idx, hash, rowCls, lineStr

  linkClicked: (hash) ->
    getCommitLink @editor.getPath(), hash.replace(/^[\^]/, ''), (link) ->
      if link
        open link
      else
        atom.notifications.addInfo "Unknown url."

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
      if @isCommited hash
        item.appendChild(@copySpan hash)
        item.appendChild(@linkSpan hash)
      item.appendChild(@lineSpan lineStr, hash)

      if @isCommited(hash)
        item.addEventListener 'mouseenter',  => @showCommit(item, hash)

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
    return span

  copySpan: (hash) ->
    span = document.createElement('span')
    span.setAttribute('data-hash', hash)
    span.classList.add 'icon'
    span.classList.add 'icon-copy'
    span.addEventListener 'click', @copyClicked
    return span

  linkSpan: (hash) ->
    span = document.createElement('span')
    span.setAttribute('data-hash', hash)
    span.classList.add 'icon'
    span.classList.add 'icon-link'
    span.addEventListener 'click', => @linkClicked(hash)
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

  isCommited: (hash) -> not /^[0]+$/.test hash

  showCommit: (item, hash) ->

    if !item.getAttribute('data-has-tooltip')
      item.setAttribute('data-has-tooltip', true)

      msgItem = document.createElement('div')
      msgItem.classList.add 'blame-tooltip'

      @disposables.add atom.tooltips.add item, title: msgItem

      getCommit @editor.getPath(), hash.replace(/^[\^]/, ''), (msg) ->
        avatar = gravatar.url(msg.email, { s: 80 })
        msgItem.innerHTML = """
          <div class="head">
            <img class="avatar" src="http:#{avatar}"/>
            <div class="subject">#{msg.subject}</div>
            <div class="author">#{msg.author}</div>
          </div>
          <div class="body">#{msg.message}</div>
        """

  deactivate: ->
    @disposables?.dispose()

module.exports = BlameGutterView
