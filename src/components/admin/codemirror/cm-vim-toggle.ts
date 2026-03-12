/**
 * Vim mode toggle for CodeMirror 6
 * Uses Compartment for hot-swapping, lazy-loads @replit/codemirror-vim
 * Persists preference in localStorage
 */
import { Compartment } from '@codemirror/state'
import type { EditorView } from '@codemirror/view'

const VIM_PREF_KEY = 'admin-editor-vim-mode'
export const vimCompartment = new Compartment()

let vimExtensionCache: any = null

/** Lazy-load @replit/codemirror-vim and cache the extension */
async function getVimExtension() {
  if (!vimExtensionCache) {
    const { vim } = await import('@replit/codemirror-vim')
    vimExtensionCache = vim()
  }
  return vimExtensionCache
}

/** Check if vim mode is currently active */
export function isVimActive(view: EditorView): boolean {
  const current = vimCompartment.get(view.state)
  return Array.isArray(current) ? current.length > 0 : current !== null
}

/** Toggle vim mode on/off — returns promise resolving to new state */
export async function toggleVimMode(view: EditorView): Promise<boolean> {
  if (isVimActive(view)) {
    view.dispatch({ effects: vimCompartment.reconfigure([]) })
    localStorage.removeItem(VIM_PREF_KEY)
    return false
  } else {
    const ext = await getVimExtension()
    view.dispatch({ effects: vimCompartment.reconfigure(ext) })
    localStorage.setItem(VIM_PREF_KEY, 'true')
    return true
  }
}

/** Restore vim mode from localStorage preference (call after mount) */
export async function restoreVimPreference(view: EditorView) {
  if (localStorage.getItem(VIM_PREF_KEY) === 'true') {
    const ext = await getVimExtension()
    view.dispatch({ effects: vimCompartment.reconfigure(ext) })
  }
}

/** Initial extension (no vim by default — lazy-loaded on toggle) */
export const vimModeExtension = vimCompartment.of([])
