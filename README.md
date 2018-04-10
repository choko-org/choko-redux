# Redux Boot

Modular [Redux](http://redux.js.org) bootstrap with asynchronous side-effects.

[![Build Status](https://travis-ci.org/choko-org/redux-boot.svg?branch=master)](https://travis-ci.org/choko-org/redux-boot)
[![sponsored by Taller](https://raw.githubusercontent.com/TallerWebSolutions/tallerwebsolutions.github.io/master/sponsored-by-taller.png
)](https://taller.net.br/en/)

## What is Redux Boot?

Minimal Framework using [Redux](http://redux.js.org) to develop modularized universal (backend and frontend) applications, based on functional programming paradigms and friends such as Map and Reduce, Immutability and Reactive programming.

 > "Simplicity is the ultimate sophistication."
 > -- Leonardo da Vinci

## What Redux Boot provides?

- **Module API** - Clean **organization and reuse patterns** for your code.
- **Async side-effects** - **No-brainer** async side-effects with [redux-actions](https://github.com/acdlite/redux-actions) and [redux-promise](https://github.com/acdlite/redux-promise).

## Examples:

- [Todo MVC](https://github.com/choko-org/redux-boot-todomvc) example.
- The [bootstrap tests](https://github.com/choko-org/redux-boot/blob/master/test/bootstrap.test.js).
- Simple [web server App](https://github.com/choko-org/redux-boot-web-app-example).

## Documentation

  For more details see the [documentation](https://choko.gitbooks.io/redux-boot/content/index.html).

## Getting started

**Install**

```sh
npm install redux-boot --save
```

**Basic Usage**

```js
import boot, {BOOT} from 'redux-boot'

const initialState = {
  foo: 'bar'
}

const testModule = {
  reducer: {  
    [BOOT]: (state, action) => {
      return {
        ...state,
        foo: 'baz'
      }
    }
  }
}

const modules = [
  testModule
]

const app = boot(initialState, modules)

app.then(({action, store}) => {

  // Should print 'baz'.
  console.log(store.getState().foo)
})
```

**Sync middleware (with redux-actions)**

```js
import boot, {BOOT} from 'redux-boot'
import {createAction} from 'redux-actions'

const CHANGE_FOO = 'redux-boot/test/CHANGE_FOO'

const changeFoo = createAction(CHANGE_FOO)

const initialState = {
  foo: 'bar'
}

const testModule = {
  reducer: {
    [CHANGE_FOO]: (state, action) => {
      return {
        ...state,
        foo: action.payload
      }
    }
  },

  middleware: {
    [BOOT]: store => next => action => {
      store.dispatch(changeFoo('baz'))
      return next(action)
    }
  }
}

const modules = [
  testModule
]

const app = boot(initialState, modules)

app.then(({action, store}) => {

  // Should print 'baz'.
  console.log(store.getState().foo)
})
```

**Async middleware (with redux-action and redux-promise)**

```js
import boot, {BOOT} from 'redux-boot'
import {createAction} from 'redux-actions'

const CHANGE_FOO = 'redux-boot/test/CHANGE_FOO'

const changeFoo = createAction(CHANGE_FOO, async (value) => {

  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(value), 1)
  })
})

const initialState = {
  foo: 'bar'
}

const testModule = {
  reducer: {
    [CHANGE_FOO]: (state, action) => {
      return {
        ...state,
        foo: action.payload
      }
    }
  },

  middleware: {
    [BOOT]: store => next => async action => {
      const result = next(action)
      await store.dispatch(changeFoo('baz'))
      return result
    }
  }
}

const modules = [
  testModule
]

const app = boot(initialState, modules)

app.then(({action, store}) => {

  // Should print 'baz'.
  console.log(store.getState().foo)
})
```

### Development setup:

**Install**

```sh
git clone https://github.com/choko-org/redux-boot.git
npm install
```

**Build**

```sh
npm run build
```

**Build and Run the tests**

```sh
npm test
```

## License

[MIT](LICENSE.md)
