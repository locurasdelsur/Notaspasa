import * as XLSX from "xlsx"

export interface ColumnAnalysis {
  columnName: string
  todoTEA: number
  hasta5TEP: number
  mas5TEP: number
  todoTEAStudents: string[]
  hasta5TEPStudents: string[]
  mas5TEPStudents: string[]
  hasta5TEPStudentsWithSubjects: Array<{ student: string; subjects: string[] }>
  mas5TEPStudentsWithSubjects: Array<{ student: string; subjects: string[] }>
}

export interface SheetAnalysis {
  sheetName: string
  totalStudents: number
  hasTallerGeneral: boolean
  columns: ColumnAnalysis[]
}

export interface GeneralSummary {
  columnName: string
  todoTEA: number
  hasta5TEP: number
  mas5TEP: number
  todoTEAStudents: string[]
  hasta5TEPStudentsWithSubjects: Array<{ student: string; subjects: string[] }>
  mas5TEPStudentsWithSubjects: Array<{ student: string; subjects: string[] }>
}

export interface AnalysisData {
  generalSummary: GeneralSummary[]
  sheets: SheetAnalysis[]
}

const EXCLUDED_SHEETS = [
  "Lenguajes Tecnológicos I",
  "Lenguajes Tecnológicos II",
  "Lenguajes Tecnológicos III",
  "Procedimientos Técnicos I",
  "Procedimientos Técnicos II",
  "Procedimientos Técnicos III",
  "Sistemas Tecnológicos I",
  "Sistemas Tecnológicos II",
  "Sistemas Tecnológicos III",
]

const IGNORE_LABELS = [
  "TOTAL DE ESTUDIANTES",
  "APROBADAS/OS",
  "DESAPROBADAS/OS",
  "SIN EVALUAR",
  "TOTAL DE CLASES DE LA MATERIA",
  "CLASES EFECTIVAMENTE DADAS",
]

const COLUMNS_TO_ANALYZE = {
  J: { index: 9, name: "CALIFICACIÓN 1º CUATRIMESTRE", type: "preliminary" },
  R: { index: 17, name: "CALIFICACIÓN 2º CUATRIMESTRE", type: "preliminary" },
  U: { index: 20, name: "DICIEMBRE", type: "final" },
  V: { index: 21, name: "FEBRERO", type: "final" },
  W: { index: 22, name: "CALIFICACIÓN FINAL", type: "calification" },
}

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
}

function areNamesSimilar(name1: string, name2: string): boolean {
  const norm1 = normalizeString(name1)
  const norm2 = normalizeString(name2)

  // Check if one contains the other
  if (norm1.includes(norm2) || norm2.includes(norm1)) return true

  // Check Levenshtein distance for similar names
  const distance = levenshteinDistance(norm1, norm2)
  const maxLength = Math.max(norm1.length, norm2.length)
  const similarity = 1 - distance / maxLength

  return similarity > 0.8
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
      }
    }
  }

  return matrix[str2.length][str1.length]
}

function shouldIgnoreRow(cellValue: any): boolean {
  if (!cellValue) return false
  const strValue = String(cellValue).toUpperCase().trim()
  return IGNORE_LABELS.some((label) => strValue.includes(label))
}

function isGradeValid(value: any, columnType: string): boolean {
  if (value === null || value === undefined || value === "") return false

  const strValue = String(value).trim().toUpperCase()

  // For final columns, check for CSA/CCA prefixes
  if (columnType === "final") {
    if (strValue.startsWith("CSA") || strValue.startsWith("CCA")) {
      return true // This counts as TEP/TED
    }
  }

  const numValue = Number.parseFloat(strValue)
  return !isNaN(numValue)
}

function getNumericGrade(value: any): number | null {
  if (value === null || value === undefined || value === "") return null

  const strValue = String(value).trim()
  const numValue = Number.parseFloat(strValue)

  return isNaN(numValue) ? null : numValue
}

function hasCSAorCCA(value: any): boolean {
  if (value === null || value === undefined || value === "") return false
  const strValue = String(value).trim().toUpperCase()
  return strValue.startsWith("CSA") || strValue.startsWith("CCA")
}

