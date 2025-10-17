"use client"

import { useState } from "react"
import { FileUpload } from "@/components/file-upload"
import { ResultsDisplay } from "@/components/results-display"
import type { AnalysisResults } from "@/types/analysis"
import { FileSpreadsheet } from "lucide-react"
import Image from "next/image"

export default function Home() {
  const [results, setResults] = useState<AnalysisResults | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/5">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center md:mb-12">
            <div className="mb-6 flex justify-center">
              <div className="relative h-32 w-32 md:h-40 md:w-40">
                <Image src="/logo-colegio.png" alt="E.E.S.T. Nº 6 Banfield" fill className="object-contain" priority />
              </div>
            </div>
            <h1 className="mb-2 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              E.E.S.T. Nº 6 - Banfield
            </h1>
            <p className="mb-4 text-lg text-muted-foreground md:text-xl">Lomas de Zamora</p>
            <div className="mx-auto mb-4 inline-flex items-center justify-center rounded-2xl bg-primary/10 p-3">
              <FileSpreadsheet className="h-8 w-8 text-primary md:h-10 md:w-10" />
            </div>
            <h2 className="mb-3 text-balance text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Analizador de Calificaciones
            </h2>
            <p className="text-pretty text-base text-muted-foreground md:text-lg">
              Carga tu archivo Excel y obtén estadísticas detalladas de TEA, TEP y TED
            </p>
          </div>

          {/* Upload Section */}
          <div className="mb-8">
            <FileUpload onResults={setResults} isProcessing={isProcessing} setIsProcessing={setIsProcessing} />
          </div>

          {/* Results Section */}
          {results && !isProcessing && <ResultsDisplay results={results} />}

          {/* Info Section */}
          {!results && !isProcessing && (
            <div className="mt-12 rounded-xl border-2 border-primary/20 bg-card p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-semibold text-card-foreground">Instrucciones</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    1
                  </span>
                  <span>Cada hoja del Excel representa una materia</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    2
                  </span>
                  <span>Los nombres de alumnos deben estar en la columna B (desde fila 11)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    3
                  </span>
                  <span>Columna I: CALIFICACIÓN 1º CUATRIMESTRE</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    4
                  </span>
                  <span>Columna Q: 2º VALORACIÓN PRELIMINAR</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
