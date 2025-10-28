import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Ruler, Users, Sun, Tv, Calculator as CalculatorIcon, Thermometer } from 'lucide-react';

const Calculator = () => {
  const [area, setArea] = useState(0);
  const [pessoas, setPessoas] = useState(1);
  const [incidenciaSolar, setIncidenciaSolar] = useState('');
  const [aparelhos, setAparelhos] = useState(0);
  const [btus, setBtus] = useState(0);
  const [errors, setErrors] = useState({
    area: '',
    pessoas: '',
    incidenciaSolar: '',
  });

  const validate = () => {
    const newErrors = { area: '', pessoas: '', incidenciaSolar: '' };
    let isValid = true;

    if (area <= 0) {
      newErrors.area = 'A área deve ser maior que zero.';
      isValid = false;
    }
    if (pessoas <= 0) {
      newErrors.pessoas = 'O número de pessoas deve ser de no mínimo 1.';
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
      setBtus(0);
      return;
    }

    let totalBTUs = 0;
    totalBTUs += area * 600;
    if (pessoas > 1) {
      totalBTUs += (pessoas - 1) * 600;
    }
    if (incidenciaSolar !== '') {
      totalBTUs += 800;
    }
    totalBTUs += aparelhos * 600;

    setBtus(totalBTUs);
  };

  const handleInputChange = <T,>(setter: React.Dispatch<React.SetStateAction<T>>, value: T) => {
    setter(value);
    setBtus(0);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-s-blue to-s-cyan">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card p-8 rounded-lg shadow-2xl w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-center text-primary mb-6">Calculadora de BTUs</h1>
        <form onSubmit={calcularBTUs} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="area" className="flex items-center text-foreground">
              <Ruler className="mr-2 h-4 w-4 text-primary" />
              Área do ambiente (m²)
            </Label>
            <Input
              type="number"
              id="area"
              value={area}
              onChange={(e) => handleInputChange(setArea, Number(e.target.value))}
            />
            {errors.area && <p className="text-red-500 text-sm mt-1">{errors.area}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pessoas" className="flex items-center text-foreground">
              <Users className="mr-2 h-4 w-4 text-primary" />
              Número de pessoas
            </Label>
            <Input
              type="number"
              id="pessoas"
              value={pessoas}
              onChange={(e) => handleInputChange(setPessoas, Number(e.target.value))}
            />
            {errors.pessoas && <p className="text-red-500 text-sm mt-1">{errors.pessoas}</p>}
          </div>
          <div className="space-y-2">
            <Label className="flex items-center text-foreground">
              <Sun className="mr-2 h-4 w-4 text-primary" />
              Incidência solar
            </Label>
            <RadioGroup
              onValueChange={(value) => handleInputChange(setIncidenciaSolar, value)}
              className="flex items-center space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="manha" id="sol-manha" />
                <Label htmlFor="sol-manha">Manhã</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tarde" id="sol-tarde" />
                <Label htmlFor="sol-tarde">Tarde</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dia-todo" id="sol-dia-todo" />
                <Label htmlFor="sol-dia-todo">Dia todo</Label>
              </div>
            </RadioGroup>
            {errors.incidenciaSolar && <p className="text-red-500 text-sm mt-1">{errors.incidenciaSolar}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="aparelhos" className="flex items-center text-foreground">
              <Tv className="mr-2 h-4 w-4 text-primary" />
              Aparelhos eletrônicos
            </Label>
            <Input
              type="number"
              id="aparelhos"
              value={aparelhos}
              onChange={(e) => handleInputChange(setAparelhos, Number(e.target.value))}
            />
          </div>
          <Button type="submit" className="w-full">
            <CalculatorIcon className="mr-2 h-4 w-4" />
            Calcular
          </Button>
        </form>
        {btus > 0 && (
          <motion.div
            key={btus}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 text-center bg-s-lime/20 p-4 rounded-lg border border-s-lime/30"
          >
            <p className="text-lg font-medium text-foreground">Potência recomendada:</p>
            <p className="text-3xl font-bold text-accent flex items-center justify-center">
              <Thermometer className="mr-2 h-8 w-8" />
              {btus.toLocaleString('pt-BR')} BTUs
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Calculator;
