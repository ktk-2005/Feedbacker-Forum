import retargetEvents from 'react-shadow-dom-retarget-events'

const shadowRoot = () => document
  .querySelector('[data-feedback-shadow-root]')

const shadowDocument = () => document
  .querySelector('[data-feedback-shadow-root]').shadowRoot

const shadowModalRoot = () => document
  .querySelector('[data-feedback-shadow-root]').shadowRoot
  .querySelector('[data-feedback-modal-root]')

const prepareReactRoot = () => {
  const shadow = shadowDocument()
  // Events fail otherwise in shadow root
  retargetEvents(shadow)

  const reactRoot = document.createElement('div')
  reactRoot.setAttribute('data-feedback-react-root', true)
  shadow.appendChild(reactRoot)

  const modalRoot = document.createElement('div')
  modalRoot.setAttribute('data-feedback-modal-root', true)
  shadow.appendChild(modalRoot)

  return reactRoot
}


export { shadowRoot, shadowDocument, prepareReactRoot, shadowModalRoot }
