import MainRoutes from './app/routes/MainRoutes';
import { ToastProvider } from './app/contexts/ToastContext';
import { ConfirmProvider } from './app/contexts/ConfirmContext';
import ToastContainer from './app/components/Toast';
import './App.css';

function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <MainRoutes />
        <ToastContainer />
      </ConfirmProvider>
    </ToastProvider>
  );
}

export default App;
