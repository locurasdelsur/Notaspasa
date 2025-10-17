"use client"

import type React from "react"

import { useCallback, useState, useRef } from "react"
import { Upload, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { processExcelFile } from "@/lib/excel-processor"
import type { AnalysisResults } from "@/types/analysis"

interface FileUploadProps {
  onResults: (results: AnalysisResults) => void
  isProcessing: boolean
  setIsProcessing: (processing: boolean) => void
}

export function FileUpload({ onResults, isProcessing, setIsProcessing }: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    async (file: File) => {
      if (!file) return

      // Validate file type
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ]
      if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
        alert("Por favor, selecciona un archivo Excel válido (.xlsx o .xls)")
        return
      }

      setIsProcessing(true)

      try {
        const results = await processExcelFile(file)
        onResults(results)
      } catch (error) {
        console.error("Error processing file:", error)
        alert("Error al procesar el archivo. Por favor, verifica el formato.")
      } finally {
        setIsProcessing(false)
      }
    },
    [onResults, setIsProcessing],
  )

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!isProcessing) {
        setIsDragActive(true)
      }
    },
    [isProcessing],
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragActive(false)

      if (isProcessing) return

      const files = e.dataTransfer.files
      if (files.length > 0) {
        handleFile(files[0])
      }
    },
    [isProcessing, handleFile],
  )

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFile(files[0])
      }
    },
    [handleFile],
  )

  const handleClick = useCallback(() => {
    if (!isProcessing && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [isProcessing])

  return (
    <Card className="overflow-hidden border-2 border-dashed transition-colors hover:border-primary/50">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`cursor-pointer p-8 text-center transition-colors md:p-12 ${
          isDragActive ? "bg-primary/5" : "bg-card"
        } ${isProcessing ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          onChange={handleFileInputChange}
          disabled={isProcessing}
          className="hidden"
        />

        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          {isProcessing ? (
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          ) : (
            <Upload className="h-10 w-10 text-primary" />
          )}
        </div>

        {isProcessing ? (
          <div>
            <p className="mb-2 text-lg font-semibold text-foreground">Procesando archivo...</p>
            <p className="text-sm text-muted-foreground">Esto puede tomar unos momentos</p>
          </div>
        ) : (
          <div>
            <p className="mb-2 text-lg font-semibold text-foreground">
              {isDragActive ? "Suelta el archivo aquí" : "Arrastra tu archivo Excel aquí"}
            </p>
            <p className="mb-4 text-sm text-muted-foreground">o haz clic para seleccionar</p>
            <Button variant="outline" size="lg" className="gap-2 bg-transparent">
              <FileSpreadsheet className="h-5 w-5" />
              Seleccionar archivo
            </Button>
            <p className="mt-4 text-xs text-muted-foreground">Formatos soportados: .xlsx, .xls</p>
          </div>
        )}
      </div>
    </Card>
  )
}
