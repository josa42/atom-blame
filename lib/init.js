'use babel'

import { CompositeDisposable } from 'atom'
import BlameGutterView from './blame-gutter-view'

export default {
  gitBlameMeView: null,
  modalPanel: null,
  subscriptions: null,

  config: {
    gutterFormat: {
      title: 'Format (gutter)',
      description: 'Placeholders: `{hash}`, `{date}` and `{author}.`',
      type: 'string',
      default: '{hash} {date} {author}'
    },
    dateFormat: {
      title: 'Format (date)',
      description: [
        'Placeholders: `YYYY` (year), `MM` (month), `DD` (day), `HH` (hours), `mm` (minutes).',
        'See [momentjs documentation](http://momentjs.com/docs/#/parsing/string-format/) for mor information.'
      ].join('<br>'),
      type: 'string',
      default: 'YYYY-MM-DD'
    },
    defaultWidth: {
      title: 'Default width (px)',
      type: 'integer',
      default: 250,
      minimum: 50,
      maximum: 500
    },
    ignoreWhitespace: {
      type: 'boolean',
      default: true
    },
    detectMoved: {
      type: 'boolean',
      default: true
    },
    detectCopy: {
      type: 'boolean',
      default: true
    }
  },

  activate (state = {}) {
    this.state = state
    this.gutters = new Map()
    this.disposables = new CompositeDisposable()

    this.disposables.add(atom.commands.add('atom-workspace', {
      'blame:toggle': () => this.toggleBlameGutter()
    }))
  },

  toggleBlameGutter () {
    const editor = atom.workspace.getActiveTextEditor()
    if (!editor) { return }

    let gutter = this.gutters.get(editor)
    if (gutter) {
      gutter.toggleVisible()
    } else {
      gutter = new BlameGutterView(this.state, editor)
      this.disposables.add(gutter)
      this.gutters.set(editor, gutter)
    }
  },

  deactivate () {
    this.disposables.dispose()
  },

  serialize () {
    return this.state
  }
}
