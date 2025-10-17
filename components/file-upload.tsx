"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
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
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
    disabled: isProcessing,
  })

  return (
    <Card className="overflow-hidden border-2 border-dashed transition-colors hover:border-primary/50">
      <div
        {...getRootProps()}
        className={`cursor-pointer p-8 text-center transition-colors md:p-12 ${
          isDragActive ? "bg-primary/5" : "bg-card"
        } ${isProcessing ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <input {...getInputProps()} />

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
