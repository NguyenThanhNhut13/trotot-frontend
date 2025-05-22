import React, { useState } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'
import { useMutation } from '@tanstack/react-query'
import authApi from '../../apis/auth.api'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

type OTPModalProps = {
  show: boolean
  handleClose: () => void
  credential: string
  onVerifySuccess?: (token: string) => void // Optional callback for forgot password flow
}

const OTPModal: React.FC<OTPModalProps> = ({ show, handleClose, credential, onVerifySuccess }) => {
  const navigate = useNavigate()
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const verifyOtpMutation = useMutation({
    mutationFn: async (body: { credential: string; otp: string }) => {
      if (onVerifySuccess) {
        // Forgot password flow
        const res = await authApi.forgotPasswordVerifyOtp({ type: 'forgot-password', credential: body.credential, otp: body.otp });
        // Normalize to SuccessResponse<string>
        return {
          ...res,
          data: {
            data: res.data.data,
            message: res.data.message
          }
        };
      } else {
        // Registration flow
        // Assume authApi.verifyOtp returns AxiosResponse<SuccessResponse<string>>
        return authApi.verifyOtp({ credential: body.credential, otp: body.otp });
      }
    },
    onSuccess: (data) => {
      toast.success('Xác minh OTP thành công!')
      if (onVerifySuccess) {
        // For forgot password flow, pass the token back
        const token = data.data.data
        // Ensure token is a string before passing to onVerifySuccess
        if (typeof token === 'string') {
          onVerifySuccess(token)
        } else if (token && typeof token === 'object' && 'accessToken' in token) {
          onVerifySuccess(token.accessToken)
        }
      } else {
        // For registration flow, navigate to homepage
        handleClose()
        navigate('/')
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Xác minh thất bại')
    }
  })

  const handleVerify = () => {
    if (!otp.trim()) {
      toast.error('Vui lòng nhập mã OTP')
      return
    }

    setIsLoading(true)
    verifyOtpMutation.mutate(
      { credential, otp },
      {
        onSettled: () => setIsLoading(false)
      }
    )
  }

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Xác thực OTP</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Nhập mã OTP</Form.Label>
          <Form.Control
            type="text"
            placeholder="Nhập mã OTP đã gửi"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        </Form.Group>
        <Button variant="primary" onClick={handleVerify} disabled={isLoading}>
          {isLoading ? 'Đang xác thực...' : 'Xác nhận'}
        </Button>
      </Modal.Body>
    </Modal>
  )
}

export default OTPModal