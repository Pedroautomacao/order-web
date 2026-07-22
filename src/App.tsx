import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { BrowserRouter } from 'react-router-dom'

import Routes from './routes/Routes'
import reducers from 'store'
import { Theme } from 'theme'
import { AuthProvider } from 'hooks/useAuth'
import { PopupProvider } from 'hooks/usePopup'
import { Alert, ErrorBoundary } from 'shared'

const store = createStore(reducers)

function App() {
  console.log('App rendering...')
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
          <Theme>
            <PopupProvider>
              <AuthProvider>
                <Alert />
                <Routes />
              </AuthProvider>
            </PopupProvider>
          </Theme>
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  )
}

export default App

