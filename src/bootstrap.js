import {createAction} from 'redux-actions'
import processModules from './processModules'
import configureStore from './configureStore'

export const BOOT = 'redux-boot/BOOT'

export default function boot(state = {}, modules = []) {
  const {reducers, middlewares, enhancers, initialState} = processModules(modules)

  state = {...initialState, ...state}

  let store = configureStore(state, reducers, middlewares, enhancers)

  return store
    .dispatch(bootAction(state))
    .then(action => {
      return {
        action,
        store
      }
    })
}

export const bootAction = createAction(BOOT, async initialState => initialState)
