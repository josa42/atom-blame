"use babel"

import gravatar from 'gravatar'
import open from 'open'
import moment from 'moment';
import { CompositeDisposable } from 'atom'
import providerFactory from './provider/factory'
import createElement from './utils/create-element'

class BlameGutterView {

  constructor(state, editor) {
    this.state = state
    this.editor = editor
    this.listeners = {}

    this.state.width = atom.config.get('blame.defaultWidth')
    this.setGutterWidth(this.state.width)

    this.provider = providerFactory(this.editor.getPath())

    this.gutter = this.editor.addGutter({ name: 'blame' })
    this.markers = []

    this.setVisible(true)
  }

  toggleVisible() {
    this.setVisible(!this.visible)
  }

  setVisible(visible) {

    if (!this.provider) {
      visible = false
    }

    this.visible = visible

    if (this.editor.isModified()) { this.visible = false }

    if (this.visible) {
      this.update()

      if (!this.disposables) { this.disposables = new CompositeDisposable() }
      this.disposables.add(this.editor.onDidSave(() => this.update()))

      this.gutter.show()

    } else {
      this.gutter.hide()

      if (this.disposables) { this.disposables.dispose() }
      this.disposables = null
      this.removeAllMarkers()
    }
  }

  update() {

    this.provider.blame((result) => {
      this.removeAllMarkers()

      var lastHash = null
      var commitCount = 0

      if (!result) { return }

      Object.keys(result).forEach((lineNumber) => {
        const line = result[lineNumber];

        var lineStr;
        var hash = line.rev.replace(/\s.*/, '')

        if (lastHash !== hash) {
          lineStr = this.formatGutter(hash, line)
          rowCls = `blame-${(commitCount++ % 2 === 0) ? 'even' : 'odd'}`
        } else {
          lineStr= ''
        }

        lastHash = hash

        this.addGutter(Number(lineNumber) - 1, hash, rowCls, lineStr)
      })
    })
  }

  formatGutter(hash, line) {
    var dateFormat = atom.config.get('blame.dateFormat');
    var dateStr = moment(line.date, 'YYYY-MM-DD HH:mm:ss')
      .format(dateFormat);

    if (this.isCommited(hash)) {
      return atom.config.get('blame.gutterFormat')
        .replace('{hash}', `<span class="hash">${hash}</span>`)
        .replace('{date}', `<span class="date">${dateStr}</span>`)
        .replace('{author}', `<span class="author">${line.author}</span>`);
    }

    return `${line.author}`
  }

  linkClicked(hash) {
    this.provider.getCommitLink(hash.replace(/^[\^]/, ''), (link) => {
      if (link) {
        return open(link)
      }
      atom.notifications.addInfo("Unknown url.")
    })
  }

  copyClicked(hash) {
    atom.clipboard.write(hash)
  }

  addMarker(lineNo, hash, rowCls, lineStr) {
    item = this.markerInnerDiv(rowCls)

    // no need to create objects and events on blank lines
    if (lineStr.length > 0) {
      if (this.isCommited(hash)) {
        if (this.provider.supports('copy')) {
          item.appendChild(this.copySpan(hash))
        }
        if (this.provider.supports('link')) {
          item.appendChild(this.linkSpan(hash))
        }
      }
      item.appendChild(this.lineSpan(lineStr, hash))

      if (this.isCommited(hash)) {
        this.addTooltip(item, hash)
      }
    }

    item.appendChild(this.resizeHandleDiv())

    marker = this.editor.markBufferRange([[lineNo, 0], [lineNo, 0]])
    this.editor.decorateMarker(marker, {
      type: 'gutter',
      gutterName: 'blame',
      class: 'blame-gutter',
      item: item
    })
    this.markers.push(marker)
  }

  markerInnerDiv(rowCls) {
    return createElement('div', {
      classes: [ 'blame-gutter-inner', rowCls ]
    })
  }

  resizeHandleDiv() {
    return createElement('div', {
      classes: [ 'blame-gutter-handle' ],
      events: { mousedown: this.resizeStarted.bind(this) }
    })
  }

  lineSpan(str, hash) {
    return createElement('div', { inner: str })
  }

  copySpan(hash) {
    return this.iconSpan(hash, 'copy', () => {
      this.copyClicked(hash)
    })
  }

  linkSpan(hash) {
    return this.iconSpan(hash, 'link', () => {
      this.linkClicked(hash)
    })
  }

  iconSpan(hash, key, listener) {
    return createElement('span', {
      classes: [ 'icon', `icon-${key}` ],
      attributes: { 'data-hash': hash },
      events: { click: listener }
    })
  }

  removeAllMarkers() {
    this.markers.forEach(marker => marker.destroy())
    this.markers = []
  }

  resizeStarted(e) {
    this.bind('mousemove', this.resizeMove)
    this.bind('mouseup', this.resizeStopped)

    this.resizeStartedAtX = e.pageX
    this.resizeWidth = this.state.width
  }

  resizeStopped(e) {
    this.unbind('mousemove')
    this.unbind('mouseup')

    e.stopPropagation()
    e.preventDefault()
  }

  bind(event, listener) {
    this.unbind(event)
    this.listeners[event] = listener.bind(this)
    document.addEventListener(event, this.listeners[event])
  }

  unbind(event) {
    if (this.listeners[event]) {
      document.removeEventListener(event, this.listeners[event])
      this.listeners[event] = false
    }
  }

  resizeMove(e) {
    diff = e.pageX - this.resizeStartedAtX
    this.setGutterWidth(this.resizeWidth + diff)

    e.stopPropagation()
    e.preventDefault()
  }

  gutterStyle() {
    sheet = document.createElement('style')
    sheet.type = 'text/css'
    sheet.id = 'blame-gutter-style'

    return sheet
  }

  setGutterWidth(width) {
    this.state.width = Math.max(50, Math.min(width, 500))

    sheet = document.getElementById('blame-gutter-style')
    if (!sheet) {
      sheet = this.gutterStyle()
      document.head.appendChild(sheet)
    }

    sheet.innerHTML = `
      atom-text-editor::shadow .gutter[gutter-name="blame"] {
        width: ${this.state.width}px;
      }
    `
  }

  isCommited(hash) {
    return !/^[0]+$/.test(hash)
  }

  addTooltip(item, hash) {

    if (!item.getAttribute('data-has-tooltip')) {
      item.setAttribute('data-has-tooltip', true)

      this.provider.getCommit(hash.replace(/^[\^]/, ''), (msg) => {
        avatar = gravatar.url(msg.email, { s: 80 })
        this.disposables.add(atom.tooltips.add(item, {
          title: `
            <div class="blame-tooltip">
              <div class="head">
                <img class="avatar" src="http:${avatar}"/>
                <div class="subject">${msg.subject}</div>
                <div class="author">${msg.author}</div>
              </div>
              <div class="body">${msg.message.replace('\n', '<br>')}</div>
            </div>
          `
        }))
      })
    }
  }

  dispose() {
    this.gutter.destroy()
    if (this.disposables) { this.disposables.dispose() }
  }
}

export default BlameGutterView
