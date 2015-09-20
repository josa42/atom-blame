{CompositeDisposable} = require 'atom'
BlameGutterView = require './blame-gutter-view'

module.exports =
  gitBlameMeView: null
  modalPanel: null
  subscriptions: null

  config:
    defaultWidth:
      title: 'Default width (px)'
      type: 'integer'
      default: 250
      minimum: 50
      maximum: 500

  activate: (@state = {}) ->

    @gutters = new Map
    @disposables = new CompositeDisposable

    @disposables.add atom.commands.add 'atom-workspace', 'blame:toggle': =>
      @toggleBlameGutter()

  toggleBlameGutter: ->

    editor = atom.workspace.getActiveTextEditor()
    return unless editor

    gutter = @gutters.get(editor)

    if gutter
      gutter.toggleVisible()
    else
      gutter = new BlameGutterView(@state, editor)
      @disposables.add gutter
      @gutters.set(editor, gutter)

  deactivate: ->
    @disposables.dispose()

  serialize: -> @state
