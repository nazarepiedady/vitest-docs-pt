import { mount } from 'cypress/vue'
import type { Component } from 'vue'
import { directives, plugins } from '../../client/global-setup'

export const registerMount = () => Cypress.Commands.add(
  'mount',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  <C extends Parameters<typeof mount>[0]>(comp: any, options: any = {}) => {
    options.global = options.global || {}
    options.global.stubs = options.global.stubs || {}
    options.global.stubs.transition = false
    options.global.plugins = options.global.plugins || []
    options.global.directives = directives
    plugins?.forEach((pluginFn: () => any) => {
      options?.global?.plugins?.push(pluginFn())
    })

    return mount(comp, options)
  },
)

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Install all vue plugins and globals then mount
       */
      mount<Props = any>(comp: Component<Props>, options?: unknown): Cypress.Chainable<any>
    }
  }
}
