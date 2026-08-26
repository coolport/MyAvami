import { useEffect, useState } from 'react'
import { Navigate } from 'react-router'
import type { ReactNode } from 'react'
import { getSessionUser } from '../services/authService'
import type { UserRole } from '../types'

interface ProtectedRouteProps {
  allowedRoles: UserRole[]
  children: ReactNode
}

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null) // null = loading

  useEffect(() => {
    let cancelled = false

    const verifyUser = async () => {
      const user = await getSessionUser()
      if (cancelled) return

      if (!user) {
        setIsAuthorized(false)
      } else {
        setIsAuthorized(allowedRoles.includes(user.role))
      }
    }

    verifyUser()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowedRoles.join(',')])

  if (isAuthorized === null) return <div>Loading...</div>
  if (!isAuthorized) return <Navigate to="/unauthorized" />

  return <>{children}</>
}

export default ProtectedRoute
