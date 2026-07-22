import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControlLabel,
  Switch,
  FormControl,
  FormGroup,
  FormLabel,
  Checkbox,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'

import { passwordSchema, PASSWORD_HELP } from 'shared/validation/password'

import userService from 'services/userService'
import { IUser, IUserCreate, IUserUpdate, IRole, ROLE_DISPLAY_NAMES } from 'interfaces/IUser'
import { usePopup } from 'hooks/usePopup'
import { applyCpfCnpjMask, removeMask } from 'utils/maskUtils'

interface UserModalProps {
  open: boolean
  onClose: () => void
  onSave: () => void
  user: IUser | null
}

const createSchema = Yup.object({
  username: Yup.string().required('Usuário é obrigatório'),
  first_name: Yup.string().required('Nome é obrigatório'),
  last_name: Yup.string().required('Sobrenome é obrigatório'),
  cpf: Yup.string()
    .required('CPF é obrigatório')
    .test('cpf-valid', 'CPF deve ter 11 dígitos', (value) => {
      if (!value) return false
      return removeMask(value).length === 11
    }),
  email: Yup.string().email('E-mail inválido').nullable(),
  is_active: Yup.boolean().required(),
  password: passwordSchema().required('Senha é obrigatória'),
})

const updateSchema = Yup.object({
  first_name: Yup.string().required('Nome é obrigatório'),
  last_name: Yup.string().required('Sobrenome é obrigatório'),
  email: Yup.string().email('E-mail inválido').nullable(),
  is_active: Yup.boolean().required(),
  password: passwordSchema()
    .nullable()
    .transform((v) => (v === '' ? undefined : v)),
})

type CreateForm = Yup.InferType<typeof createSchema>
type UpdateForm = Yup.InferType<typeof updateSchema>

