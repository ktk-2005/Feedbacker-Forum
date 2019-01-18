import retargetEvents from 'react-shadow-dom-retarget-events'

const shadowRoot = () => document
  .querySelector('[data-feedback-shadow-root]')

const shadowDocument = () => document
  .querySelector('[data-feedback-shadow-root]').shadowRoot

const prepareReactRoot = () => {
  const shadow = shadowDocument()
  // Events fail otherwise in shadow root
  retargetEvents(shadow)
  const reactRoot = document.createElement('div')
  reactRoot.setAttribute('data-feedback-react-root', true)
  shadow.appendChild(reactRoot)
  return reactRoot
}


export { shadowRoot, shadowDocument, prepareReactRoot }
