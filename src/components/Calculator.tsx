import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Ruler, Users, Sun, Tv, Calculator, Thermometer, Maximize2, Square, Sparkles } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

const CalculatorComponent = () => {
  const [comprimento, setComprimento] = useState('');
  const [largura, setLargura] = useState('');
  const [pessoas, setPessoas] = useState('');
  const [exposicaoSolar, setExposicaoSolar] = useState('');
  const [aparelhos, setAparelhos] = useState('');
  const [janelas, setJanelas] = useState('');
  const [resultado, setResultado] = useState<{
    btuComercial: number;
    recomendacao: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    comprimento: '',
    largura: '',
    pessoas: '',
    exposicaoSolar: '',
  });

  const validate = () => {
    const newErrors = { comprimento: '', largura: '', pessoas: '', exposicaoSolar: '' };
    let isValid = true;

    if (!comprimento || Number(comprimento) <= 0) {
      newErrors.comprimento = 'O comprimento deve ser maior que zero.';
      isValid = false;
    }
    if (!largura || Number(largura) <= 0) {
      newErrors.largura = 'A largura deve ser maior que zero.';
      isValid = false;
    }
    if (!pessoas || Number(pessoas) <= 0) {
      newErrors.pessoas = 'O número de pessoas deve ser no mínimo 1.';
      isValid = false;
    }
    if (exposicaoSolar === '') {
      newErrors.exposicaoSolar = 'Selecione a exposição solar.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const calcularBTUs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setResultado(null);
      return;
    }

    setIsLoading(true);
    setResultado(null);

    const prompt = `
      Calcule a capacidade de BTUs para um ar condicionado com as seguintes características:
      - Comprimento do ambiente: ${comprimento} metros
      - Largura do ambiente: ${largura} metros
      - Área total: ${Number(comprimento) * Number(largura)} m²
      - Número de pessoas: ${pessoas}
      - Número de aparelhos eletrônicos: ${aparelhos}
      - Número de janelas: ${janelas}
      - Exposição solar: ${exposicaoSolar}

      Responda em Português de Portugal e em formato JSON com duas chaves:
      1. "btuComercial": um número para a capacidade de BTUs comercial recomendada (ex: 9000, 12000, 18000, 24000, 30000).
      2. "recomendacao": uma string curta (máximo 2 frases) com uma recomendação ou observação baseada nos dados.
    `;

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }]
        }
      );

      const textResponse = response.data.candidates[0].content.parts[0].text;
      const cleanedJsonString = textResponse.replace(/```json|```/g, '').trim();
      const data = JSON.parse(cleanedJsonString);

      setResultado({
        btuComercial: data.btuComercial,
        recomendacao: data.recomendacao,
      });

    } catch (error) {
      console.error("Erro ao chamar a API do Gemini:", error);
      // Fallback ou mensagem de erro para o usuário
      setErrors(prev => ({ ...prev, api: 'Não foi possível obter a recomendação. Tente novamente.' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = <T,>(setter: React.Dispatch<React.SetStateAction<T>>, value: T) => {
    setter(value);
    setResultado(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-s-cyan to-s-blue">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Calculadora de BTUs</h1>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <Maximize2 className="mr-2 h-5 w-5 text-cyan-600" />
              Dimensões do Ambiente
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="comprimento" className="flex items-center text-gray-700">
                  <Ruler className="mr-2 h-4 w-4 text-cyan-600" />
                  Comprimento (m)
                </Label>
                <Input
                  type="number"
                  id="comprimento"
                  step="0.1"
                  placeholder="Ex: 5.0"
                  value={comprimento}
                  onChange={(e) => handleInputChange(setComprimento, e.target.value)}
                  className="bg-white"
                />
                {errors.comprimento && <p className="text-red-500 text-sm">{errors.comprimento}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="largura" className="flex items-center text-gray-700">
                  <Ruler className="mr-2 h-4 w-4 text-cyan-600" />
                  Largura (m)
                </Label>
                <Input
                  type="number"
                  id="largura"
                  step="0.1"
                  placeholder="Ex: 4.0"
                  value={largura}
                  onChange={(e) => handleInputChange(setLargura, e.target.value)}
                  className="bg-white"
                />
                {errors.largura && <p className="text-red-500 text-sm">{errors.largura}</p>}
              </div>
            </div>
            {comprimento && largura && Number(comprimento) > 0 && Number(largura) > 0 && (
              <p className="text-sm text-gray-600 bg-white px-3 py-2 rounded">
                Área total: <span className="font-semibold text-cyan-700">{(Number(comprimento) * Number(largura)).toFixed(2)} m²</span>
              </p>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <Users className="mr-2 h-5 w-5 text-cyan-600" />
              Ocupação e Uso do Ambiente
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pessoas" className="flex items-center text-gray-700">
                  <Users className="mr-2 h-4 w-4 text-cyan-600" />
                  Número de pessoas
                </Label>
                <Input
                  type="number"
                  id="pessoas"
                  min="1"
                  placeholder="Ex: 2"
                  value={pessoas}
                  onChange={(e) => handleInputChange(setPessoas, e.target.value)}
                  className="bg-white"
                />
                {errors.pessoas && <p className="text-red-500 text-sm">{errors.pessoas}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="aparelhos" className="flex items-center text-gray-700">
                  <Tv className="mr-2 h-4 w-4 text-cyan-600" />
                  Aparelhos eletrônicos
                </Label>
                <Input
                  type="number"
                  id="aparelhos"
                  min="0"
                  placeholder="Ex: 1"
                  value={aparelhos}
                  onChange={(e) => handleInputChange(setAparelhos, e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <Sun className="mr-2 h-5 w-5 text-cyan-600" />
              Fatores Ambientais
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="janelas" className="flex items-center text-gray-700">
                <Square className="mr-2 h-4 w-4 text-cyan-600" />
                Número de janelas
              </Label>
              <Input
                type="number"
                id="janelas"
                min="0"
                placeholder="Ex: 2"
                value={janelas}
                onChange={(e) => handleInputChange(setJanelas, e.target.value)}
                className="bg-white"
              />
            </div>

            <div className="space-y-3">
              <Label className="flex items-center text-gray-700">
                <Sun className="mr-2 h-4 w-4 text-cyan-600" />
                Exposição solar no ambiente
              </Label>
              <RadioGroup
                value={exposicaoSolar}
                onValueChange={(value) => handleInputChange(setExposicaoSolar, value)}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3"
              >
                <div className="flex items-center justify-center space-x-2 bg-white p-3 rounded-md border border-gray-200 hover:border-s-blue transition-colors">
                  <RadioGroupItem value="sem-sol" id="sem-sol" />
                  <Label htmlFor="sem-sol" className="cursor-pointer">
                    <span className="font-medium">Sem sol</span>
                    
                  </Label>
                </div>
                <div className="flex items-center justify-center space-x-2 bg-white p-3 rounded-md border border-gray-200 hover:border-s-blue transition-colors">
                  <RadioGroupItem value="pouco-sol" id="pouco-sol" />
                  <Label htmlFor="pouco-sol" className="cursor-pointer">
                    <span className="font-medium">Pouco sol</span>
                  </Label>
                </div>
                <div className="flex items-center justify-center space-x-2 bg-white p-3 rounded-md border border-gray-200 hover:border-s-blue transition-colors">
                  <RadioGroupItem value="dia-todo" id="sol-dia-todo" />
                  <Label htmlFor="sol-dia-todo" className="cursor-pointer">
                    <span className="font-medium">Sol intenso</span>
                  </Label>
                </div>
              </RadioGroup>
              {errors.exposicaoSolar && <p className="text-red-500 text-sm mt-1">{errors.exposicaoSolar}</p>}
            </div>
          </div>

          <Button 
            onClick={calcularBTUs} 
            disabled={isLoading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white h-12 text-base font-semibold"
          >
            <Calculator className="mr-2 h-5 w-5" /> Calcular
          </Button>
        </div>

        {isLoading && (
          <div className="text-center mt-8">
            <Spinner />
            <p className="text-gray-600 mt-2">Só um momento - estamos a encontrar a melhor solução pra você.</p>
          </div>
        )}

        {resultado && !isLoading && (
          <motion.div
            key={resultado.btuComercial}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="mt-8 space-y-4"
          >
            <div className="bg-gradient-to-r from-s-green to-s-blue p-6 rounded-xl text-white shadow-lg text-center">
              <p className="text-sm font-medium opacity-90 mb-2">Capacidade Recomendada</p>
              <div className="flex items-center justify-center gap-3">
                <Thermometer className="h-10 w-10" />
                <p className="text-5xl font-bold">{resultado.btuComercial.toLocaleString('pt-BR')}</p>
                <span className="text-2xl font-semibold">BTUs</span>
              </div>
            </div>

            <div className="bg-sky-50 border border-sky-200 p-4 rounded-lg">
              <h4 className="font-semibold text-sky-900 mb-2 flex items-center">
                <Sparkles className="mr-2 h-5 w-5" fill="currentColor" /> Informação Adicional
              </h4>
              <p className="text-sm text-sky-800">{resultado.recomendacao}</p>
              
            </div>
            <p className='text-gray-400 text-xs'>Informação gerada por IA com base em fórmulas e métodos de cálculo padrão. Recomenda-se validação técnica independente.</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default CalculatorComponent;
