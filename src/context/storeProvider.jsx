'use client'
import { useState, useEffect } from 'react'
import { Provider } from 'react-redux'
import { store } from '../redux/store'
import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist'

export default function StoreProvider({ children }) {
  const [store, setStore] = useState(null)
  const [persistor, setPersistor] = useState(null)

  useEffect(() => {
    // Only run on mount (client-side)
    const createdStore = store()
    const createdPersistor = persistStore(createdStore)
    setStore(createdStore)
    setPersistor(createdPersistor)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!store || !persistor) {
    // Optionally, show a loading spinner or null until store is ready
    return null
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  )
}