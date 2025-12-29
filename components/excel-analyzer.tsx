"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react"
import { processExcelFile, type AnalysisData } from "@/lib/excel-processor"
import { useToast } from "@/hooks/use-toast"

interface ExcelAnalyzerProps {
  onFileSelect: (file: File) => void
  onAnalysisComplete: (data: AnalysisData) => void
  onProcessingStart: () => void
}

export function ExcelAnalyzer({ onFileSelect, onAnalysisComplete, onProcessingStart }: ExcelAnalyzerProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedFileName, setSelectedFileName] = useState<string>("")
  const { toast } = useToast()

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.match(/\.(xlsx|xls)$/i)) {
        toast({
          title: "Error",
          description: "Por favor selecciona un archivo Excel válido (.xlsx o .xls)",
          variant: "destructive",
        })
        return
      }

      setSelectedFileName(file.name)
      onFileSelect(file)
      onProcessingStart()
      setIsProcessing(true)

      try {
        const results = await processExcelFile(file)
        onAnalysisComplete(results)
        toast({
          title: "Análisis completado",
          description: `Se procesaron ${results.sheets.length} hojas exitosamente`,
        })
      } catch (error) {
        console.error("[v0] Error processing Excel file:", error)
        toast({
          title: "Error al procesar",
          description: error instanceof Error ? error.message : "Error desconocido",
          variant: "destructive",
        })
      } finally {
        setIsProcessing(false)
      }
    },
    [onFileSelect, onAnalysisComplete, onProcessingStart, toast],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile],
  )

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-4">
          {isProcessing ? (
            <>
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Procesando archivo...</p>
            </>
          ) : (
            <>
              <div className="bg-primary/10 p-4 rounded-full">
                <FileSpreadsheet className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Arrastra y suelta tu archivo Excel aquí</p>
                <p className="text-xs text-muted-foreground">o</p>
              </div>
              <Button asChild variant="outline" disabled={isProcessing}>
                <label className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Seleccionar archivo
                  <input type="file" accept=".xlsx,.xls" onChange={handleFileInput} className="sr-only" />
                </label>
              </Button>
            </>
          )}
        </div>
      </div>

      {selectedFileName && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileSpreadsheet className="w-4 h-4" />
          <span className="truncate">{selectedFileName}</span>
        </div>
      )}
    </div>
  )
}
