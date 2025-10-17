export interface GradeCount {
  TEA: number
  TEP: number
  TED: number
}

export interface StudentGrades {
  name: string
  firstQuarter: GradeCount
  secondQuarter: GradeCount
}

export interface QuarterResults {
  allTEA: number
  allTEAStudents: string[]
  upTo5TEPTЕД: number
  upTo5TEPTEDStudents: string[]
  sixOrMoreTEPTED: number
  sixOrMoreTEPTEDStudents: string[]
}

export interface AnalysisResults {
  totalStudents: number
  totalSubjects: number
  firstQuarter: QuarterResults
  secondQuarter: QuarterResults
}
