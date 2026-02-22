import { useState } from 'react'

export type SessionUser = {
  id: number
  name: string
  email: string
}

export const useSessionState = () => {
  const [userId, setUserId] = useState<number | null>(null)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')

  const setSession = (user: SessionUser) => {
    setUserId(user.id)
    setUserName(user.name)
    setUserEmail(user.email)
  }

  const clearSession = () => {
    setUserId(null)
    setUserName('')
    setUserEmail('')
  }

  return {
    userId,
    userName,
    userEmail,
    setSession,
    clearSession,
  }
}
