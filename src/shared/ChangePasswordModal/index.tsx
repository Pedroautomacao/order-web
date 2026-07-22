import { useState } from 'react'
import { TextField } from '@mui/material'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'

import userService from 'services/userService'
import { usePopup } from 'hooks/usePopup'
import FormModal from 'shared/FormModal'
import { passwordSchema, PASSWORD_HELP } from 'shared/validation/password'

interface ChangePasswordModalProps {
  open: boolean
  onClose: () => void
}

const schema = Yup.object({
  currentPassword: Yup.string().required('Informe a senha atual'),
  newPassword: passwordSchema().required('Informe a nova senha'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'As senhas não coincidem')
    .required('Confirme a nova senha'),
})

type Form = Yup.InferType<typeof schema>

/** Modal para o usuário logado trocar a própria senha (atual + nova 2x). */
export const ChangePasswordModal = ({ open, onClose }: ChangePasswordModalProps) => {
  const { addPopup } = usePopup()
  const [submitting, setSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Form>({ resolver: yupResolver(schema) })

  const close = () => {
    reset()
    onClose()
  }

  const onSubmit = async (data: Form) => {
    setSubmitting(true)
    try {
      await userService.changeOwnPassword(data.currentPassword, data.newPassword)
      addPopup({ type: 'success', title: 'Senha alterada com sucesso!' })
      close()
    } catch (error: any) {
      addPopup({
        type: 'error',
        title: 'Erro ao alterar senha',
        message: error?.detail || error?.message || 'Tente novamente.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <FormModal
      open={open}
      title="Trocar senha"
      onClose={close}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel="Salvar nova senha"
      submitting={submitting}
      maxWidth="xs"
    >
      <TextField
        {...register('currentPassword')}
        type="password"
        label="Senha atual"
        fullWidth
        error={!!errors.currentPassword}
        helperText={errors.currentPassword?.message}
      />
      <TextField
        {...register('newPassword')}
        type="password"
        label="Nova senha"
        fullWidth
        error={!!errors.newPassword}
        helperText={errors.newPassword?.message || PASSWORD_HELP}
      />
      <TextField
        {...register('confirmPassword')}
        type="password"
        label="Confirmar nova senha"
        fullWidth
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
      />
    </FormModal>
  )
}

export default ChangePasswordModal
