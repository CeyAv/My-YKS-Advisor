"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StudentProfile, PuanTuru, UniTuru, Seviye } from "@/types";

interface FormProps {
  onSubmit: (profile: StudentProfile) => void;
}

const PUAN_TURLERI: PuanTuru[] = ["TYT", "EA", "SAY", "SÖZ", "DİL"];

export default function StudentForm({ onSubmit }: FormProps) {
  const [form, setForm] = useState<StudentProfile>({
    sinif: "12. Sınıf",
    puanTuru: "TYT",
    puan: 0,
    sehirTercihi: "",
    uniTuruTercihi: "HEPSI",
    seviyeTercihi: "hepsi",
    ilgiAlanlari: "",
    hedefler: "",
  });

  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "puan" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.puan <= 0) {
      setError("Lütfen geçerli bir puan giriniz (0'dan büyük olmalı).");
      return;
    }

    if (form.puan > 600) {
      setError("Puan 600'den büyük olamaz.");
      return;
    }

    onSubmit(form);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-blue-600 text-white rounded-xl p-2.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 14l9-5-9-5-9 5 9 5zm0 7l-9-5 9-5 9 5-9 5z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">YKS Advisor</h1>
            <p className="text-sm text-gray-500">
              Kişiselleştirilmiş üniversite rehberliği
            </p>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-gray-700 mb-6">
          Profilinizi doldurun, size özel bölüm önerileri alalım 🎯
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Sinif */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sınıf / Durum
              </label>
              <select
                name="sinif"
                value={form.sinif}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option>9. Sınıf</option>
                <option>10. Sınıf</option>
                <option>11. Sınıf</option>
                <option>12. Sınıf</option>
                <option>Mezun (1. yıl)</option>
                <option>Mezun (2+ yıl)</option>
              </select>
            </div>

            {/* Seviye Tercihi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Eğitim Seviyesi
              </label>
              <select
                name="seviyeTercihi"
                value={form.seviyeTercihi}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="hepsi">Lisans ve Önlisans</option>
                <option value="lisans">Yalnızca Lisans (4 yıl)</option>
                <option value="önlisans">Yalnızca Önlisans (2 yıl)</option>
              </select>
            </div>
          </div>

          {/* Puan Türü + Puan */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Puan Türü
              </label>
              <select
                name="puanTuru"
                value={form.puanTuru}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {PUAN_TURLERI.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tahmini Puanınız
              </label>
              <input
                type="number"
                name="puan"
                value={form.puan || ""}
                onChange={handleChange}
                placeholder="Örn: 320.50"
                step="0.01"
                min="0"
                max="600"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Şehir + Üniversite Türü */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Şehir Tercihi{" "}
                <span className="text-gray-400 font-normal">(opsiyonel)</span>
              </label>
              <input
                type="text"
                name="sehirTercihi"
                value={form.sehirTercihi}
                onChange={handleChange}
                placeholder="Örn: ANKARA, İSTANBUL"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Üniversite Türü
              </label>
              <select
                name="uniTuruTercihi"
                value={form.uniTuruTercihi}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="HEPSI">Devlet ve Vakıf</option>
                <option value="DEVLET">Yalnızca Devlet</option>
                <option value="VAKIF">Yalnızca Vakıf</option>
              </select>
            </div>
          </div>

          {/* İlgi Alanları */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              İlgi Alanları & Hobiler
            </label>
            <textarea
              name="ilgiAlanlari"
              value={form.ilgiAlanlari}
              onChange={handleChange}
              rows={2}
              placeholder="Örn: Teknoloji, programlama, tasarım, spor, müzik..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Hedefler */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kariyer Hedefleri & Beklentiler{" "}
              <span className="text-gray-400 font-normal">(opsiyonel)</span>
            </label>
            <textarea
              name="hedefler"
              value={form.hedefler}
              onChange={handleChange}
              rows={2}
              placeholder="Örn: İyi bir iş bulmak, yurt dışına çıkmak, kendi işimi kurmak..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
          >
            Danışmanımla Görüşmeye Başla →
          </button>
        </form>
      </div>
    </div>
  );
}