export async function processExcelFile(file: File): Promise<AnalysisData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })

        const hasTallerGeneral = workbook.SheetNames.some((name) => normalizeString(name).includes("taller general"))

        const allStudentsMap = new Map<string, Map<string, Map<number, any>>>()

        const sheetsToProcess = workbook.SheetNames.filter((sn) => {
          if (hasTallerGeneral && EXCLUDED_SHEETS.includes(sn)) return false
          return true
        })

        for (const sheetName of sheetsToProcess) {
          const worksheet = workbook.Sheets[sheetName]
          const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: null,
            raw: false,
          })

          for (let rowIndex = 10; rowIndex < jsonData.length; rowIndex++) {
            const row = jsonData[rowIndex]
            const studentName = row[1] // Column B

            if (!studentName || shouldIgnoreRow(studentName)) continue

            // Check if this name is similar to existing students
            let matchingName: string | null = null
            for (const existingName of allStudentsMap.keys()) {
              if (areNamesSimilar(String(studentName), existingName)) {
                matchingName = existingName
                break
              }
            }

            const nameToUse = matchingName || String(studentName)

            if (!allStudentsMap.has(nameToUse)) {
              allStudentsMap.set(nameToUse, new Map())
            }

            const studentSheets = allStudentsMap.get(nameToUse)!
            if (!studentSheets.has(sheetName)) {
              studentSheets.set(sheetName, new Map())
            }

            const sheetData = studentSheets.get(sheetName)!
            for (const [colKey, colInfo] of Object.entries(COLUMNS_TO_ANALYZE)) {
              const grade = row[colInfo.index]
              sheetData.set(colInfo.index, grade)
            }
          }
        }

        const generalSummary: GeneralSummary[] = []

        for (const [colKey, colInfo] of Object.entries(COLUMNS_TO_ANALYZE)) {
          let todoTEA = 0
          let hasta5TEP = 0
          let mas5TEP = 0
          const todoTEAStudents: string[] = []
          const hasta5TEPStudentsWithSubjects: Array<{ student: string; subjects: string[] }> = []
          const mas5TEPStudentsWithSubjects: Array<{ student: string; subjects: string[] }> = []

          for (const [studentName, sheets] of allStudentsMap.entries()) {
            let tepTedCount = 0
            const subjectsWithTEP: string[] = []

            for (const [sheetName, grades] of sheets.entries()) {
              const grade = grades.get(colInfo.index)

              if (isGradeValid(grade, colInfo.type)) {
                let isTEP = false

                if (colInfo.type === "final") {
                  if (hasCSAorCCA(grade)) {
                    isTEP = true
                  } else {
                    const numGrade = getNumericGrade(grade)
                    if (numGrade !== null && numGrade < 7) {
                      isTEP = true
                    }
                  }
                } else {
                  const numGrade = getNumericGrade(grade)
                  if (numGrade !== null && numGrade < 7) {
                    isTEP = true
                  }
                }

                if (isTEP) {
                  tepTedCount++
                  subjectsWithTEP.push(sheetName)
                }
              }
            }

            if (tepTedCount === 0) {
              todoTEA++
              todoTEAStudents.push(studentName)
            } else if (tepTedCount <= 5) {
              hasta5TEP++
              hasta5TEPStudentsWithSubjects.push({ student: studentName, subjects: subjectsWithTEP })
            } else {
              mas5TEP++
              mas5TEPStudentsWithSubjects.push({ student: studentName, subjects: subjectsWithTEP })
            }
          }

          generalSummary.push({
            columnName: colInfo.name,
            todoTEA,
            hasta5TEP,
            mas5TEP,
            todoTEAStudents,
            hasta5TEPStudentsWithSubjects,
            mas5TEPStudentsWithSubjects,
          })
        }

        const results: SheetAnalysis[] = []

        for (const sheetName of sheetsToProcess) {
          const worksheet = workbook.Sheets[sheetName]
          const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: null,
            raw: false,
          })

          const students: Map<string, Map<number, any>> = new Map()

          for (let rowIndex = 10; rowIndex < jsonData.length; rowIndex++) {
            const row = jsonData[rowIndex]
            const studentName = row[1]

            if (!studentName || shouldIgnoreRow(studentName)) continue

            let matchingName: string | null = null
            for (const existingName of students.keys()) {
              if (areNamesSimilar(String(studentName), existingName)) {
                matchingName = existingName
                break
              }
            }

            const nameToUse = matchingName || String(studentName)

            if (!students.has(nameToUse)) {
              students.set(nameToUse, new Map())
            }

            const studentData = students.get(nameToUse)!
            for (const [colKey, colInfo] of Object.entries(COLUMNS_TO_ANALYZE)) {
              const grade = row[colInfo.index]
              studentData.set(colInfo.index, grade)
            }
          }

          const columnAnalyses: ColumnAnalysis[] = []

          for (const [colKey, colInfo] of Object.entries(COLUMNS_TO_ANALYZE)) {
            let todoTEA = 0
            let hasta5TEP = 0
            const mas5TEP = 0
            const todoTEAStudents: string[] = []
            const hasta5TEPStudents: string[] = []
            const mas5TEPStudents: string[] = []
            const hasta5TEPStudentsWithSubjects: Array<{ student: string; subjects: string[] }> = []
            const mas5TEPStudentsWithSubjects: Array<{ student: string; subjects: string[] }> = []

            for (const [studentName, grades] of students.entries()) {
              const grade = grades.get(colInfo.index)

              if (isGradeValid(grade, colInfo.type)) {
                let isTEP = false

                if (colInfo.type === "final") {
                  if (hasCSAorCCA(grade)) {
                    isTEP = true
                  } else {
                    const numGrade = getNumericGrade(grade)
                    if (numGrade !== null && numGrade < 7) {
                      isTEP = true
                    }
                  }
                } else {
                  const numGrade = getNumericGrade(grade)
                  if (numGrade !== null && numGrade < 7) {
                    isTEP = true
                  }
                }

                if (isTEP) {
                  hasta5TEP++
                  hasta5TEPStudents.push(studentName)
                  hasta5TEPStudentsWithSubjects.push({ student: studentName, subjects: [sheetName] })
                } else {
                  todoTEA++
                  todoTEAStudents.push(studentName)
                }
              }
            }

            columnAnalyses.push({
              columnName: colInfo.name,
              todoTEA,
              hasta5TEP,
              mas5TEP,
              todoTEAStudents,
              hasta5TEPStudents,
              mas5TEPStudents,
              hasta5TEPStudentsWithSubjects,
              mas5TEPStudentsWithSubjects,
            })
          }

          results.push({
            sheetName,
            totalStudents: students.size,
            hasTallerGeneral,
            columns: columnAnalyses,
          })
        }

        resolve({ generalSummary, sheets: results })
      } catch (error) {
        console.error("[v0] Error parsing Excel file:", error)
        reject(new Error("Error al procesar el archivo Excel"))
      }
    }

    reader.onerror = () => {
      reject(new Error("Error al leer el archivo"))
    }

    reader.readAsArrayBuffer(file)
  })
}
