import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Ruler, Users, Sun, Tv, Calculator, Thermometer, Maximize2, Square, Sparkles, Mail } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import logoSoclima from '@/assets/logo-soclima.png';

// Definir a interface para as props do componente
interface CalculatorProps {
  onResultChange: (btu: number | null) => void;
}

const CalculatorComponent: React.FC<CalculatorProps> = ({ onResultChange }) => {
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
    api: '', // Para erros da API
  });

  const validate = () => {
    const newErrors = { comprimento: '', largura: '', pessoas: '', exposicaoSolar: '', api: '' };
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
    setErrors(prev => ({ ...prev, api: '' })); // Limpar erro de API anterior

    // --- 1. CÁLCULO RÍGIDO FEITO EM JAVASCRIPT (Use como base) ---
    // Ajuste esta fórmula para ser a sua fórmula de "pior caso"
    const area = Number(comprimento) * Number(largura);
    
    let btuBaseTaxa = 600; // Default para 'sem-sol'
    if (exposicaoSolar === 'dia-todo') {
        btuBaseTaxa = 800; // Sol intenso
    } else if (exposicaoSolar === 'pouco-sol') {
        btuBaseTaxa = 700; // Sol moderado
    }

    // Fórmula: (Área * Taxa) + (Pessoas Extras * 600) + (Aparelhos * 600) + (Janelas * 200)
    const calculoRigido = (area * btuBaseTaxa) +
                       (Math.max(0, Number(pessoas) - 1) * 600) +
                       ((Number(aparelhos) || 0) * 400) +
                       ((Number(janelas) || 0) * 200); // Exemplo: 200 BTUs por janela

    // --- 2. NOVO PROMPT DE "ESPECIALISTA" ---
    const prompt = `
      Aja como um técnico de climatização sénior em Angola.
      Um cliente forneceu os seguintes dados para um ambiente:
      - Área: ${area.toFixed(2)} m² (Comprimento: ${comprimento}m, Largura: ${largura}m)
      - Pessoas no ambiente: ${pessoas}
      - Aparelhos eletrônicos: ${aparelhos || 0}
      - Número de janelas: ${janelas || 0}
      - Exposição solar: ${exposicaoSolar}

      Uma fórmula de cálculo padrão (base 600-800 BTU/m² + extras) resulta em aproximadamente ${Math.round(calculoRigido)} BTUs.

      Tarefa: Com base na sua experiência, esta fórmula padrão muitas vezes exagera em ambientes menores. 
      
      1. Analise os dados: Para uma área de ${area.toFixed(2)} m², qual é a capacidade comercial (9000, 12000, 18000, 24000, 30000) que você REALMENTE recomenda?
      2. Use o bom senso: Evite recomendar 12.000 BTUs se 9.000 BTUs for tecnicamente suficiente, mesmo que o cálculo seja ~9.100.
      
      Responda em Português de Portugal e em formato JSON estrito (sem markdown) com as chaves "btuComercial" (o número final da sua recomendação) e "recomendacao" (uma breve justificação da sua escolha).
    `;

    try {
      const response = await axios.post(
        // O modelo FLASH continua a ser o ideal para esta tarefa rápida
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }],
          // --- MELHORIA: Forçar resposta JSON ---
          generationConfig: {
            "responseMimeType": "application/json",
          }
        }
      );

      // A resposta agora é JSON direto, sem necessidade de limpeza
      const data = JSON.parse(response.data.candidates[0].content.parts[0].text);

      setResultado({
        btuComercial: data.btuComercial,
        recomendacao: data.recomendacao,
      });
      onResultChange(data.btuComercial);

    } catch (error) {
      console.error("Erro ao chamar a API do Gemini:", error);
      setErrors(prev => ({ ...prev, api: 'Não foi possível obter a recomendação. Tente novamente.' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = <T,>(setter: React.Dispatch<React.SetStateAction<T>>, value: T) => {
    setter(value);
    setResultado(null); // Limpa o resultado ao mudar qualquer valor
    onResultChange(null);
    // Limpa erros de validação ao começar a digitar
    if (errors.comprimento || errors.largura || errors.pessoas || errors.exposicaoSolar) {
        setErrors(prev => ({...prev, comprimento: '', largura: '', pessoas: '', exposicaoSolar: '', api: prev.api}));
    }
  };

  const handlePedirCotacao = () => {
    if (resultado) {
      const numeroWhatsapp = '923447087'; // Número da Soclima
      const mensagem = `Saudações prezados, \n\nGostaria de solicitar uma cotação para um ar-condicionado com capacidade de ${resultado.btuComercial.toLocaleString('pt-BR')} BTUs.`;
      const url = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(mensagem)}`;
      window.open(url, '_blank');
    }
  };

  const handleRequestByEmail = () => {
    if (resultado) {
      const email = 'comercial@soclima.com'; // Email da Soclima
      const subject = `Solicitação de Cotação para ar-condicionado - ${resultado.btuComercial.toLocaleString('pt-BR')} BTUs`;
      const body = `Saudações prezados,\n\nGostaria de solicitar uma cotação para um ar-condicionado com capacidade de ${resultado.btuComercial.toLocaleString('pt-BR')} BTUs.`;
      const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoUrl, '_blank');
    }
  };

  // --- O JSX (Layout) permanece o mesmo ---
  return (
    <div className="w-full max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full "
      >
        <div className="text-center mb-8">
          <img src={logoSoclima} alt="Soclima Logo" className="mx-auto mb-4 h-16" />
          <h1 className="text-3xl font-bold text-gray-700 mb-2">Calculadora de BTUs</h1>
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
            className="cursor-pointer w-full bg-cyan-600 hover:bg-cyan-700 text-white h-12 text-base font-semibold"
          >
            { <Calculator className="mr-2 h-5 w-5" />}
            {isLoading ? 'A calcular...' : 'Calcular'}
          </Button>
        </div>

        {/* Mensagem de Erro da API */}
        {errors.api && !isLoading && (
            <div className="mt-4 text-center text-red-600">
                {errors.api}
            </div>
        )}

        {/* Feedback de Loading */}
        {isLoading && (
          <div className="text-center mt-8">
            <Spinner />
            <p className="text-gray-600 mt-2">Só um momento, estamos a encontrar a melhor solução para si.</p>
          </div>
        )}
        
        {/* Bloco de Resultado */}
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
    
            <Button
              onClick={handlePedirCotacao}
              variant="outline"
              className="cursor-pointer noHover w-full bg-transparent border-2 border-[#25D366] text-[#25D366] h-12 text-base font-semibold mt-4"
            >
              <svg fill="#25D366" viewBox="0 0 32 32" version="1.1" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" className="mr-2 h-5 w-5"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>whatsapp</title> <path d="M26.576 5.363c-2.69-2.69-6.406-4.354-10.511-4.354-8.209 0-14.865 6.655-14.865 14.865 0 2.732 0.737 5.291 2.022 7.491l-0.038-0.070-2.109 7.702 7.879-2.067c2.051 1.139 4.498 1.809 7.102 1.809h0.006c8.209-0.003 14.862-6.659 14.862-14.868 0-4.103-1.662-7.817-4.349-10.507l0 0zM16.062 28.228h-0.005c-0 0-0.001 0-0.001 0-2.319 0-4.489-0.64-6.342-1.753l0.056 0.031-0.451-0.267-4.675 1.227 1.247-4.559-0.294-0.467c-1.185-1.862-1.889-4.131-1.889-6.565 0-6.822 5.531-12.353 12.353-12.353s12.353 5.531 12.353 12.353c0 6.822-5.53 12.353-12.353 12.353h-0zM22.838 18.977c-0.371-0.186-2.197-1.083-2.537-1.208-0.341-0.124-0.589-0.185-0.837 0.187-0.246 0.371-0.958 1.207-1.175 1.455-0.216 0.249-0.434 0.279-0.805 0.094-1.15-0.466-2.138-1.087-2.997-1.852l0.010 0.009c-0.799-0.74-1.484-1.587-2.037-2.521l-0.028-0.052c-0.216-0.371-0.023-0.572 0.162-0.757 0.167-0.166 0.372-0.434 0.557-0.65 0.146-0.179 0.271-0.384 0.366-0.604l0.006-0.017c0.043-0.087 0.068-0.188 0.068-0.296 0-0.131-0.037-0.253-0.101-0.357l0.002 0.003c-0.094-0.186-0.836-2.014-1.145-2.758-0.302-0.724-0.609-0.625-0.836-0.637-0.216-0.010-0.464-0.012-0.712-0.012-0.395 0.010-0.746 0.188-0.988 0.463l-0.001 0.002c-0.802 0.761-1.3 1.834-1.3 3.023 0 0.026 0 0.053 0.001 0.079l-0-0.004c0.131 1.467 0.681 2.784 1.527 3.857l-0.012-0.015c1.604 2.379 3.742 4.282 6.251 5.564l0.094 0.043c0.548 0.248 1.25 0.513 1.968 0.74l0.149 0.041c0.442 0.14 0.951 0.221 1.479 0.221 0.303 0 0.601-0.027 0.889-0.078l-0.031 0.004c1.069-0.223 1.956-0.868 2.497-1.749l0.009-0.017c0.165-0.366 0.261-0.793 0.261-1.242 0-0.185-0.016-0.366-0.047-0.542l0.003 0.019c-0.092-0.155-0.34-0.247-0.712-0.434z"></path> </g></svg>
              Pedir Cotação
            </Button>

            <Button
              onClick={handleRequestByEmail}
              variant="ghost"
              className="cursor-pointer w-full noHoverMail text-s-blue hover:text-cyan-700 h-12 text-base font-semibold"
            >
              <Mail className="mr-2 h-5 w-5" /> Solicitar por Email
            </Button>
            
            <p className='text-gray-400 text-xs text-center'>Informação gerada por IA com base em fórmulas e métodos de cálculo padrão. Recomenda-se validação técnica independente.</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default CalculatorComponent;