const UserModal = ({ open, onClose, onSave, user }: UserModalProps) => {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const { addPopup } = usePopup()
  const [loading, setLoading] = useState(false)
  const [roles, setRoles] = useState<IRole[]>([])
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([])
  const isEdit = !!user

  const createForm = useForm<CreateForm>({
    resolver: yupResolver(createSchema) as any,
    mode: 'onChange',
    defaultValues: {
      username: '',
      first_name: '',
      last_name: '',
      cpf: '',
      email: '',
      is_active: true,
      password: '',
    },
  })

  const updateForm = useForm<UpdateForm>({
    resolver: yupResolver(updateSchema) as any,
    mode: 'onChange',
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      is_active: true,
      password: '',
    },
  })

  const form = isEdit ? updateForm : createForm
  const { handleSubmit, watch, formState: { errors, isValid } } = form
  const sharedControl = isEdit ? updateForm.control : createForm.control

  const watchedValues = watch()
  const initialValues = useMemo(() => {
    if (user) {
      return {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email || '',
        is_active: user.is_active,
        roleIds: user.roles?.map((r) => r.id) ?? [],
      }
    }
    return null
  }, [user])

  const hasChanges = useMemo(() => {
    if (!user || !initialValues) return false
    const sameRoles =
      selectedRoleIds.length === initialValues.roleIds.length &&
      selectedRoleIds.every((id) => initialValues.roleIds.includes(id))
    const newPassword = (watchedValues as UpdateForm).password?.trim()
    return (
      watchedValues.first_name !== initialValues.first_name ||
      watchedValues.last_name !== initialValues.last_name ||
      watchedValues.email !== initialValues.email ||
      watchedValues.is_active !== initialValues.is_active ||
      !sameRoles ||
      !!newPassword
    )
  }, [watchedValues, initialValues, user, selectedRoleIds])

  const canSubmit = isEdit ? hasChanges && isValid : isValid

  useEffect(() => {
    if (!open) return
    if (user) {
      updateForm.reset({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email || '',
        is_active: user.is_active,
        password: '',
      })
      setSelectedRoleIds(user.roles?.filter((r) => r.name !== 'tech').map((r) => r.id) ?? [])
    } else {
      createForm.reset({
        username: '',
        first_name: '',
        last_name: '',
        cpf: '',
        email: '',
        is_active: true,
        password: '',
      })
      setSelectedRoleIds([])
    }
  }, [user, open])

  useEffect(() => {
    if (!open) return
    userService
      .getRoles()
      .then((list) => setRoles(list.filter((r) => r.name !== 'tech')))
      .catch(() => setRoles([]))
  }, [open])

  const onSubmit = async (data: CreateForm | UpdateForm) => {
    try {
      setLoading(true)
      if (user) {
        const updateData = { ...(data as IUserUpdate), roleIds: selectedRoleIds }
        const pwd = (data as UpdateForm).password
        if (!pwd || pwd.trim() === '') {
          delete updateData.password
        }
        await userService.updateUser(user.id, updateData)
        addPopup({ type: 'success', title: 'Usuário atualizado com sucesso' })
      } else {
        const createData = data as CreateForm
        await userService.createUser({
          ...createData,
          cpf: removeMask(createData.cpf),
          email: createData.email || null,
          roleIds: selectedRoleIds,
        } as IUserCreate)
        addPopup({ type: 'success', title: 'Usuário criado com sucesso' })
      }
      onSave()
    } catch (error: any) {
      addPopup({
        type: 'error',
        title: user ? 'Erro ao atualizar usuário' : 'Erro ao criar usuário',
        message: error?.detail || error?.message || 'Tente novamente mais tarde',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={fullScreen}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{user ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {!isEdit && (
              <>
                <Controller
                  name="username"
                  control={createForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Usuário (login)"
                      fullWidth
                      error={!!createForm.formState.errors.username}
                      helperText={(createForm.formState.errors.username as any)?.message}
                    />
                  )}
                />
                <Controller
                  name="password"
                  control={createForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="password"
                      label="Senha"
                      fullWidth
                      error={!!createForm.formState.errors.password}
                      helperText={(createForm.formState.errors.password as any)?.message || PASSWORD_HELP}
                    />
                  )}
                />
              </>
            )}

            {isEdit && (
              <Controller
                name="password"
                control={updateForm.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="password"
                    label="Nova senha"
                    placeholder="Deixe em branco para manter a atual"
                    fullWidth
                    error={!!updateForm.formState.errors.password}
                    helperText={
                      (updateForm.formState.errors.password as any)?.message ||
                      `Deixe em branco para manter. ${PASSWORD_HELP}`
                    }
                  />
                )}
              />
            )}

            <Controller
              name="first_name"
              control={sharedControl as any}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nome"
                  fullWidth
                  error={!!errors.first_name}
                  helperText={errors.first_name?.message}
                />
              )}
            />

            <Controller
              name="last_name"
              control={sharedControl as any}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Sobrenome"
                  fullWidth
                  error={!!errors.last_name}
                  helperText={errors.last_name?.message}
                />
              )}
            />

            {!isEdit && (
              <Controller
                name="cpf"
                control={createForm.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="CPF"
                    fullWidth
                    error={!!createForm.formState.errors.cpf}
                    helperText={(createForm.formState.errors.cpf as any)?.message || 'Apenas números (11 dígitos)'}
                    onChange={(e) => {
                      const masked = applyCpfCnpjMask(e.target.value).slice(0, 14)
                      field.onChange(masked)
                    }}
                    inputProps={{ maxLength: 14 }}
                  />
                )}
              />
            )}

            <Controller
              name="email"
              control={sharedControl as any}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="E-mail"
                  type="email"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  value={field.value ?? ''}
                />
              )}
            />

            <Controller
              name="is_active"
              control={sharedControl as any}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label={field.value ? 'Ativo' : 'Desativado'}
                />
              )}
            />

            <FormControl component="fieldset" sx={{ mt: 1 }}>
              <FormLabel component="legend">Grupos de permissão</FormLabel>
              <FormGroup>
                {roles.map((role) => (
                  <FormControlLabel
                    key={role.id}
                    control={
                      <Checkbox
                        checked={selectedRoleIds.includes(role.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRoleIds((prev) => [...prev, role.id])
                          } else {
                            setSelectedRoleIds((prev) => prev.filter((id) => id !== role.id))
                          }
                        }}
                      />
                    }
                    label={ROLE_DISPLAY_NAMES[role.name] ?? role.name}
                  />
                ))}
              </FormGroup>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={loading || !canSubmit}>
            {loading ? 'Salvando...' : user ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default UserModal
