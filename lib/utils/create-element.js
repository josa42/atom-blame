'use babel'

export default function (tagName, options = {}) {
  let classes = options.classes || []
  let events = options.events || {}
  let attributes = options.attributes || {}

  let element = document.createElement(tagName)

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
