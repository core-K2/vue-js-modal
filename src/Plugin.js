import Modal from './components/Modal.vue'
import Dialog from './components/Dialog.vue'
import PluginCore from './PluginCore'

const Plugin = {
  install(app, options = {}) {
    var gp = app.config.globalProperties;
    var v2 = !gp;
    if (v2) {
      gp = app.prototype;
    }
    if (gp.$modal) {
      return
    }

    const plugin = new PluginCore(app, options)

    Object.defineProperty(gp, '$modal', {
      get: function() {
        /**
         * The "this" scope is the scope of the component that calls this.$modal
         */
        const caller = this
        /**
         * The this.$modal can be called only from inside the vue components so this check is not really needed...
         */
        if (!v2 || caller instanceof app) {
          const root = caller.$root

          if (!plugin.context.root) {
            plugin.setDynamicModalContainer(root)
          }
        }

        return plugin
      }
    })

    /**
     * Sets custom component name (if provided)
     */
    app.component(plugin.context.componentName, Modal)

    /**
     * Registration of <Dialog/> component
     */
    if (options.dialog) {
      const componentName = options.dialogComponentName || 'VDialog';
      app.component(componentName, Dialog);
    }
  }
}

export default Plugin
