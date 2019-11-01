'use babel'

export default function (tagName, options = {}) {
  const classes = options.classes || []
  const events = options.events || {}
  const attributes = options.attributes || {}

  const element = document.createElement(tagName)

  classes.forEach((cls) => element.classList.add(cls))

  Object.keys(events).forEach((event) => {
    element.addEventListener(event, events[event])
  })

  Object.keys(attributes).forEach((key) => {
    element.setAttribute(key, attributes[key])
  })

  if (options.inner) {
    element.innerHTML = options.inner
  }

  return element
}
