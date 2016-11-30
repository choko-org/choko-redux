import {handleActions} from 'redux-actions'

export default function processModules(modules) {
  const reducers = modules
    .filter(module => (
      typeof module.reducer == 'function' || typeof module.reducer == 'object'
    ))
    .map(module => {
      const reducer = typeof module.reducer == 'function' ? module.reducer : handleActions(module.reducer)
      const path = module.selector ? module.selector.split('.') : []

      return !path.length ? reducer : (state, action) => {
        const selection = path.reduce((state, key) => state && state[key] || {}, state)
        const result = reducer(selection, action)
        const changes = path.concat(null).reverse().reduce(
          (state, key) => key ? ({ [key]: state }) : result, {}
        )

        return Object.assign({}, state, changes)
      }
    })

  const middlewares = modules
    .map(module => module.middleware)
    .filter(middleware => typeof middleware == 'function' || typeof middleware == 'object')
    .map(middleware => typeof middleware == 'function' ? middleware : handleMiddlewares(middleware))

  const enhancers = modules
    .map(module => module.enhancer)
    .filter(enhancer => typeof enhancer == 'function')

  return {
    reducers,
    middlewares,
    enhancers,
  }
}

export const handleMiddlewares = (listeners) => store => next => action => (
  // Execute action listeners, if any was set for the current action.
  listeners[action.type] ? listeners[action.type](store)(next)(action) : next(action)
)
