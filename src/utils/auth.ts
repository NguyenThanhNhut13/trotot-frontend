import { User } from '../types/user.type'

export const LocalStorageEventTarget = new EventTarget()

export const setAccessTokenToLS = (accessToken: string) => {
  localStorage.setItem('accessToken', accessToken)
}

export const setRefreshTokenToLS = (refreshToken: string) => {
  localStorage.setItem('refreshToken', refreshToken)
}

export const clearLS = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('profile')
}

export const getAccessTokenFromLS = () => localStorage.getItem('accessToken') || ''

export const getRefreshTokenFromLS = () => localStorage.getItem('refreshToken') || ''

export const getProfileFromLS = () => {
  try {
    const result = localStorage.getItem('profile')
    return result ? JSON.parse(result) : null
  } catch (error) {
    console.error('Failed to parse profile from LS:', error)
    return null
  }
}

export const setProfileToLS = (profile: User ) => {
  if (profile) {
    localStorage.setItem('profile', JSON.stringify(profile))
  } else {
    localStorage.removeItem('profile')
  }
}

