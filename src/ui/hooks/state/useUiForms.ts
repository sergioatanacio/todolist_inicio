import { useState, type Dispatch, type SetStateAction } from 'react'

export type UiForms = {
  name: string
  email: string
  password: string
  workspaceName: string
  projectName: string
  projectDescription: string
  dispName: string
  dispDescription: string
  dispStart: string
  dispEnd: string
  segName: string
  segDescription: string
  segStart: string
  segEnd: string
  segDates: string
  segDaysWeek: string
  segDaysMonth: string
  segExclusions: string
  listName: string
  selectedDispId: string
  taskTitle: string
  taskDuration: string
}

export type UiFormSetters = {
  setName: (value: string) => void
  setEmail: (value: string) => void
  setPassword: (value: string) => void
  setWorkspaceName: (value: string) => void
  setProjectName: (value: string) => void
  setProjectDescription: (value: string) => void
  setDispName: (value: string) => void
  setDispDescription: (value: string) => void
  setDispStart: (value: string) => void
  setDispEnd: (value: string) => void
  setSegName: (value: string) => void
  setSegDescription: (value: string) => void
  setSegStart: (value: string) => void
  setSegEnd: (value: string) => void
  setSegDates: (value: string) => void
  setSegDaysWeek: (value: string) => void
  setSegDaysMonth: (value: string) => void
  setSegExclusions: (value: string) => void
  setListName: (value: string) => void
  setSelectedDispId: Dispatch<SetStateAction<string>>
  setTaskTitle: (value: string) => void
  setTaskDuration: (value: string) => void
}

export const useUiForms = (): { forms: UiForms; setForms: UiFormSetters } => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [workspaceName, setWorkspaceName] = useState('')
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [dispName, setDispName] = useState('')
  const [dispDescription, setDispDescription] = useState('')
  const [dispStart, setDispStart] = useState('')
  const [dispEnd, setDispEnd] = useState('')
  const [segName, setSegName] = useState('')
  const [segDescription, setSegDescription] = useState('')
  const [segStart, setSegStart] = useState('')
  const [segEnd, setSegEnd] = useState('')
  const [segDates, setSegDates] = useState('')
  const [segDaysWeek, setSegDaysWeek] = useState('')
  const [segDaysMonth, setSegDaysMonth] = useState('')
  const [segExclusions, setSegExclusions] = useState('')
  const [listName, setListName] = useState('')
  const [selectedDispId, setSelectedDispId] = useState('')
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDuration, setTaskDuration] = useState('30')

  return {
    forms: {
      name,
      email,
      password,
      workspaceName,
      projectName,
      projectDescription,
      dispName,
      dispDescription,
      dispStart,
      dispEnd,
      segName,
      segDescription,
      segStart,
      segEnd,
      segDates,
      segDaysWeek,
      segDaysMonth,
      segExclusions,
      listName,
      selectedDispId,
      taskTitle,
      taskDuration,
    },
    setForms: {
      setName,
      setEmail,
      setPassword,
      setWorkspaceName,
      setProjectName,
      setProjectDescription,
      setDispName,
      setDispDescription,
      setDispStart,
      setDispEnd,
      setSegName,
      setSegDescription,
      setSegStart,
      setSegEnd,
      setSegDates,
      setSegDaysWeek,
      setSegDaysMonth,
      setSegExclusions,
      setListName,
      setSelectedDispId,
      setTaskTitle,
      setTaskDuration,
    },
  }
}
