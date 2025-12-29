"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileSpreadsheet, Download } from "lucide-react"
import { ExcelAnalyzer } from "@/components/excel-analyzer"
import { AnalysisResults } from "@/components/analysis-results"
import type { AnalysisData } from "@/lib/excel-processor"

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [results, setResults] = useState<AnalysisData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile)
    setResults(null)
  }

  const handleAnalysisComplete = (data: AnalysisData) => {
    setResults(data)
    setIsProcessing(false)
  }

  const handleDownloadReport = () => {
    if (!results) return

    const reportText = generateTextReport(results)
    const blob = new Blob([reportText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "reporte-analisis.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  const generateTextReport = (data: AnalysisData): string => {
    let report = "REPORTE DE ANÁLISIS DE CALIFICACIONES\n"
    report += "=".repeat(50) + "\n\n"

    data.sheets.forEach((sheet) => {
      report += `\nHOJA: ${sheet.sheetName}\n`
      report += "-".repeat(50) + "\n"
      report += `Total de estudiantes procesados: ${sheet.totalStudents}\n\n`

      sheet.columns.forEach((col) => {
        report += `\n${col.columnName}:\n`
        report += `  - TODO TEA: ${col.todoTEA}\n`
        report += `  - Hasta 5 materias TEP/TED: ${col.hasta5TEP}\n`
        report += `  - 6 o más materias TEP/TED: ${col.mas5TEP}\n`
      })
      report += "\n"
    })

    return report
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-primary/10 p-4 rounded-2xl">
                <FileSpreadsheet className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-balance bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Analizador de Calificaciones Excel
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Carga tu planilla Excel y obtén un análisis automático de las calificaciones según las valoraciones TEA,
              TEP y TED
            </p>
          </div>

          {/* Upload Card */}
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Cargar Archivo Excel
              </CardTitle>
              <CardDescription>Selecciona un archivo .xlsx o .xls para analizar</CardDescription>
            </CardHeader>
            <CardContent>
              <ExcelAnalyzer
                onFileSelect={handleFileSelect}
                onAnalysisComplete={handleAnalysisComplete}
                onProcessingStart={() => setIsProcessing(true)}
              />
            </CardContent>
          </Card>

          {/* Results */}
          {results && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Resultados del Análisis</h2>
                <Button onClick={handleDownloadReport} variant="outline" className="gap-2 bg-transparent">
                  <Download className="w-4 h-4" />
                  Descargar Reporte
                </Button>
              </div>
              <AnalysisResults data={results} />
            </div>
          )}

          {/* Info Card */}
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
            <CardHeader>
              <CardTitle className="text-blue-900 dark:text-blue-300">Criterios de Análisis</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
              <p>
                <strong>TODO TEA:</strong> Estudiantes con calificación 7 o más en todas las materias
              </p>
              <p>
                <strong>TEP/TED hasta 5:</strong> Estudiantes con hasta 5 materias con calificación menor a 7 (o CSA/CCA
                para Diciembre/Febrero)
              </p>
              <p>
                <strong>TEP/TED 6 o más:</strong> Estudiantes con 6 o más materias con calificación menor a 7 (o CSA/CCA
                para Diciembre/Febrero)
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
