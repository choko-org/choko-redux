import {handleActions} from 'redux-actions'

export default function processModules(modules) {
  const reducers = modules
    .filter(module => (
      typeof module.reducer == 'function' || typeof module.reducer == 'object'
    ))
    .map(module => (
      typeof module.reducer == 'function' ? module.reducer : handleActions(module.reducer, {})
    ))

  const middlewares = modules
    .filter(module => (
        typeof module.middleware == 'function' || typeof module.middleware == 'object'
    ))
    .map(module => (
        typeof module.middleware == 'function' ? module.middleware : handleMiddlewares(module.middleware)
    ))

  const enhancers = modules
    .filter(module => (
      typeof module.enhancer == 'function'
    ))
    .map(module => module.enhancer)

  return {
    reducers,
    middlewares,
    enhancers
  }
}

export function handleMiddlewares(listeners) {
  return store => {
    const middlewares = Object.keys(listeners).map(type => {
      return { type, middleware: listeners[type](store) }
    })

    return next => action => {
      const matched = middlewares
        .find(({ type }) => type === action.type)

      if (!matched) {
        return next(action)
      }

      return matched.middleware(next)(action)
    }
  }
}
