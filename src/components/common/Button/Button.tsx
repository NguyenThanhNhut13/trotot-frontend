import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  children: React.ReactNode
}

export default function Button({ loading = false, children, className = '', ...rest }: ButtonProps) {
  return (
    <button
      className={`btn btn-primary w-100 d-flex justify-content-center align-items-center ${className}`}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading && (
        <span className='spinner-border spinner-border-sm me-2' role='status' aria-hidden='true'></span>
      )}
      {loading ? 'Logging in...' : children}
    </button>
  )
}
