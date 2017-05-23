"use babel"

import gravatar from 'gravatar'
import open from 'open'
import moment from 'moment'
import { CompositeDisposable } from 'atom'
import blame from './utils/blame'
import getCommit from './utils/get-commit'
import getCommitLink from './utils/get-commit-link'
import throttle from './utils/throttle'
import Rainbow from 'color-rainbow'

class BlameGutterView {

  constructor(state, editor) {

    this.state = state
    this.editor = editor
    this.listeners = {}

    this.state.width = atom.config.get('blame.defaultWidth')
    this.setGutterWidth(this.state.width)

    this.colors = {}
    this.gutter = this.editor.addGutter({ name: 'blame' })
    this.markers = []

    this.editorElement = atom.views.getView(this.editor)

    this.setVisible(true)
  }

  toggleVisible() {
    this.setVisible(!this.visible)
  }

  setVisible(visible) {
    this.visible = visible

    if (this.editor.isModified()) { this.visible = false }

    if (this.visible) {
      this.update()

      if (!this.disposables) { this.disposables = new CompositeDisposable() }
      this.disposables.add(this.editor.onDidSave(() => this.update()))

      this.gutter.show()

      this.scrollListener = this.editorElement.onDidChangeScrollTop(
        throttle(() => this.hideTooltips(), 500)
      )

    } else {
      if (this.scrollListener) { this.scrollListener.dispose() }
      this.gutter.hide()

      if (this.disposables) { this.disposables.dispose() }
      this.disposables = null
      this.removeAllMarkers()
    }
  }

  hideTooltips() {
    // Trigger resize event on window to hide tooltips
    window.dispatchEvent(new Event('resize'))
  }

  update() {
    blame(this.editor.getPath(), (result) => {
      if (!this.visible) {
        return
      }

      this.removeAllMarkers()

      let lastHash = null
      let commitCount = 0

      if (!result) { return }
      
      const hashes = Object.keys(result)
        .reduce((hashes, key) => {
          const line = result[key]
          const hash = line.rev.replace(/\s.*/, '')

          if (hashes.indexOf(hash) === -1) {
            hashes.push(hash)
          }
          return hashes
        }, [])
      
      const rainbow = new Rainbow(hashes.length)
      const hashColors = hashes.reduce((colors, hash) => {
        colors[hash] = `rgba(${rainbow.next().values.rgb.join(',')}, 0.4)`
        return colors
      }, {})

      Object.keys(result).forEach(key => {
        const line = result[key]

        let lineStr, rowCls
        const hash = line.rev.replace(/\s.*/, '')

        if (lastHash !== hash) {
          lineStr = this.formatTooltip(hash, line, hashColors[hash])
          rowCls = `blame-${(commitCount++ % 2 === 0) ? 'even' : 'odd'}`
        } else {
          lineStr= ''
        }

        lastHash = hash

        this.addMarker(Number(key) - 1, hash, rowCls, lineStr, hashColors[hash])
      })
    })
  }

  formatTooltip(hash, line, color) {
    const dateFormat = atom.config.get('blame.dateFormat')
    const dateStr = moment(line.date, 'YYYY-MM-DD HH:mm:ss')
      .format(dateFormat)

    if (this.isCommited(hash)) {
      return atom.config.get('blame.gutterFormat')
        .replace('{hash}', `<span class="hash">${hash.substr(0, 8)}</span>`)
        .replace('{long-hash}', `<span class="hash">${hash}</span>`)
        .replace('{date}', `<span class="date">${dateStr}</span>`)
        .replace('{author}', `<span class="author">${line.author}</span>`)
    }

    return `${line.author}`
  }

  linkClicked(hash) {
    getCommitLink(this.editor.getPath(), hash.replace(/^[\^]/, ''), (link) => {
      if (link) {
        return open(link)
      }
      atom.notifications.addInfo("Unknown url.")
    })
  }

  copyClicked(hash) {
    atom.clipboard.write(hash)
  }

  formateDate(date) {
    date = new Date(date)
    const yyyy = date.getFullYear()
    let mm = date.getMonth() + 1
    if (mm < 10) { mm = `0${mm}` }

    let dd = date.getDate()
    if (dd < 10) { dd = `0${dd}` }

    return `${yyyy}-${mm}-${dd}`
  }

  addMarker(lineNo, hash, rowCls, lineStr, color) {
    const item = this.markerInnerDiv(rowCls, color)

    // no need to create objects and events on blank lines
    if (lineStr.length > 0) {
      if (this.isCommited(hash)) {
        item.appendChild(this.copySpan(hash))
        item.appendChild(this.linkSpan(hash))
      }
      item.appendChild(this.lineSpan(lineStr, hash))

      if (this.isCommited(hash)) {
        this.addTooltip(item, hash)
      }
    }

    item.appendChild(this.resizeHandleDiv())

    const marker = this.editor.markBufferRange([[lineNo, 0], [lineNo, 0]])
    this.editor.decorateMarker(marker, {
      type: 'gutter',
      gutterName: 'blame',
      class: 'blame-gutter',
      item: item
    })
    this.markers.push(marker)
  }

  markerInnerDiv(rowCls, color) {
    const item = document.createElement('div')
    item.style.borderLeft = `6px solid ${color}`
    item.classList.add('blame-gutter-inner')
    if (rowCls) { item.classList.add(rowCls) }
    return item
  }

  resizeHandleDiv() {
    const resizeHandle = document.createElement('div')
    resizeHandle.addEventListener('mousedown', this.resizeStarted.bind(this))
    resizeHandle.classList.add('blame-gutter-handle')
    return resizeHandle
  }

  lineSpan(str, hash) {
    const span = document.createElement('span')
    span.innerHTML = str
    return span
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
    const span = document.createElement('span')
    span.setAttribute('data-hash', hash)
    span.classList.add('icon')
    span.classList.add(`icon-${key}`)
    span.addEventListener('click', listener)

    return span
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
    const sheet = document.createElement('style')
    sheet.type = 'text/css'
    sheet.id = 'blame-gutter-style'
    return sheet
  }

  setGutterWidth(width) {
    this.state.width = Math.max(50, Math.min(width, 500))

    let sheet = document.getElementById('blame-gutter-style')
    if (!sheet) {
      sheet = this.gutterStyle()
      document.head.appendChild(sheet)
    }

    sheet.innerHTML = `
      atom-text-editor .gutter[gutter-name="blame"] {
        width: ${this.state.width}px
      }
    `
  }

  isCommited(hash) {
    return !/^[0]+$/.test(hash)
  }

  addTooltip(item, hash) {

    if (!item.getAttribute('data-has-tooltip')) {
      item.setAttribute('data-has-tooltip', true)

      getCommit(this.editor.getPath(), hash.replace(/^[\^]/, ''), (msg) => {
        if (!this.visible) {
          return
        }

        const avatar = gravatar.url(msg.email, { s: 80 })
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
    this.setVisible(false)
    this.gutter.destroy()
    if (this.disposables) { this.disposables.dispose() }
  }
}

export default BlameGutterView
