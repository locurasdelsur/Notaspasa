"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AnalysisResults } from "@/types/analysis"
import { CheckCircle2, AlertCircle, XCircle, Users, BookOpen } from "lucide-react"
import { StudentListDialog } from "@/components/student-list-dialog"
import { useState } from "react"

interface ResultsDisplayProps {
  results: AnalysisResults
}

interface DialogState {
  open: boolean
  title: string
  description: string
  students: string[]
}

export function ResultsDisplay({ results }: ResultsDisplayProps) {
  const [dialogState, setDialogState] = useState<DialogState>({
    open: false,
    title: "",
    description: "",
    students: [],
  })

  const openStudentList = (title: string, description: string, students: string[]) => {
    setDialogState({
      open: true,
      title,
      description,
      students,
    })
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary bg-gradient-to-br from-card to-primary/10 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Users className="h-4 w-4" />
              Total Estudiantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{results.totalStudents}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent bg-gradient-to-br from-card to-accent/10 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              Total Materias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent-foreground">{results.totalSubjects}</div>
          </CardContent>
        </Card>

        <Card
          className="border-l-4 border-l-primary bg-gradient-to-br from-card to-primary/10 cursor-pointer hover:shadow-lg transition-all shadow-md"
          onClick={() =>
            openStudentList(
              "Todas TEA - Primer Cuatrimestre",
              "Estudiantes con todas las materias aprobadas (TEA)",
              results.firstQuarter.allTEAStudents,
            )
          }
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              Todas TEA (1º)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{results.firstQuarter.allTEA}</div>
          </CardContent>
        </Card>

        <Card
          className="border-l-4 border-l-primary bg-gradient-to-br from-card to-primary/10 cursor-pointer hover:shadow-lg transition-all shadow-md"
          onClick={() =>
            openStudentList(
              "Todas TEA - Segunda Valoración",
              "Estudiantes con todas las materias aprobadas (TEA)",
              results.secondQuarter.allTEAStudents,
            )
          }
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              Todas TEA (2º)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{results.secondQuarter.allTEA}</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Results */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* First Quarter */}
        <Card className="shadow-lg border-2 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/15 to-accent/10">
            <CardTitle className="flex items-center gap-2 text-xl">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                1º
              </span>
              Primer Cuatrimestre
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div
                className="flex items-center justify-between rounded-lg bg-primary/10 border-2 border-primary/30 p-4 cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() =>
                  openStudentList(
                    "Todas las materias TEA - Primer Cuatrimestre",
                    "Estudiantes con todas las materias aprobadas completamente",
                    results.firstQuarter.allTEAStudents,
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Todas las materias TEA</p>
                    <p className="text-sm text-muted-foreground">Aprobadas completamente</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-primary">{results.firstQuarter.allTEA}</div>
              </div>

              <div
                className="flex items-center justify-between rounded-lg bg-yellow-50 border-2 border-yellow-300 p-4 dark:bg-yellow-950/20 dark:border-yellow-700 cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-950/30 transition-colors"
                onClick={() =>
                  openStudentList(
                    "Hasta 5 materias TEP/TED - Primer Cuatrimestre",
                    "Estudiantes en situación regular",
                    results.firstQuarter.upTo5TEPTEDStudents,
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  <div>
                    <p className="font-semibold text-foreground">Hasta 5 materias TEP/TED</p>
                    <p className="text-sm text-muted-foreground">Situación regular</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {results.firstQuarter.upTo5TEPTЕД}
                </div>
              </div>

              <div
                className="flex items-center justify-between rounded-lg bg-red-50 border-2 border-red-300 p-4 dark:bg-red-950/20 dark:border-red-700 cursor-pointer hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors"
                onClick={() =>
                  openStudentList(
                    "6 o más materias TEP/TED - Primer Cuatrimestre",
                    "Estudiantes que requieren atención",
                    results.firstQuarter.sixOrMoreTEPTEDStudents,
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  <div>
                    <p className="font-semibold text-foreground">6 o más materias TEP/TED</p>
                    <p className="text-sm text-muted-foreground">Requiere atención</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {results.firstQuarter.sixOrMoreTEPTED}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Second Quarter */}
        <Card className="shadow-lg border-2 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-accent/10 to-primary/15">
            <CardTitle className="flex items-center gap-2 text-xl">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                2º
              </span>
              Segunda Valoración Preliminar
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div
                className="flex items-center justify-between rounded-lg bg-primary/10 border-2 border-primary/30 p-4 cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() =>
                  openStudentList(
                    "Todas las materias TEA - Segunda Valoración",
                    "Estudiantes con todas las materias aprobadas completamente",
                    results.secondQuarter.allTEAStudents,
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Todas las materias TEA</p>
                    <p className="text-sm text-muted-foreground">Aprobadas completamente</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-primary">{results.secondQuarter.allTEA}</div>
              </div>

              <div
                className="flex items-center justify-between rounded-lg bg-yellow-50 border-2 border-yellow-300 p-4 dark:bg-yellow-950/20 dark:border-yellow-700 cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-950/30 transition-colors"
                onClick={() =>
                  openStudentList(
                    "Hasta 5 materias TEP/TED - Segunda Valoración",
                    "Estudiantes en situación regular",
                    results.secondQuarter.upTo5TEPTEDStudents,
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  <div>
                    <p className="font-semibold text-foreground">Hasta 5 materias TEP/TED</p>
                    <p className="text-sm text-muted-foreground">Situación regular</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {results.secondQuarter.upTo5TEPTЕД}
                </div>
              </div>

              <div
                className="flex items-center justify-between rounded-lg bg-red-50 border-2 border-red-300 p-4 dark:bg-red-950/20 dark:border-red-700 cursor-pointer hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors"
                onClick={() =>
                  openStudentList(
                    "6 o más materias TEP/TED - Segunda Valoración",
                    "Estudiantes que requieren atención",
                    results.secondQuarter.sixOrMoreTEPTEDStudents,
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  <div>
                    <p className="font-semibold text-foreground">6 o más materias TEP/TED</p>
                    <p className="text-sm text-muted-foreground">Requiere atención</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {results.secondQuarter.sixOrMoreTEPTED}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <StudentListDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState({ ...dialogState, open })}
        title={dialogState.title}
        description={dialogState.description}
        students={dialogState.students}
      />
    </div>
  )
}
