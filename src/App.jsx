
import './App.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SplashCursor from './components/SplashCursor';

function App () {
  return (
    <>
          <SplashCursor />        
          <AdminLayout />
          <ToastContainer />


    </>
  )
}

export default App
