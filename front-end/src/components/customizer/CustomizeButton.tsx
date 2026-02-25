import React from 'react';
import { Settings } from 'lucide-react';
import { useCustomizer } from '../../context/customizer-context';

function CustomizeButton() {
  const { setIsCustomizerOpen } = useCustomizer();

  return (
    <button
      onClick={() => setIsCustomizerOpen(true)}
      className="fixed bottom-6 right-6 z-40 p-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 group"
      title="Personnaliser l'interface"
    >
      <Settings className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
    </button>
  );
}

export default CustomizeButton;
