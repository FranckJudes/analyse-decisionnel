import { RouterProvider } from '@tanstack/react-router';
import { Toaster } from 'react-hot-toast';
import { router } from './routes/router';
import CustomizerProvider from './context/customizer-context';
import { ThemeProvider } from './context/theme-context';
import { SimulationProvider } from './context/simulation-context';
import { AuthProvider } from './context/AuthProvider';

function App() {
  return (
    <ThemeProvider>
      <CustomizerProvider>
        <AuthProvider>
          <SimulationProvider>
            <RouterProvider router={router} />
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          </SimulationProvider>
        </AuthProvider>
      </CustomizerProvider>
    </ThemeProvider>
  );
}

export default App;
