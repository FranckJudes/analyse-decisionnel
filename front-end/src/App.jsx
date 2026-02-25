import { RouterProvider } from '@tanstack/react-router';
import { router } from './routes/router';
import CustomizerProvider from './context/customizer-context';

function App() {
  return (
    <CustomizerProvider>
      <RouterProvider router={router} />
    </CustomizerProvider>
  );
}

export default App;
