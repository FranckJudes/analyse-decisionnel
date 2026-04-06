import { RouterProvider } from '@tanstack/react-router';
import { router } from './routes/router';
import CustomizerProvider from './context/customizer-context';
import { ThemeProvider } from './context/theme-context';
import { SimulationProvider } from './context/simulation-context';

function App() {
  return (
    <ThemeProvider>
      <CustomizerProvider>
        <SimulationProvider>
          <RouterProvider router={router} />
        </SimulationProvider>
      </CustomizerProvider>
    </ThemeProvider>
  );
}

export default App;
