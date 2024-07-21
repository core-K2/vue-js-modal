import { UNSUPPORTED_ARGUMENT_ERROR } from './utils/errors'
import { createDivInBody } from './utils'
import ModalsContainer from './components/ModalsContainer.vue'
import emitter from 'tiny-emitter/instance'

const PluginCore = (app, options = {}) => {
  var gp = app.config.globalProperties;
  var v2 = !gp;
  const subscription = v2 ? new app() : {
    $on: (...args) => emitter.on(...args),
    $once: (...args) => emitter.once(...args),
    $off: (...args) => emitter.off(...args),
    $emit: (...args) => emitter.emit(...args),
  };

  const context = {
    root: null,
    componentName: options.componentName || 'Modal'
  }

  // add for Vue3
  subscription.$on('set-modal-container', container => {
    context.root.__modalContainer = container
  });

  const showStaticModal = (name, params) => {
    subscription.$emit('toggle', name, true, params)
  }

  const showDynamicModal = (
    component,
    componentProps,
    componentSlots,
    modalProps = {},
    modalEvents
  ) => {
    const container = context.root?.__modalContainer
    const defaults = options.dynamicDefaults || {}

    container?.add(
      Vue.markRaw(component),
      Vue.markRaw(componentProps),
      componentSlots,
      { ...defaults, ...modalProps },
      modalEvents
    )
  }

  /**
   * Creates a container for modals in the root Vue component.
   *
   * @param {Vue} parent
   * @param {Vue} app (Vue3)
  */
  const setDynamicModalContainer = ((parent, app) => {
    context.root = parent

    const element = createDivInBody()

    if (v2) {
      new Vue({
        parent,
        render: h => h(ModalsContainer)
      }).$mount(element)
    } else {
      const vnode = Vue.createVNode(ModalsContainer)
      vnode.appContext = app._context
      Vue.render(vnode, element)
    }
  });

  const show = (...args) => {
    const [modal] = args

    switch (typeof modal) {
      case 'string':
        showStaticModal(...args)
        break

      case 'object':
      case 'function':
        showDynamicModal(...args)
        break

      default:
        console.warn(UNSUPPORTED_ARGUMENT_ERROR, modal)
    }
  }

  const hide = (name, params) => {
    subscription.$emit('toggle', name, false, params)
  }

  const hideAll = () => {
    subscription.$emit('hide-all')
  }

  const toggle = (name, params) => {
    subscription.$emit('toggle', name, undefined, params)
  }

  return {
    context,
    subscription,
    show,
    hide,
    hideAll,
    toggle,
    setDynamicModalContainer
  }
}

export default PluginCore
