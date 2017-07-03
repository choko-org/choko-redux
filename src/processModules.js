import {handleActions} from 'redux-actions'

export default function processModules(modules) {
  const reducers = modules
    .filter(
      module =>
        typeof module.reducer == 'function' || typeof module.reducer == 'object'
    )
    .map(
      module =>
        typeof module.reducer == 'function'
          ? module.reducer
          : handleActions(module.reducer, {})
    )

  const middlewares = modules
    .filter(
      module =>
        typeof module.middleware == 'function' ||
        typeof module.middleware == 'object'
    )
    .map(
      module =>
        typeof module.middleware == 'function'
          ? module.middleware
          : handleMiddlewares(module.middleware)
    )

  const enhancers = modules
    .filter(module => typeof module.enhancer == 'function')
    .map(module => module.enhancer)

  return {
    reducers,
    middlewares,
    enhancers
  }
}

export function handleMiddlewares(listeners) {
  return store => next => action => {
    // Execute action listeners, if any was set for the current action.
    if (listeners[action.type]) {
      return listeners[action.type](store)(next)(action)
    }

    return next(action)
  }
}
