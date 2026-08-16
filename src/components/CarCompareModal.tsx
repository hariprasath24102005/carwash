import React from 'react';
import { X, Check, ArrowRight, ShieldCheck, Zap, Gauge, Calendar, Trash2 } from 'lucide-react';
import { Car } from '../types';

interface CarCompareModalProps {
  cars: Car[];
  onClose: () => void;
  onRemoveCar: (carId: string) => void;
  onSelectCar: (car: Car) => void;
  onBookWash: (car: Car) => void;
}

export const CarCompareModal: React.FC<CarCompareModalProps> = ({
  cars,
  onClose,
  onRemoveCar,
  onSelectCar,
  onBookWash,
}) => {
  if (cars.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div 
        id="car-compare-modal"
        className="relative w-full max-w-6xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Vehicle Comparison Matrix ({cars.length} of 3)
            </h2>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Side-by-side performance, certified score, and pricing
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Table */}
        <div className="overflow-x-auto p-6">
          <div className="grid grid-cols-4 gap-4 min-w-[760px]">
            {/* Column 1: Labels */}
            <div className="space-y-4 pt-44 font-semibold text-xs text-slate-500 dark:text-slate-400">
              <div className="h-10 flex items-center border-b border-slate-100 dark:border-slate-800">Price</div>
              <div className="h-10 flex items-center border-b border-slate-100 dark:border-slate-800">Condition</div>
              <div className="h-10 flex items-center border-b border-slate-100 dark:border-slate-800">Mileage</div>
              <div className="h-10 flex items-center border-b border-slate-100 dark:border-slate-800">0 - 60 MPH Acceleration</div>
              <div className="h-10 flex items-center border-b border-slate-100 dark:border-slate-800">Horsepower & Engine</div>
              <div className="h-10 flex items-center border-b border-slate-100 dark:border-slate-800">Fuel & Efficiency</div>
              <div className="h-10 flex items-center border-b border-slate-100 dark:border-slate-800">Drivetrain & Gearbox</div>
              <div className="h-10 flex items-center border-b border-slate-100 dark:border-slate-800">Inspection Pass Score</div>
              <div className="h-12 flex items-center">Actions</div>
            </div>

            {/* Compared Cars Columns */}
            {cars.map((car) => (
              <div 
                key={car.id} 
                className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
              >
                {/* Header & Image */}
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {car.year} {car.make}
                    </span>
                    <button
                      title="Remove from comparison"
                      onClick={() => onRemoveCar(car.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded hover:bg-white dark:hover:bg-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1 mb-2">
                    {car.model}
                  </h4>
                  <img
                    src={car.images[0]}
                    alt={car.model}
                    className="w-full h-28 object-cover rounded-xl shadow-sm mb-4"
                  />
                </div>

                {/* Specs Rows */}
                <div className="space-y-4 text-xs">
                  <div className="h-10 flex items-center font-bold text-base text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700">
                    ${car.price.toLocaleString()}
                  </div>

                  <div className="h-10 flex items-center border-b border-slate-200 dark:border-slate-700">
                    <span className="px-2.5 py-0.5 font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-full text-[11px]">
                      {car.condition}
                    </span>
                  </div>

                  <div className="h-10 flex items-center font-medium text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                    {car.mileage.toLocaleString()} miles
                  </div>

                  <div className="h-10 flex items-center font-bold text-amber-600 dark:text-amber-400 border-b border-slate-200 dark:border-slate-700">
                    <Zap className="w-3.5 h-3.5 mr-1" /> {car.zeroToSixty}
                  </div>

                  <div className="h-10 flex items-center font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                    {car.horsepower} HP ({car.fuelType})
                  </div>

                  <div className="h-10 flex items-center text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 truncate">
                    {car.mpgOrRange}
                  </div>

                  <div className="h-10 flex items-center text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 truncate">
                    {car.drivetrain}
                  </div>

                  <div className="h-10 flex items-center font-bold text-emerald-600 dark:text-emerald-400 border-b border-slate-200 dark:border-slate-700">
                    <ShieldCheck className="w-4 h-4 mr-1 text-emerald-500" /> {car.inspectionScore}/150
                  </div>

                  <div className="h-12 flex items-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        onClose();
                        onSelectCar(car);
                      }}
                      className="flex-1 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-lg text-xs"
                    >
                      Specs
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        onBookWash(car);
                      }}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs"
                    >
                      Wash Prep
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty Slot Placeholder if < 3 */}
            {Array.from({ length: 3 - cars.length }).map((_, idx) => (
              <div
                key={idx}
                className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-400 text-xs min-h-[400px]"
              >
                <span>Add another car from the catalog to compare</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
