"use client"

import { Input } from "@/components/ui/input"
import { forwardRef } from "react"

interface MoneyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: string
  onChange?: (value: string) => void
  currency?: string
}


const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ value = "", onChange, currency = "S/", className, ...props }, ref) => {
    const formatValue = (val: string) => {
      // Remover todo excepto dígitos y punto decimal
      const cleaned = val.replace(/[^\d.]/g, '')
      
      // Prevenir múltiples puntos decimales
      const parts = cleaned.split('.')
      if (parts.length > 2) {
        return parts[0] + '.' + parts[1]
      }
      
      // Limitar a 2 decimales
      if (parts[1] && parts[1].length > 2) {
        return parts[0] + '.' + parts[1].substring(0, 2)
      }
      
      return cleaned
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value
      const formattedValue = formatValue(rawValue)
      
      // Llamar onChange con el valor formateado
      onChange?.(formattedValue)
    }


    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
          S/
        </span>
        <Input
          ref={ref}
          {...props}
          type="text"  // ¡Usamos text pero con validación!
          inputMode="decimal"
          pattern="[0-9]*\.?[0-9]*"
          placeholder="0.00"
          className="pl-8"
          value={value}
          onChange={handleChange}
        />
      </div>
    )
  }
)

MoneyInput.displayName = "MoneyInput"

export { MoneyInput }