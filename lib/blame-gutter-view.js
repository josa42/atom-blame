'use babel'

import gravatar from 'gravatar'
import open from 'open'
import moment from 'moment'
import { CompositeDisposable } from 'atom'
import providerFactory from './provider/factory'
import createElement from './utils/create-element'
import throttle from './utils/throttle'
import Rainbow from 'color-rainbow'

class BlameGutterView {
  constructor (state, editor) {
    this.state = state
    this.editor = editor
    this.listeners = {}

    this.state.width = atom.config.get('blame.defaultWidth')
    this.setGutterWidth(this.state.width)

    this.provider = providerFactory(this.editor.getPath())

    this.gutter = this.editor.addGutter({ name: 'blame' })
    this.markers = []

    this.editorElement = atom.views.getView(this.editor)

    this.setVisible(true)
  }

  toggleVisible () {
    this.setVisible(!this.visible)
  }

  setVisible (visible) {
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

  hideTooltips () {
    // Trigger resize event on window to hide tooltips
    window.dispatchEvent(new window.Event('resize'))
  }

  update () {
    this.provider.blame((result) => {
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

      Object.keys(result).forEach((lineNumber) => {
        const line = result[lineNumber]

        let lineStr, rowCls
        const hash = line.rev.replace(/\s.*/, '')

        if (lastHash !== hash) {
          lineStr = this.formatGutter(hash, line, hashColors[hash])
          rowCls = `blame-${(commitCount++ % 2 === 0) ? 'even' : 'odd'}`
        } else {
          lineStr = ''
        }

        lastHash = hash

        this.addMarker(Number(lineNumber) - 1, hash, rowCls, lineStr, hashColors[hash])
      })
    })
  }

  formatGutter (hash, line, color) {
    const dateFormat = atom.config.get('blame.dateFormat')
    const dateStr = moment(line.date)
      .format(dateFormat)

    if (this.isCommitted(hash)) {
      return atom.config.get('blame.gutterFormat')
        .replace('{hash}', `<span class="hash">${hash.substr(0, 8)}</span>`)
        .replace('{long-hash}', `<span class="hash">${hash}</span>`)
        .replace('{date}', `<span class="date">${dateStr}</span>`)
        .replace('{author}', `<span class="author">${line.author.name}</span>`)
    }

    return `${line.author}`
  }

  linkClicked (hash) {
    this.provider.getCommitLink(hash.replace(/^[\^]/, ''), (link) => {
      if (link) {
        return open(link)
      }
      atom.notifications.addInfo('Unknown url.')
    })
  }

  copyClicked (hash) {
    atom.clipboard.write(hash)
  }

  addMarker (lineNo, hash, rowCls, lineStr, color) {
    const item = this.markerInnerDiv(rowCls, hash, color)

    // no need to create objects and events on blank lines
    if (lineStr.length > 0) {
      let actionsCount = 0
      if (this.isCommitted(hash)) {
        if (this.provider.supports('copy')) {
          item.appendChild(this.copySpan(hash))
          actionsCount++
        }
        if (this.provider.supports('link')) {
          item.appendChild(this.linkSpan(hash))
          actionsCount++
        }
      }

      item.appendChild(this.lineSpan(lineStr, hash))
      item.classList.add(`action-count-${actionsCount}`)

      if (this.isCommitted(hash)) {
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

  markerInnerDiv (rowCls, hash, color) {
    const item = createElement('div', {
      classes: ['blame-gutter-inner', rowCls],
      events: {
        mouseover: () => this.highlight(hash),
        mouseout: () => this.highlight()
      }
    })

    item.style.borderLeft = `6px solid ${color}`
    item.dataset.hash = hash

    return item
  }

  highlight (hash = null) {
    [...document.getElementsByClassName('blame-gutter-inner')].forEach((item) => {
      if (item.dataset.hash === hash) {
        item.classList.add('highlight')
      } else {
        item.classList.remove('highlight')
      }
    })
  }

  resizeHandleDiv () {
    return createElement('div', {
      classes: ['blame-gutter-handle'],
      events: { mousedown: this.resizeStarted.bind(this) }
    })
  }

  lineSpan (str, hash) {
    return createElement('span', { inner: str })
  }

  copySpan (hash) {
    return this.iconSpan(hash, 'copy', () => {
      this.copyClicked(hash)
    })
  }

  linkSpan (hash) {
    return this.iconSpan(hash, 'link', () => {
      this.linkClicked(hash)
    })
  }

  iconSpan (hash, key, listener) {
    return createElement('span', {
      classes: ['icon', `icon-${key}`],
      attributes: { 'data-hash': hash },
      events: { click: listener }
    })
  }

  removeAllMarkers () {
    this.markers.forEach(marker => marker.destroy())
    this.markers = []
  }

  resizeStarted (e) {
    this.bind('mousemove', this.resizeMove)
    this.bind('mouseup', this.resizeStopped)

    this.resizeStartedAtX = e.pageX
    this.resizeWidth = this.state.width
  }

  resizeStopped (e) {
    this.unbind('mousemove')
    this.unbind('mouseup')

    e.stopPropagation()
    e.preventDefault()
  }

  bind (event, listener) {
    this.unbind(event)
    this.listeners[event] = listener.bind(this)
    document.addEventListener(event, this.listeners[event])
  }

  unbind (event) {
    if (this.listeners[event]) {
      document.removeEventListener(event, this.listeners[event])
      this.listeners[event] = false
    }
  }

  resizeMove (e) {
    const diff = e.pageX - this.resizeStartedAtX
    this.setGutterWidth(this.resizeWidth + diff)

    e.stopPropagation()
    e.preventDefault()
  }

  gutterStyle () {
    const sheet = document.createElement('style')
    sheet.type = 'text/css'
    sheet.id = 'blame-gutter-style'

    return sheet
  }

  setGutterWidth (width) {
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

  isCommitted (hash) {
    return !/^[0]+$/.test(hash)
  }

  addTooltip (item, hash) {
    if (!item.getAttribute('data-has-tooltip')) {
      item.setAttribute('data-has-tooltip', true)

      this.provider.getCommit(hash.replace(/^[\^]/, ''), (msg) => {
        if (!this.visible) {
          return
        }
        const avatar = this.avatarURL(msg.author.email, 80)
        let avatarCommitterStr = ''

        let authorStr = msg.author.name

        if (msg.committer) {
          if (msg.author.name !== msg.committer.name) {
            authorStr += ` | Committer: ${msg.committer.name}`
          }

          if (msg.author.email !== msg.committer.email) {
            avatarCommitterStr = `<img class="committer-avatar" src="${this.avatarURL(msg.committer.email, 40)}"/>`
          }
        }

        this.disposables.add(atom.tooltips.add(item, {
          title: `
            <div class="blame-tooltip">
              <div class="head">
                <img class="avatar" src="${avatar}"/>
                ${avatarCommitterStr}
                <div class="subject">${msg.subject}</div>
                <div class="author">${authorStr}</div>
              </div>
              <div class="body">${msg.message.replace('\n', '<br>')}</div>
            </div>
          `
        }))
      })
    }
  }

  avatarURL (email, size) {
    if (email === 'noreply@github.com') {
      return `https://github.com/github.png?size=${size}`
    }

    const match = email.match(/^(.+)@users\.noreply\.github\.com$/)
    if (match) {
      return `https://github.com/${match[1]}.png?size=${size}`
    }

    return `https:${gravatar.url(email, { s: size })}`
  }

  dispose () {
    this.setVisible(false)
    this.gutter.destroy()
    if (this.disposables) { this.disposables.dispose() }
  }
}

export default BlameGutterView
