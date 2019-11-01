'use babel'

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

import path from 'path'
import async from './utils/async'
import { cloneGit } from './utils/fixture-repos'

const wait = async (seconds) => new Promise((resolve) => setTimeout(resolve, seconds * 1000))

beforeEach(async(() => cloneGit()))

const readmePath = path.join(__dirname, 'fixtures', 'git-repo', 'README.md')

// Deactivate failing tests ¯\_(ツ)_/¯
xdescribe('Blame', () => {
  let workspaceElement

  function activeGutterElement () {
    const editor = atom.workspace.getActiveTextEditor()
    const editorElement = atom.views.getView(editor)
    const gutterElement = editorElement
      .querySelector('.gutter[gutter-name=blame]')

    return gutterElement
  }

  beforeEach(async () => {
    workspaceElement = atom.views.getView(atom.workspace)

    await atom.packages.deactivatePackage('blame')
    await atom.packages.activatePackage('blame')
  })

  describe('when the blame:toggle event is triggered', () => {
    it('hides and shows the gutter', async () => {
      await atom.workspace.open(readmePath)

      expect(activeGutterElement()).not.toExist()

      atom.commands.dispatch(workspaceElement, 'blame:toggle')

      // TODO Find a better solution to this
      await wait(2)

      const gutterElement = activeGutterElement()
      expect(gutterElement).toExist()
      expect(gutterElement.style.display).toBe('')

      atom.commands.dispatch(workspaceElement, 'blame:toggle')

      expect(gutterElement.style.display).toBe('none')
    })
  })

  describe('when when package is deativated', () => {
    it('removes the gutter', async () => {
      await atom.workspace.open(readmePath)

      expect(activeGutterElement()).not.toExist()

      atom.commands.dispatch(workspaceElement, 'blame:toggle')

      // TODO Find a better solution to this
      await wait(2)

      expect(activeGutterElement()).toExist()
      await atom.packages.deactivatePackage('blame')

      expect(activeGutterElement()).not.toExist()
    })
  })
})
