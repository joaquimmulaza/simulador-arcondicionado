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

  const calcularBTUs = (e: React.FormEvent) => {
    e.preventDefault();
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
              onChange={(e) => setArea(Number(e.target.value))}
            />
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
              onChange={(e) => setPessoas(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center text-foreground">
              <Sun className="mr-2 h-4 w-4 text-primary" />
              Incidência solar
            </Label>
            <RadioGroup
              onValueChange={setIncidenciaSolar}
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
              onChange={(e) => setAparelhos(Number(e.target.value))}
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
