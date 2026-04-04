"use client";

import { Program } from "@/types";

interface UniversityPanelProps {
  programs: Program[];
  totalFound: number;
  isLoading: boolean;
  selectedProgram: Program | null;
  onSelectProgram: (program: Program | null) => void;
}

export default function UniversityPanel({
  programs,
  totalFound,
  isLoading,
  selectedProgram,
  onSelectProgram,
}: UniversityPanelProps) {
  // Panel is ALWAYS rendered — never hidden
  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-bold text-gray-900 text-base">Tercih Listesi</h2>
        {!isLoading && (
          <p className="text-xs text-gray-500 mt-0.5">
            {totalFound === 0
              ? "Uygun program bulunamadı"
              : `${totalFound} program bulundu${programs.length < totalFound ? `, ilk ${programs.length} gösteriliyor` : ""}`}
          </p>
        )}
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          /* Loading skeleton */
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-gray-100 rounded-lg p-3 animate-pulse"
              >
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : programs.length === 0 ? (
          /* Empty state — always shows, never hides the panel */
          <div className="flex flex-col items-center justify-center h-full text-center py-8 px-4">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-semibold text-gray-700 mb-2">
              Uygun Program Bulunamadı
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Girdiğiniz kriterlere uygun üniversite programı bulunamadı. Şehir
              tercihini kaldırmayı, puan türünü değiştirmeyi veya farklı
              üniversite türü seçmeyi deneyebilirsiniz.
            </p>
          </div>
        ) : (
          /* Program list */
          <div className="space-y-2">
            {programs.map((program) => {
              const isSelected = selectedProgram?.kod === program.kod;
              return (
                <button
                  key={program.kod}
                  onClick={() =>
                    onSelectProgram(isSelected ? null : program)
                  }
                  className={`w-full text-left rounded-lg p-3 border transition-all text-xs ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                  }`}
                >
                  <p className="font-semibold text-gray-800 text-sm leading-tight mb-1">
                    {program.programAdi}
                  </p>
                  <p className="text-gray-600 mb-1 truncate">{program.uniAdi}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        program.uniTuru === "DEVLET"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {program.uniTuru}
                    </span>
                    <span className="text-gray-400">{program.sehir}</span>
                    <span className="ml-auto text-blue-600 font-semibold">
                      {program.enKucukPuan?.toFixed(0)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Program Detail */}
      {selectedProgram && (
        <div className="border-t border-gray-200 p-4 bg-blue-50">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-sm text-gray-900">
              {selectedProgram.programAdi}
            </h3>
            <button
              onClick={() => onSelectProgram(null)}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-gray-600 mb-3">{selectedProgram.uniAdi}</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white rounded p-2">
              <p className="text-gray-500">Fakülte</p>
              <p className="font-medium text-gray-800 text-xs mt-0.5 leading-tight">
                {selectedProgram.fakulte}
              </p>
            </div>
            <div className="bg-white rounded p-2">
              <p className="text-gray-500">Şehir</p>
              <p className="font-medium text-gray-800 mt-0.5">
                {selectedProgram.sehir}
              </p>
            </div>
            <div className="bg-white rounded p-2">
              <p className="text-gray-500">Taban Puan</p>
              <p className="font-bold text-blue-600 mt-0.5">
                {selectedProgram.enKucukPuan?.toFixed(3)}
              </p>
            </div>
            <div className="bg-white rounded p-2">
              <p className="text-gray-500">Tavan Puan</p>
              <p className="font-bold text-green-600 mt-0.5">
                {selectedProgram.enBuyukPuan?.toFixed(3)}
              </p>
            </div>
            <div className="bg-white rounded p-2">
              <p className="text-gray-500">Kontenjan</p>
              <p className="font-medium text-gray-800 mt-0.5">
                {selectedProgram.kontenjan ?? "-"}
              </p>
            </div>
            <div className="bg-white rounded p-2">
              <p className="text-gray-500">Seviye</p>
              <p className="font-medium text-gray-800 capitalize mt-0.5">
                {selectedProgram.seviye}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
