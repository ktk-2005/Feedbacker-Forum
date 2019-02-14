export const LOAD_PERSIST = 'LOAD_PERSIST'
export const SET_PERSIST = 'SET_PERSIST'
export const LOAD_ALL = 'LOAD_ALL'
export const UPDATE_ROLE = 'UPDATE_ROLE'
export const LOAD_QUESTIONS = 'LOAD_QUESTIONS'
export const INTRO_COMPLETED = 'INTRO_COMPLETED'


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

export function loadQuestions(questions) {
  return createAction(LOAD_QUESTIONS, { questions })
}

export function introCompleted() {
  return createAction(INTRO_COMPLETED)
}

export function updateRole(role) {
  return createAction(UPDATE_ROLE, { role })
}
