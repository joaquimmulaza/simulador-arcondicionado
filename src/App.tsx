import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Calculator from './components/Calculator';

// Importar todas as imagens para pré-carregamento
import standardImg from './assets/standard-img.png';
import btu9000 from './assets/btu-9000.png';
import btu12000 from './assets/btu-12000.png';
import btu18000 from './assets/btu-18000.png';
import btu24000 from './assets/btu-24000.png';
import btu30000 from './assets/btu-30000.png';

// Mapeamento de BTU para a imagem correspondente
const btuImageMap: { [key: number]: string } = {
  9000: btu9000,
  12000: btu12000,
  18000: btu18000,
  24000: btu24000,
  30000: btu30000,
};

function App() {
  const [currentImage, setCurrentImage] = useState(standardImg);

  const handleResultChange = (btu: number | null) => {
    if (btu && btuImageMap[btu]) {
      setCurrentImage(btuImageMap[btu]);
    } else {
      setCurrentImage(standardImg); // Reverter para a imagem padrão
    }
  };

  return (
    <main className="flex min-h-screen w-full bg-white">
      {/* Coluna da Imagem (Esquerda) */}
      <div className="hidden bg-gradient-to-br from-s-cyan to-s-blue lg:block lg:w-1/2 relative h-screen sticky top-0">
        <AnimatePresence>
          <motion.div
            key={currentImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${currentImage})` }}
          />
        </AnimatePresence>
      </div>

      {/* Coluna da Calculadora (Direita) */}
      <div className="w-full lg:w-1/2 flex justify-center p-4 lg:p-8 bg-gradient-to-br from-s-cyan to-s-blue overflow-y-auto">
        <Calculator onResultChange={handleResultChange} />
      </div>
    </main>
  );
}

export default App;
