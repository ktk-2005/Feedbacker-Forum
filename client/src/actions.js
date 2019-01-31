export const LOAD_PERSIST = 'LOAD_PERSIST'
export const SET_PERSIST = 'SET_PERSIST'
export const LOAD_ALL = 'LOAD_ALL'
export const INTRO_DONE = 'INTRO_DONE'
export const GET_STEP = 'GET_STEP'

const createAction = (type, data = {}) => ({ type, ...data })

export function loadPersistData(state) {
  return createAction(LOAD_PERSIST, { state })
}

export function setPersistData(data) {
  return createAction(SET_PERSIST, { data })
}

export function loadComments(comments) {
  return createAction(LOAD_ALL, { comments })
}

export function introDone() {
  return createAction(INTRO_DONE)
}
