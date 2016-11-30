import {handleActions} from 'redux-actions'

export default function processModules(modules) {
  const reducers = modules
    .map(module => module.reducer)
    .filter(reducer => typeof reducer == 'function' || typeof reducer == 'object')
    .map(reducer => typeof reducer == 'function' ? reducer : handleActions(reducer))

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
