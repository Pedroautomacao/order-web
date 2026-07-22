import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  FormControlLabel,
  Switch,
  Checkbox,
  FormGroup,
  Typography,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'

import clientService from 'services/clientService'
import { IClient, IClientCreate, IClientUpdate } from 'interfaces/IClient'
import { usePopup } from 'hooks/usePopup'
import { applyCpfCnpjMask, validateCpfCnpj, removeMask } from 'utils/maskUtils'

interface ClientModalProps {
  open: boolean
  onClose: () => void
  onSave: () => void
  client: IClient | null
}

const priorities = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

const validationSchema = Yup.object({
  name: Yup.string().required('Nome é obrigatório'),
  cpfCnpj: Yup.string()
    .required('CPF/CNPJ é obrigatório')
    .test('cpf-cnpj-valid', 'CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos', (value) => {
      if (!value) return false
      const numbers = removeMask(value)
      return numbers.length === 11 || numbers.length === 14
    }),
  priority: Yup.string().required('Prioridade é obrigatória'),
  address: Yup.string().required('Endereço é obrigatório'),
  phoneNumber: Yup.string().required('Telefone é obrigatório'),
  observations: Yup.string().optional(),
  isActive: Yup.boolean().optional(),
  allowCash: Yup.boolean(),
  allowCredit: Yup.boolean(),
  creditLimit: Yup.number()
    .typeError('Informe um valor')
    .min(0, 'O limite não pode ser negativo')
    .required('Informe o limite'),
}).test('at-least-one-payment', 'Selecione ao menos uma forma de pagamento', (v) =>
  Boolean(v.allowCash || v.allowCredit),
)

const ClientModal = ({ open, onClose, onSave, client }: ClientModalProps) => {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const { addPopup } = usePopup()
  const [loading, setLoading] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<IClientCreate>({
    resolver: yupResolver(validationSchema) as any,
    mode: 'onChange',
    defaultValues: {
      name: '',
      cpfCnpj: '',
      priority: 'B',
      address: '',
      phoneNumber: '',
      observations: '',
      isActive: true,
      allowCash: true,
      allowCredit: true,
      creditLimit: 0,
    },
  })

  const watchedValues = watch()
  const allowCredit = watch('allowCredit')

  const hasChanges = useMemo(() => {
    if (!client) return false
    return (
      watchedValues.name !== client.name ||
      removeMask(watchedValues.cpfCnpj || '') !== client.cpf_cnpj ||
      watchedValues.priority !== client.priority ||
      watchedValues.address !== client.address ||
      watchedValues.phoneNumber !== client.phone_number ||
      (watchedValues.observations || '') !== (client.observations || '') ||
      watchedValues.isActive !== client.is_active ||
      watchedValues.allowCash !== client.allow_cash ||
      watchedValues.allowCredit !== client.allow_credit ||
      Number(watchedValues.creditLimit) !== Number(client.credit_limit)
    )
  }, [watchedValues, client])

  const canSubmit = client ? hasChanges && isValid : isValid

  useEffect(() => {
    if (client) {
      const maskedCpfCnpj = applyCpfCnpjMask(client.cpf_cnpj)
      reset({
        name: client.name,
        cpfCnpj: maskedCpfCnpj,
        priority: client.priority,
        address: client.address,
        phoneNumber: client.phone_number,
        observations: client.observations || '',
        isActive: client.is_active,
        allowCash: client.allow_cash,
        allowCredit: client.allow_credit,
        creditLimit: Number(client.credit_limit) || 0,
      })
    } else {
      reset({
        name: '',
        cpfCnpj: '',
        priority: 'B',
        address: '',
        phoneNumber: '',
        observations: '',
        isActive: true,
        allowCash: true,
        allowCredit: true,
        creditLimit: 0,
      })
    }
  }, [client, reset, open])

  const onSubmit = async (data: IClientCreate) => {
    try {
      setLoading(true)
      const dataToSend = {
        ...data,
        cpfCnpj: removeMask(data.cpfCnpj),
        isActive: data.isActive ?? true,
        creditLimit: Number(data.creditLimit) || 0,
      }
      if (client) {
        await clientService.updateClient(client.id, dataToSend as IClientUpdate)
        addPopup({
          type: 'success',
          title: 'Cliente atualizado com sucesso',
        })
      } else {
        await clientService.createClient(dataToSend)
        addPopup({
          type: 'success',
          title: 'Cliente criado com sucesso',
        })
      }
      onSave()
    } catch (error: any) {
      addPopup({
        type: 'error',
        title: client ? 'Erro ao atualizar cliente' : 'Erro ao criar cliente',
        message: error?.detail || error?.message || 'Tente novamente mais tarde',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={fullScreen}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{client ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nome"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />

            <Controller
              name="cpfCnpj"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="CPF/CNPJ"
                  fullWidth
                  error={!!errors.cpfCnpj}
                  helperText={errors.cpfCnpj?.message || 'Digite apenas números (11 para CPF ou 14 para CNPJ)'}
                  onChange={(e) => {
                    const masked = applyCpfCnpjMask(e.target.value)
                    field.onChange(masked)
                  }}
                  inputProps={{ maxLength: 18 }}
                />
              )}
            />

            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.priority}>
                  <InputLabel>Prioridade</InputLabel>
                  <Select {...field} label="Prioridade">
                    {priorities.map(priority => (
                      <MenuItem key={priority} value={priority}>
                        {priority}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.priority && (
                    <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                      {errors.priority.message}
                    </Box>
                  )}
                </FormControl>
              )}
            />

            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Endereço"
                  fullWidth
                  error={!!errors.address}
                  helperText={errors.address?.message}
                />
              )}
            />

            <Controller
              name="phoneNumber"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Telefone"
                  fullWidth
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber?.message}
                />
              )}
            />

            <Controller
              name="observations"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Observações"
                  fullWidth
                  multiline
                  rows={3}
                  error={!!errors.observations}
                  helperText={errors.observations?.message}
                />
              )}
            />

            {/* Meios de pagamento aceitos */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Formas de pagamento aceitas
              </Typography>
              <FormGroup row>
                <Controller
                  name="allowCash"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value ?? false}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      }
                      label="À vista"
                    />
                  )}
                />
                <Controller
                  name="allowCredit"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value ?? false}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      }
                      label="A prazo"
                    />
                  )}
                />
              </FormGroup>
              {(errors as any)?.[''] && (
                <Typography variant="caption" color="error">
                  Selecione ao menos uma forma de pagamento
                </Typography>
              )}
            </Box>

            {/* Limite de crédito (relevante quando aceita a prazo) */}
            <Controller
              name="creditLimit"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Limite de crédito (a prazo)"
                  type="number"
                  fullWidth
                  disabled={!allowCredit}
                  inputProps={{ min: 0, step: 0.01 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                  error={!!errors.creditLimit}
                  helperText={
                    errors.creditLimit?.message ||
                    'Soma máxima de pedidos a prazo em aberto (não pagos).'
                  }
                />
              )}
            />

            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value ?? true}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label={field.value ? 'Ativo' : 'Inativo'}
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={loading || !canSubmit}>
            {loading ? 'Salvando...' : client ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default ClientModal

