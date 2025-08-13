import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import AuthProvider from './contexts/auth';

import RoutesApp from './routes';

function App() {
  return (
    <div className='app-container'>
      <BrowserRouter>
        <AuthProvider>
          <ToastContainer autoclose={3000}/>
          <RoutesApp/>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
