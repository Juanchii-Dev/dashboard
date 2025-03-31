import { Button } from "@/components/ui/button";

export default function Debts() {
  return (
    <main className="flex-1 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold font-montserrat text-gray-900 dark:text-white">Deudas y ahorros</h2>
          <Button>Añadir registro</Button>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-gray-500 dark:text-gray-400">
            En esta sección podrás gestionar tus deudas y ahorros. Pronto estará disponible.
          </p>
        </div>
      </div>
    </main>
  );
}
