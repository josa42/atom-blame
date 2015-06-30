{CompositeDisposable} = require 'atom'
BlameGutterView = require './blame-gutter-view'

# https://github.com/atom/atom/pull/5217
module.exports = GitBlameMe =
  gitBlameMeView: null
  modalPanel: null
  subscriptions: null

  activate: (state) ->

    @gutters = new Map

    atom.commands.add 'atom-workspace',
      'blame:toggle': => @toggleBlameGutter()

  toggleBlameGutter: ->

    editor = atom.workspace.getActiveTextEditor()
    # return unless editor

    gutter = @gutters.get(editor)

    if gutter
      gutter.toggleVisible()
    else
      gutter = new BlameGutterView(editor)
      @gutters.set(editor, gutter)

  deactivate: ->

  serialize: ->
