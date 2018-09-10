import merge from 'deepmerge'
import * as shvl from 'shvl'

export function mergeState(next) {
  return function(mutation, state, store) {
    return !mutation
      ? merge(state, next(mutation, state, store) || {})
      : next(mutation, state, store)
  }
}

/**
 * Stringifies and parsed the state to / from JSON. Whenever it encounters
 * an error in the passed JSON string, it will just return null.
 */

export function stringifyState(next) {
  return function(mutation, state, store) {
    let value = next(mutation, JSON.stringify(state), store)

    return (v => {
      try {
        return JSON.parse(v)
      } catch (e) {
        return null
      }
    })(value)
  }
}

export function fromStorage({
  key = 'vuex',
  storage = window && window.localStorage,
}) {
  return function(mutation, state, store) {
    return !mutation
      ? storage.getItem(key)
      : (storage.setItem(key, state), storage.getItem(key))
  }
}

/**
 * This method just returns the store's current state and will be used
 * as the default middleware so nothing happens actually.
 */

function noop(mutation, state, store) {
  return state
}

export function persistedState(next = noop) {
  return function(store) {
    // Rehydrate the store's state when bootstrapping.
    // @see https://vuex.vuejs.org/api/#replacestate
    store.replaceState(next(undefined, store.state, store))

    // The method invokes the composed middleware chain, but doesn't set
    // the state back to Vuex's store. This way we allow middleware to
    // persist or modify when it's rehydrated later.
    function subscribe(mutation, state) {
      next(mutation, state, store)
    }

    // Attach our subscriber to the store.
    store.subscribe(subscribe)
  }
}
