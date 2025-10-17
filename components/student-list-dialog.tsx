"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface StudentListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  students: string[]
}

export function StudentListDialog({ open, onOpenChange, title, description, students }: StudentListDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[400px] pr-4">
          {students.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No hay estudiantes en esta categoría</p>
          ) : (
            <ul className="space-y-2">
              {students.map((student, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 rounded-lg border bg-card p-3 text-sm hover:bg-accent/50 transition-colors"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <span className="font-medium">{student}</span>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
