import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import store from './redux/store';
import AppNavigation from './navigation/Navigation';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ChatProvider } from './contexts/ChatContext';

function App() {

  return (
    <Provider store={store}>
      <HelmetProvider>       
        <div className="main-page-wrapper">
          <ToastContainer />
           <ChatProvider>
            <AppNavigation /></ChatProvider>
        </div>
      </HelmetProvider> 
    </Provider>
  );
}

export default App;