import * as XLSX from "xlsx"
import type { AnalysisResults, StudentGrades } from "@/types/analysis"

const EXCLUDED_TEXTS = [
  "TOTAL DE ESTUDIANTES",
  "APROBADAS/OS",
  "DESAPROBADAS/OS",
  "SIN EVALUAR",
  "TOTAL DE CLASES DE LA MATERIA",
  "CLASES EFECTIVAMENTE DADAS",
  "TOTAL",
  "APROBADO",
  "DESAPROBADO",
]

const EXCLUDED_SHEETS = [
  "TALLER GENERAL",
  "TALLERGENERAL",
  "TALLER",
  "RESUMEN",
  "ESTADISTICAS",
  "ESTADÍSTICA",
  "SUMMARY",
]

function isValidStudentName(name: string): boolean {
  if (!name || name.trim().length === 0) return false

  const upperName = name.toUpperCase().trim()

  if (upperName.includes("PASE")) {
    return false
  }

  // Check if the name contains any excluded text
  for (const excluded of EXCLUDED_TEXTS) {
    if (upperName.includes(excluded)) {
      return false
    }
  }

  const trimmedName = name.trim()
  if (trimmedName.length < 3) return false

  // Must contain at least one letter (not just numbers or symbols)
  if (!/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(trimmedName)) return false

  // Should not be just numbers
  if (/^\d+$/.test(trimmedName)) return false

  return true
}

function shouldProcessSheet(sheetName: string): boolean {
  if (!sheetName || sheetName.trim().length === 0) return false

  const normalizedSheetName = sheetName.toUpperCase().trim().replace(/\s+/g, " ") // Replace multiple spaces with single space

  console.log("[v0] Evaluando hoja:", sheetName, "->", normalizedSheetName)

  for (const excluded of EXCLUDED_SHEETS) {
    const normalizedExcluded = excluded.toUpperCase().trim()
    if (normalizedSheetName.includes(normalizedExcluded) || normalizedSheetName === normalizedExcluded) {
      console.log("[v0] Hoja excluida:", sheetName)
      return false
    }
  }

  console.log("[v0] Hoja procesada:", sheetName)
  return true
}

export async function processExcelFile(file: File): Promise<AnalysisResults> {
  const data = await file.arrayBuffer()
  const workbook = XLSX.read(data, { type: "array" })

  console.log("[v0] Total de hojas en el archivo:", workbook.SheetNames.length)
  console.log("[v0] Nombres de hojas:", workbook.SheetNames)

  const studentGrades: Map<string, StudentGrades> = new Map()

  const validSheets = workbook.SheetNames.filter(shouldProcessSheet)
  const totalSubjects = validSheets.length

  console.log("[v0] Hojas válidas a procesar:", validSheets.length, validSheets)

  for (const sheetName of validSheets) {
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

    console.log("[v0] Procesando hoja:", sheetName, "- Total de filas:", jsonData.length)

    // Start from row 11 (index 10)
    let validStudentsInSheet = 0
    for (let i = 10; i < jsonData.length; i++) {
      const row = jsonData[i]

      // Column B (index 1) - Student name
      const studentName = row[1]?.toString().trim()

      if (!isValidStudentName(studentName)) {
        if (studentName && studentName.length > 0) {
          console.log("[v0] Nombre inválido ignorado en fila", i + 1, ":", studentName)
        }
        continue
      }

      validStudentsInSheet++

      // Column I (index 8) - First quarter grade
      const firstQuarterGradeRaw = row[8]?.toString().trim().toUpperCase()
      const firstQuarterGrade = !firstQuarterGradeRaw || firstQuarterGradeRaw === "" ? "TEA" : firstQuarterGradeRaw

      // Column Q (index 16) - Second quarter grade
      const secondQuarterGradeRaw = row[16]?.toString().trim().toUpperCase()
      const secondQuarterGrade = !secondQuarterGradeRaw || secondQuarterGradeRaw === "" ? "TEA" : secondQuarterGradeRaw

      // Initialize student if not exists
      if (!studentGrades.has(studentName)) {
        studentGrades.set(studentName, {
          name: studentName,
          firstQuarter: { TEA: 0, TEP: 0, TED: 0 },
          secondQuarter: { TEA: 0, TEP: 0, TED: 0 },
        })
      }

      const student = studentGrades.get(studentName)!

      // Count grades for first quarter
      if (firstQuarterGrade === "TEA") {
        student.firstQuarter.TEA++
      } else if (firstQuarterGrade === "TEP") {
        student.firstQuarter.TEP++
      } else if (firstQuarterGrade === "TED") {
        student.firstQuarter.TED++
      }

      // Count grades for second quarter
      if (secondQuarterGrade === "TEA") {
        student.secondQuarter.TEA++
      } else if (secondQuarterGrade === "TEP") {
        student.secondQuarter.TEP++
      } else if (secondQuarterGrade === "TED") {
        student.secondQuarter.TED++
      }
    }

    console.log("[v0] Estudiantes válidos encontrados en", sheetName, ":", validStudentsInSheet)
  }

  console.log("[v0] Total de estudiantes únicos:", studentGrades.size)

  // Calculate statistics
  const results: AnalysisResults = {
    totalStudents: studentGrades.size,
    totalSubjects,
    firstQuarter: {
      allTEA: 0,
      allTEAStudents: [],
      upTo5TEPTЕД: 0,
      upTo5TEPTEDStudents: [],
      sixOrMoreTEPTED: 0,
      sixOrMoreTEPTEDStudents: [],
    },
    secondQuarter: {
      allTEA: 0,
      allTEAStudents: [],
      upTo5TEPTЕД: 0,
      upTo5TEPTEDStudents: [],
      sixOrMoreTEPTED: 0,
      sixOrMoreTEPTEDStudents: [],
    },
  }

  // Analyze each student
  for (const student of studentGrades.values()) {
    // First Quarter Analysis
    const firstTEPTED = student.firstQuarter.TEP + student.firstQuarter.TED
    const firstTotalGrades = student.firstQuarter.TEA + firstTEPTED

    if (firstTotalGrades === totalSubjects && student.firstQuarter.TEA === totalSubjects) {
      results.firstQuarter.allTEA++
      results.firstQuarter.allTEAStudents.push(student.name)
    } else if (firstTEPTED >= 1 && firstTEPTED <= 5) {
      results.firstQuarter.upTo5TEPTЕД++
      results.firstQuarter.upTo5TEPTEDStudents.push(student.name)
    } else if (firstTEPTED >= 6) {
      results.firstQuarter.sixOrMoreTEPTED++
      results.firstQuarter.sixOrMoreTEPTEDStudents.push(student.name)
    }

    // Second Quarter Analysis
    const secondTEPTED = student.secondQuarter.TEP + student.secondQuarter.TED
    const secondTotalGrades = student.secondQuarter.TEA + secondTEPTED

    if (secondTotalGrades === totalSubjects && student.secondQuarter.TEA === totalSubjects) {
      results.secondQuarter.allTEA++
      results.secondQuarter.allTEAStudents.push(student.name)
    } else if (secondTEPTED >= 1 && secondTEPTED <= 5) {
      results.secondQuarter.upTo5TEPTЕД++
      results.secondQuarter.upTo5TEPTEDStudents.push(student.name)
    } else if (secondTEPTED >= 6) {
      results.secondQuarter.sixOrMoreTEPTED++
      results.secondQuarter.sixOrMoreTEPTEDStudents.push(student.name)
    }
  }

  console.log("[v0] Resultados finales:", results)

  return results
}
