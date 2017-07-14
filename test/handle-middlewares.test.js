import test from 'tape'
import {createAction} from 'redux-actions'
import boot, {BOOT} from '../src/bootstrap'

test('Use handleMiddlewares to handle middleware execution', assert => {
  const AFTER_BOOT = 'AFTER_BOOT'
  const AFTER_AFTER_BOOT = 'AFTER_AFTER_BOOT'
  const afterBootAction = createAction(AFTER_BOOT)
  const afterAfterBootAction = createAction(AFTER_AFTER_BOOT)

  const initialState = {
    foo: 'bar',
    faa: 'brz'
  }

  const reducers = {
    [AFTER_BOOT]: (state, action) => {
      assert.pass('AFTER_BOOT reducer called')
      return { ...state, foo: action.payload }
    },
    [AFTER_AFTER_BOOT]: (state, action) => {
      assert.pass('AFTER_AFTER_BOOT reducer called')
      return { ...state, faa: action.payload }
    }
  }

  const middlewares = {
    [BOOT]: store => next => action => {
      store.dispatch(afterBootAction('baz'))
      return next(action)
    },
    [AFTER_BOOT]: store => next => action => {
      store.dispatch(afterAfterBootAction('boo'))
      return next(action)
    }
  }

  const modules = [
    { reducer: reducers, middleware: middlewares }
  ]

  const app = boot(initialState, modules)

  app.then(({action, store}) => {

    assert.equal(
      store.getState().foo,
      'baz',
      'Middleware for the AFTER_BOOT action.'
    )

    assert.equal(
      store.getState().faa,
      'boo',
      'Middleware for the AFTER_AFTER_BOOT action.'
    )

    assert.end()
  })
})

test('Middlewares should can create singletons at BOOT', assert => {
  const AFTER_BOOT = 'AFTER_BOOT'
  const afterBootAction = createAction(AFTER_BOOT)

  let count = 0

  const moduleA = {
    middleware: {
      [BOOT]: store => {
        count = count + 1
        return next => action => next(action)
      }
    }
  }

  const moduleB = {
    middleware: {
      [AFTER_BOOT]: store => {
        count = count + 1
        return next => action => next(action)
      }
    }
  }

  const modules = [moduleA, moduleB]

  boot({}, modules).then(({ store }) => {

    store.dispatch(afterBootAction())
    store.dispatch(afterBootAction())
    store.dispatch(afterBootAction())

    assert.equal(count, 2, 'Shoud pass two times')

    assert.end()
  })
})
