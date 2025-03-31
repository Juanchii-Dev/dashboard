export const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
];

export const CATEGORIES = {
  INCOME: [
    { id: 'salary', name: 'Salario' },
    { id: 'investment', name: 'Inversiones' },
    { id: 'freelance', name: 'Trabajo freelance' },
    { id: 'gift', name: 'Regalos' },
    { id: 'other_income', name: 'Otros ingresos' }
  ],
  EXPENSE: [
    { id: 'housing', name: 'Vivienda' },
    { id: 'food', name: 'Alimentación' },
    { id: 'transport', name: 'Transporte' },
    { id: 'entertainment', name: 'Ocio' },
    { id: 'utilities', name: 'Servicios' },
    { id: 'healthcare', name: 'Salud' },
    { id: 'education', name: 'Educación' },
    { id: 'shopping', name: 'Compras' },
    { id: 'debt', name: 'Deudas' },
    { id: 'other_expense', name: 'Otros gastos' }
  ]
};

export const TIME_PERIODS = {
  MONTH: 'month',
  QUARTER: 'quarter',
  HALF_YEAR: '6months',
  YEAR: 'year'
};

export const GOAL_TYPES = [
  { id: 'savings', name: 'Ahorro' },
  { id: 'debt_payment', name: 'Pago de deuda' },
  { id: 'purchase', name: 'Compra' },
  { id: 'vacation', name: 'Vacaciones' },
  { id: 'education', name: 'Educación' },
  { id: 'retirement', name: 'Jubilación' },
  { id: 'emergency_fund', name: 'Fondo de emergencia' },
  { id: 'other', name: 'Otro' }
];

export const DEBT_TYPES = [
  { id: 'credit_card', name: 'Tarjeta de crédito' },
  { id: 'mortgage', name: 'Hipoteca' },
  { id: 'personal_loan', name: 'Préstamo personal' },
  { id: 'student_loan', name: 'Préstamo estudiantil' },
  { id: 'car_loan', name: 'Préstamo de coche' },
  { id: 'other_debt', name: 'Otra deuda' }
];

export const SAVINGS_TYPES = [
  { id: 'savings_account', name: 'Cuenta de ahorro' },
  { id: 'investment_account', name: 'Cuenta de inversión' },
  { id: 'retirement_account', name: 'Cuenta de jubilación' },
  { id: 'cash', name: 'Efectivo' },
  { id: 'other_savings', name: 'Otros ahorros' }
];
