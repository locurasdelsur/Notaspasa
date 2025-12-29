"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertCircle, XCircle, FileSpreadsheet, ChevronDown, ChevronUp, TrendingUp } from "lucide-react"
import type { AnalysisData } from "@/lib/excel-processor"
import { useState } from "react"

interface AnalysisResultsProps {
  data: AnalysisData
}

export function AnalysisResults({ data }: AnalysisResultsProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const toggleCategory = (key: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }

  const getIcon = (type: "tea" | "hasta5" | "mas5") => {
    switch (type) {
      case "tea":
        return <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
      case "hasta5":
        return <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
      case "mas5":
        return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
    }
  }

  const getColorClass = (type: "tea" | "hasta5" | "mas5") => {
    switch (type) {
      case "tea":
        return "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20"
      case "hasta5":
        return "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/20"
      case "mas5":
        return "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20"
    }
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <TrendingUp className="w-6 h-6" />
                Resumen General
              </CardTitle>
              <CardDescription>Análisis consolidado de todas las materias</CardDescription>
            </div>
            <Badge variant="default" className="text-base px-4 py-1">
              {data.sheets.length} Materias
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.generalSummary.map((column, colIndex) => (
              <div key={colIndex} className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  {column.columnName}
                </h3>
                <div className="space-y-2">
                  <div className={`p-3 rounded-lg border ${getColorClass("tea")}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getIcon("tea")}
                        <span className="text-sm font-medium">TODO TEA</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{column.todoTEA}</span>
                        {column.todoTEA > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => toggleCategory(`general-${colIndex}-tea`)}
                          >
                            {expandedCategories.has(`general-${colIndex}-tea`) ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    {expandedCategories.has(`general-${colIndex}-tea`) && (
                      <div className="mt-3 pt-3 border-t border-green-300 dark:border-green-800">
                        <p className="text-xs font-semibold mb-2 text-green-800 dark:text-green-200">
                          Lista de alumnos:
                        </p>
                        <ul className="space-y-1 text-sm">
                          {column.todoTEAStudents.map((student, idx) => (
                            <li key={idx} className="text-green-900 dark:text-green-100">
                              {student}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className={`p-3 rounded-lg border ${getColorClass("hasta5")}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getIcon("hasta5")}
                        <span className="text-sm font-medium">Hasta 5 TEP/TED</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{column.hasta5TEP}</span>
                        {column.hasta5TEP > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => toggleCategory(`general-${colIndex}-hasta5`)}
                          >
                            {expandedCategories.has(`general-${colIndex}-hasta5`) ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    {expandedCategories.has(`general-${colIndex}-hasta5`) && (
                      <div className="mt-3 pt-3 border-t border-yellow-300 dark:border-yellow-800">
                        <div className="space-y-3">
                          {column.hasta5TEPStudentsWithSubjects.map((item, idx) => (
                            <div key={idx} className="space-y-1">
                              <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                                {item.student}
                              </p>
                              <p className="text-xs text-yellow-800 dark:text-yellow-200 ml-3">
                                Materias: {item.subjects.join(", ")}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`p-3 rounded-lg border ${getColorClass("mas5")}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getIcon("mas5")}
                        <span className="text-sm font-medium">6+ TEP/TED</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{column.mas5TEP}</span>
                        {column.mas5TEP > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => toggleCategory(`general-${colIndex}-mas5`)}
                          >
                            {expandedCategories.has(`general-${colIndex}-mas5`) ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    {expandedCategories.has(`general-${colIndex}-mas5`) && (
                      <div className="mt-3 pt-3 border-t border-red-300 dark:border-red-800">
                        <div className="space-y-3">
                          {column.mas5TEPStudentsWithSubjects.map((item, idx) => (
                            <div key={idx} className="space-y-1">
                              <p className="text-sm font-semibold text-red-900 dark:text-red-100">{item.student}</p>
                              <p className="text-xs text-red-800 dark:text-red-200 ml-3">
                                Materias: {item.subjects.join(", ")}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Desglose por Materia</h2>
        {data.sheets.map((sheet, sheetIndex) => (
          <Card key={sheetIndex} className="shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5" />
                    {sheet.sheetName}
                  </CardTitle>
                  <CardDescription>Total de estudiantes procesados: {sheet.totalStudents}</CardDescription>
                </div>
                {sheet.hasTallerGeneral && <Badge variant="secondary">Con Taller General</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sheet.columns.map((column, colIndex) => (
                  <div key={colIndex} className="space-y-3">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      {column.columnName}
                    </h3>
                    <div className="space-y-2">
                      <div className={`p-3 rounded-lg border ${getColorClass("tea")}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getIcon("tea")}
                            <span className="text-sm font-medium">TODO TEA</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold">{column.todoTEA}</span>
                            {column.todoTEA > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => toggleCategory(`${sheetIndex}-${colIndex}-tea`)}
                              >
                                {expandedCategories.has(`${sheetIndex}-${colIndex}-tea`) ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                        {expandedCategories.has(`${sheetIndex}-${colIndex}-tea`) && (
                          <div className="mt-3 pt-3 border-t border-green-300 dark:border-green-800">
                            <ul className="space-y-1 text-sm">
                              {column.todoTEAStudents.map((student, idx) => (
                                <li key={idx} className="text-green-900 dark:text-green-100">
                                  {student}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className={`p-3 rounded-lg border ${getColorClass("hasta5")}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getIcon("hasta5")}
                            <span className="text-sm font-medium">Hasta 5 TEP/TED</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold">{column.hasta5TEP}</span>
                            {column.hasta5TEP > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => toggleCategory(`${sheetIndex}-${colIndex}-hasta5`)}
                              >
                                {expandedCategories.has(`${sheetIndex}-${colIndex}-hasta5`) ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                        {expandedCategories.has(`${sheetIndex}-${colIndex}-hasta5`) && (
                          <div className="mt-3 pt-3 border-t border-yellow-300 dark:border-yellow-800">
                            <ul className="space-y-1 text-sm">
                              {column.hasta5TEPStudents.map((student, idx) => (
                                <li key={idx} className="text-yellow-900 dark:text-yellow-100">
                                  {student}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className={`p-3 rounded-lg border ${getColorClass("mas5")}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getIcon("mas5")}
                            <span className="text-sm font-medium">6+ TEP/TED</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold">{column.mas5TEP}</span>
                            {column.mas5TEP > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => toggleCategory(`${sheetIndex}-${colIndex}-mas5`)}
                              >
                                {expandedCategories.has(`${sheetIndex}-${colIndex}-mas5`) ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                        {expandedCategories.has(`${sheetIndex}-${colIndex}-mas5`) && (
                          <div className="mt-3 pt-3 border-t border-red-300 dark:border-red-800">
                            <ul className="space-y-1 text-sm">
                              {column.mas5TEPStudents.map((student, idx) => (
                                <li key={idx} className="text-red-900 dark:text-red-100">
                                  {student}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
