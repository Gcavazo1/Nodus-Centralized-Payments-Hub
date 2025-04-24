"use client";

import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

// Color families organized by hue ranges
const colorPalettes = {
  grayscale: [
    { name: "Black", value: "oklch(0.0 0.0 0.0)" },
    { name: "Dark Gray", value: "oklch(0.2 0.01 0)" },
    { name: "Gray", value: "oklch(0.5 0.02 0)" },
    { name: "Light Gray", value: "oklch(0.8 0.02 0)" },
    { name: "White", value: "oklch(1 0 0)" },
  ],
  red: [
    { name: "Dark Red", value: "oklch(0.4 0.18 25)" },
    { name: "Red", value: "oklch(0.55 0.22 25)" },
    { name: "Bright Red", value: "oklch(0.65 0.26 25)" },
    { name: "Light Red", value: "oklch(0.75 0.15 25)" },
    { name: "Pink", value: "oklch(0.8 0.12 0)" },
  ],
  orange: [
    { name: "Brown", value: "oklch(0.45 0.12 55)" },
    { name: "Dark Orange", value: "oklch(0.55 0.18 55)" },
    { name: "Orange", value: "oklch(0.65 0.22 55)" },
    { name: "Light Orange", value: "oklch(0.75 0.18 55)" },
    { name: "Peach", value: "oklch(0.85 0.1 55)" },
  ],
  yellow: [
    { name: "Olive", value: "oklch(0.5 0.12 85)" },
    { name: "Gold", value: "oklch(0.75 0.18 85)" },
    { name: "Yellow", value: "oklch(0.85 0.2 85)" },
    { name: "Light Yellow", value: "oklch(0.92 0.15 85)" },
    { name: "Cream", value: "oklch(0.95 0.05 85)" },
  ],
  green: [
    { name: "Dark Green", value: "oklch(0.4 0.15 135)" },
    { name: "Forest Green", value: "oklch(0.5 0.18 135)" },
    { name: "Green", value: "oklch(0.6 0.2 135)" },
    { name: "Light Green", value: "oklch(0.75 0.15 135)" },
    { name: "Mint", value: "oklch(0.85 0.1 135)" },
  ],
  blue: [
    { name: "Navy", value: "oklch(0.3 0.15 250)" },
    { name: "Dark Blue", value: "oklch(0.4 0.18 250)" },
    { name: "Blue", value: "oklch(0.55 0.2 250)" },
    { name: "Light Blue", value: "oklch(0.7 0.15 250)" },
    { name: "Sky Blue", value: "oklch(0.85 0.1 250)" },
  ],
  purple: [
    { name: "Dark Purple", value: "oklch(0.35 0.18 300)" },
    { name: "Purple", value: "oklch(0.5 0.2 300)" },
    { name: "Violet", value: "oklch(0.65 0.22 300)" },
    { name: "Lavender", value: "oklch(0.75 0.15 300)" },
    { name: "Light Purple", value: "oklch(0.85 0.1 300)" },
  ],
  pink: [
    { name: "Magenta", value: "oklch(0.55 0.25 330)" },
    { name: "Hot Pink", value: "oklch(0.65 0.28 330)" },
    { name: "Pink", value: "oklch(0.75 0.2 330)" },
    { name: "Light Pink", value: "oklch(0.85 0.15 330)" },
    { name: "Baby Pink", value: "oklch(0.9 0.08 330)" },
  ],
};

// Extract just the values for the simple grid view
const allPredefinedColors = Object.values(colorPalettes).flatMap(
  colors => colors.map(c => c.value)
);

// Helper function to parse OKLCH values
function parseOklch(oklchStr: string) {
  try {
    const values = oklchStr.match(/oklch\(([^)]+)\)/)?.[1].split(' ');
    if (!values || values.length < 3) return { l: 0.5, c: 0.1, h: 0 };
    
    return {
      l: parseFloat(values[0]),
      c: parseFloat(values[1]),
      h: parseFloat(values[2]),
    };
  } catch {
    return { l: 0.5, c: 0.1, h: 0 };
  }
}

// Helper function to format OKLCH values
function formatOklch(l: number, c: number, h: number): string {
  return `oklch(${l.toFixed(2)} ${c.toFixed(2)} ${Math.round(h)})`;
}

