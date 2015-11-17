"use babel"

import { CompositeDisposable } from 'atom'
import BlameGutterView from './blame-gutter-view'

export default {
  gitBlameMeView: null,
  modalPanel: null,
  subscriptions: null,

  config: {
    defaultWidth: {
      title: 'Default width (px)',
      type: 'integer',
      default: 250,
      minimum: 50,
      maximum: 500
    }
  },

  activate(state = {}) {
    this.state = state
    this.gutters = new Map()
    this.disposables = new CompositeDisposable()

    this.disposables.add(atom.commands.add('atom-workspace', {
      'blame:toggle': () => this.toggleBlameGutter()
    }))
  },

  toggleBlameGutter() {

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

  deactivate() {
    this.disposables.dispose()
  },

  serialize() {
    return this.state
  }
}
