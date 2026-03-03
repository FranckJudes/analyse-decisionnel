import { RouterProvider } from '@tanstack/react-router';
import { router } from './routes/router';
import CustomizerProvider from './context/customizer-context';
import { ThemeProvider } from './context/theme-context';

function App() {
  return (
    <ThemeProvider>
      <CustomizerProvider>
        <RouterProvider router={router} />
      </CustomizerProvider>
    </ThemeProvider>
  );
}

export default App;
