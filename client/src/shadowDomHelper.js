const shadowRoot = () => document
  .querySelector('[data-feedback-shadow-root]')

const shadowDocument = () => document
  .querySelector('[data-feedback-shadow-root]').shadowRoot

export { shadowRoot, shadowDocument }
