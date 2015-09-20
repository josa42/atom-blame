# GitBlameMe = require '../lib/blame'

# Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
#
# To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
# or `fdescribe`). Remove the `f` to unfocus the block.

describe 'Blame', ->
  [workspaceElement, activationPromise, editorElement] = []

  activeGutterElement = () ->

    editor = atom.workspace.getActiveTextEditor()
    editorElement = atom.views.getView(editor)
    gutterElement = editorElement.shadowRoot
      .querySelector('.gutter[gutter-name=blame]')

    return gutterElement

  beforeEach ->
    workspaceElement = atom.views.getView(atom.workspace)
    activationPromise = atom.packages.activatePackage('blame')

  describe 'when the blame:toggle event is triggered', ->
    it 'hides and shows the gutter', ->

      waitsForPromise -> atom.workspace.open('empty.txt')

      waitsForPromise ->

        expect(activeGutterElement()).not.toExist()

        atom.commands.dispatch workspaceElement, 'blame:toggle'

        return activationPromise

      runs ->

        gutterElement = activeGutterElement()
        expect(gutterElement).toExist()
        expect(gutterElement.style.display).toBe ''

        atom.commands.dispatch workspaceElement, 'blame:toggle'

        expect(gutterElement.style.display).toBe 'none'

  describe 'when when package is deativated', ->
    it 'removes the gutter', ->

      waitsForPromise -> atom.workspace.open('empty.txt')

      waitsForPromise ->

        expect(activeGutterElement()).not.toExist()

        atom.commands.dispatch workspaceElement, 'blame:toggle'

        return activationPromise

      runs ->

        expect(activeGutterElement()).toExist()
        atom.packages.deactivatePackage('blame')

        expect(activeGutterElement()).not.toExist()