interface ColorPickerInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

export function ColorPickerInput({ 
  value, 
  onChange, 
  label 
}: ColorPickerInputProps) {
  const [inputValue, setInputValue] = useState(value);
  
  // Parse the current color for advanced editing
  const { l, c, h } = parseOklch(value);
  const [lightness, setLightness] = useState(l);
  const [chroma, setChroma] = useState(c);
  const [hue, setHue] = useState(h);

  // Update sliders when the input value changes
  useEffect(() => {
    const { l, c, h } = parseOklch(value);
    setLightness(l);
    setChroma(c);
    setHue(h);
  }, [value]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleInputBlur = () => {
    if (inputValue.trim() !== '') {
      onChange(inputValue);
    }
  };
  
  const handleColorSelect = (color: string) => {
    setInputValue(color);
    onChange(color);
  };

  const handleSliderChange = () => {
    const newColor = formatOklch(lightness, chroma, hue);
    setInputValue(newColor);
    onChange(newColor);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <div 
              className="w-10 h-10 rounded border cursor-pointer" 
              style={{ background: value }}
              aria-label="Select color"
            />
          </PopoverTrigger>
          <PopoverContent className="w-[320px] p-3">
            <Tabs defaultValue="palette">
              <TabsList className="grid w-full grid-cols-3 mb-2">
                <TabsTrigger value="palette">Palette</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
                <TabsTrigger value="families">Families</TabsTrigger>
              </TabsList>
              
              {/* Simple grid of colors */}
              <TabsContent value="palette" className="mt-0">
                <div className="grid grid-cols-8 gap-1 py-2">
                  {allPredefinedColors.map((color) => (
                    <div 
                      key={color}
                      className="w-8 h-8 rounded cursor-pointer hover:ring-2 ring-primary"
                      style={{ background: color }}
                      onClick={() => handleColorSelect(color)}
                      title={color}
                    />
                  ))}
                </div>
              </TabsContent>
              
              {/* Advanced sliders */}
              <TabsContent value="advanced" className="mt-0 space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span>Lightness</span>
                    <span>{lightness.toFixed(2)}</span>
                  </div>
                  <Slider 
                    value={[lightness]} 
                    min={0} 
                    max={1} 
                    step={0.01} 
                    onValueChange={([l]) => setLightness(l)}
                    onValueCommit={handleSliderChange}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span>Chroma (Saturation)</span>
                    <span>{chroma.toFixed(2)}</span>
                  </div>
                  <Slider 
                    value={[chroma]} 
                    min={0} 
                    max={0.3} 
                    step={0.01} 
                    onValueChange={([c]) => setChroma(c)}
                    onValueCommit={handleSliderChange}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span>Hue</span>
                    <span>{Math.round(hue)}°</span>
                  </div>
                  <Slider 
                    value={[hue]} 
                    min={0} 
                    max={360} 
                    step={1} 
                    onValueChange={([h]) => setHue(h)}
                    onValueCommit={handleSliderChange}
                  />
                  <div className="h-4 w-full rounded-sm mt-1" style={{
                    background: "linear-gradient(to right, oklch(0.7 0.2 0), oklch(0.7 0.2 60), oklch(0.7 0.2 120), oklch(0.7 0.2 180), oklch(0.7 0.2 240), oklch(0.7 0.2 300), oklch(0.7 0.2 360))"
                  }} />
                </div>
                
                <div className="h-8 w-full rounded-sm mt-2" style={{ background: formatOklch(lightness, chroma, hue) }} />
              </TabsContent>
              
              {/* Organized color families */}
              <TabsContent value="families" className="mt-0">
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {Object.entries(colorPalettes).map(([family, colors]) => (
                    <div key={family} className="space-y-1">
                      <div className="text-xs font-medium capitalize mb-1">{family}</div>
                      <div className="flex gap-1">
                        {colors.map((color) => (
                          <div 
                            key={color.value}
                            className="w-8 h-8 rounded cursor-pointer hover:ring-2 ring-primary"
                            style={{ background: color.value }}
                            onClick={() => handleColorSelect(color.value)}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </PopoverContent>
        </Popover>
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder="oklch(0.5 0.2 240)"
          className="font-mono text-sm"
        />
      </div>
    </div>
  );
} 