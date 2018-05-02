import test from 'tape'
import boot, {BOOT} from '../src/bootstrap'
import { isFSA } from 'flux-standard-action'
import $$observable from 'symbol-observable'

test('Boostrap new app with no arguments', assert => {
  const app = boot()

  app.then(({action, store}) => {

    assert.deepLooseEqual(
      Reflect.ownKeys(store),
      ['dispatch', 'subscribe', 'getState', 'replaceReducer', $$observable],
      'Store returned'
    )

    assert.ok(
      isFSA(action),
      'Action returned'
    )

    assert.end()
  })
})

test('Boostrap new app with an initial state', assert => {
  const initialState = {
    variables: {
      name: 'Test app'
    }
  }

  const app = boot(initialState)

  app.then(({action, store}) => {

    assert.deepEqual(
      store.getState(),
      initialState,
      'State is equal to initial state'
    )

    assert.end()
  })
})

test('Boostrap new app with initial state on modules', assert => {
  const initialState = { foo: 'bar' }
  const testModule = { initialState: (state) => initialState }

  const app = boot(null, [testModule])

  app.then(({action, store}) => {

    assert.deepEqual(
      store.getState(),
      initialState,
      'State is equal to module\'s initial state'
    )

    assert.end()
  })
})

test('Boostrap new app with a module implementing a reducer', assert => {
  const initialState = {
    foo: 'bar'
  }

  const testModule = {
    reducer(state, action) {
      if (action.type === BOOT) {
        assert.pass('Reducer called')
        return {
          ...state,
          foo: 'baz'
        }
      }
      return state
    }
  }

  const modules = [
    testModule
  ]

  const app = boot(initialState, modules)

  app.then(({action, store}) => {

    assert.equal(
      store.getState().foo,
      'baz',
      "Module reducer changed state"
    )

    assert.end()
  })
})

test('Boostrap new app with a module implementing a middleware', assert => {
  const AFTER_BOOT = 'redux-boot/test/AFTER_BOOT'

  const afterBoot = value => {
    return {
      type: AFTER_BOOT,
      payload: {
        foo: value
      }
    }
  }

  const initialState = {
    foo: 'bar'
  }

  const testModule = {

    reducer(state, action) {
      if (action.type === AFTER_BOOT) {
        assert.pass('Reducer called')
        return {
          ...state,
          foo: action.payload.foo
        }
      }
      return state
    },

    middleware({getState, dispatch}) {
      return next => action => {

        if (action.type === BOOT) {
          assert.pass('Middleware called')
          dispatch(afterBoot('baz'))
        }

        return next(action)
      }
    }

  }

  const modules = [
    testModule
  ]

  const app = boot(initialState, modules)

  app.then(({action, store}) => {

    assert.equal(
      store.getState().foo,
      'baz',
      "Module middleware dispatched an action that changed state"
    )

    assert.end()
  })
})

test('Boostrap new app with a module implementing an enhancer', assert => {
  const AFTER_BOOT = 'redux-boot/test/AFTER_BOOT'

  const afterBoot = value => {
    return {
      type: AFTER_BOOT,
      payload: {
        foo: value
      }
    }
  }

  const initialState = {
    foo: 'bar'
  }

  const testModule = {

    reducer(state, action) {
      if (action.type === AFTER_BOOT) {
        assert.pass('Reducer called')
        return {
          ...state,
          foo: action.payload.foo
        }
      }
      return state
    },

    middleware({getState, dispatch}) {
      return next => action => {

        if (action.type === BOOT) {
          assert.pass('Middleware called')
          dispatch(afterBoot('baz'))
        }

        return next(action)
      }
    },

    enhancer(createStore) {
      return (reducer, initialState, enhancer) => {
        const store = createStore(reducer, initialState, enhancer)

        const apiClient = id => 'Thing: ' + id

        return {
          ...store,
          apiClient
        }
      }
    }
  }

  const modules = [
    testModule
  ]

  const app = boot(initialState, modules)

  app.then(({action, store}) => {

    assert.equal(
      store.apiClient(2),
      'Thing: 2',
      "Module enhancer added an API client to the store"
    )

    assert.end()
  })
})
