/**
 * Formatea un número como moneda (EUR)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Formatea una fecha para mostrar en la UI
 */
export function formatDate(date: string | Date): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Si la fecha es hoy
  const today = new Date();
  if (dateObj.toDateString() === today.toDateString()) {
    return `Hoy, ${formatTime(dateObj)}`;
  }
  
  // Si la fecha es ayer
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (dateObj.toDateString() === yesterday.toDateString()) {
    return `Ayer, ${formatTime(dateObj)}`;
  }
  
  // Para otras fechas
  return `${dateObj.toLocaleDateString('es-ES')}, ${formatTime(dateObj)}`;
}

/**
 * Formatea la hora en formato HH:MM
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  });
}

/**
 * Formatea un porcentaje
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}
