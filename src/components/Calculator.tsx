import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Ruler, Users, Sun, Tv, Calculator, Thermometer, Maximize2, Square } from 'lucide-react';

const CalculatorComponent = () => {
  const [comprimento, setComprimento] = useState('');
  const [largura, setLargura] = useState('');
  const [pessoas, setPessoas] = useState('');
  const [incidenciaSolar, setIncidenciaSolar] = useState('');
  const [aparelhos, setAparelhos] = useState('');
  const [janelas, setJanelas] = useState('');
  const [resultado, setResultado] = useState<{
    btuCalculado: number;
    btuComercial: number;
    area: number;
  } | null>(null);
  const [errors, setErrors] = useState({
    comprimento: '',
    largura: '',
    pessoas: '',
    incidenciaSolar: '',
  });

  const capacidadesComerciais = [
    7000, 7500, 9000, 10000, 12000, 14000, 15000, 
    18000, 21000, 22000, 24000, 30000, 36000, 48000, 60000
  ];

  const encontrarCapacidadeComercial = (btuCalculado: number) => {
    const capacidade = capacidadesComerciais.find(cap => cap >= btuCalculado);
    return capacidade || capacidadesComerciais[capacidadesComerciais.length - 1];
  };

  const validate = () => {
    const newErrors = { comprimento: '', largura: '', pessoas: '', incidenciaSolar: '' };
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
    if (incidenciaSolar === '') {
      newErrors.incidenciaSolar = 'Selecione a incidência solar.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const calcularBTUs = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setResultado(null);
      return;
    }

    const comp = Number(comprimento);
    const larg = Number(largura);
    const area = comp * larg;
    const numPessoas = Number(pessoas) || 1;
    const numAparelhos = Number(aparelhos) || 0;
    const numJanelas = Number(janelas) || 0;

    let totalBTUs = area * 600;

    if (numPessoas > 1) {
      totalBTUs += (numPessoas - 1) * 600;
    }

    let fatorInsolacao = 1.0;
    switch (incidenciaSolar) {
      case 'sem-sol':
        fatorInsolacao = 1.0;
        break;
      case 'pouco-sol':
        fatorInsolacao = 1.05;
        break;
      case 'manha':
        fatorInsolacao = 1.10;
        break;
      case 'tarde':
        fatorInsolacao = 1.15;
        break;
      case 'dia-todo':
        fatorInsolacao = 1.20;
        break;
    }
    totalBTUs *= fatorInsolacao;

    if (numJanelas > 0) {
      const btuPorJanela = incidenciaSolar === 'tarde' || incidenciaSolar === 'dia-todo' ? 1000 : 600;
      totalBTUs += numJanelas * btuPorJanela;
    }

    totalBTUs += numAparelhos * 600;

    const btuComercial = encontrarCapacidadeComercial(Math.round(totalBTUs));

    setResultado({
      btuCalculado: Math.round(totalBTUs),
      btuComercial: btuComercial,
      area: area
    });
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
                Incidência solar no ambiente
              </Label>
              <RadioGroup
                value={incidenciaSolar}
                onValueChange={(value) => handleInputChange(setIncidenciaSolar, value)}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3"
              >
                <div className="flex items-center justify-center space-x-2 bg-white p-3 rounded-md border border-gray-200 hover:border-cyan-400 transition-colors">
                  <RadioGroupItem value="sem-sol" id="sem-sol" />
                  <Label htmlFor="sem-sol" className="cursor-pointer">
                    <span className="font-medium">Sem sol</span>
                    
                  </Label>
                </div>
                <div className="flex items-center justify-center space-x-2 bg-white p-3 rounded-md border border-gray-200 hover:border-cyan-400 transition-colors">
                  <RadioGroupItem value="pouco-sol" id="pouco-sol" />
                  <Label htmlFor="pouco-sol" className="cursor-pointer">
                    <span className="font-medium">Pouco sol</span>
                  </Label>
                </div>
                <div className="flex items-center justify-center space-x-2 bg-white p-3 rounded-md border border-gray-200 hover:border-cyan-400 transition-colors">
                  <RadioGroupItem value="dia-todo" id="sol-dia-todo" />
                  <Label htmlFor="sol-dia-todo" className="cursor-pointer">
                    <span className="font-medium">Sol intenso</span>
                  </Label>
                </div>
              </RadioGroup>
              {errors.incidenciaSolar && <p className="text-red-500 text-sm mt-1">{errors.incidenciaSolar}</p>}
            </div>
          </div>

          <Button 
            onClick={calcularBTUs} 
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white h-12 text-base font-semibold"
          >
            <Calculator className="mr-2 h-5 w-5" />
            Calcular
          </Button>
        </div>

        {resultado && (
          <motion.div
            key={resultado.btuCalculado}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="mt-8 space-y-4"
          >
            <div className="bg-gradient-to-r from-s-green to-s-blue p-6 rounded-xl text-white shadow-lg">
              <p className="text-sm font-medium opacity-90 mb-2">Capacidade Recomendada</p>
              <div className="flex items-center justify-center gap-3">
                <Thermometer className="h-10 w-10" />
                <p className="text-5xl font-bold">{resultado.btuComercial.toLocaleString('pt-BR')}</p>
                <span className="text-2xl font-semibold">BTUs</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
              <h4 className="font-semibold text-amber-900 mb-2 flex items-center">
                <span className="mr-2">⚠️</span> Observações Importantes
              </h4>
              <ul className="text-sm text-amber-800 space-y-1 ml-6 list-disc">
                <li>Este cálculo é uma estimativa baseada em padrões da indústria</li>
                <li>Consulte um profissional para ambientes com características especiais</li>
              </ul>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default CalculatorComponent;
