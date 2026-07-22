import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Divider,
  IconButton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import clientService from 'services/clientService'
import productService from 'services/productService'
import orderService from 'services/orderService'
import { IOrderCreate, PaymentMethod } from 'interfaces/IOrder'
import { IClient, IClientCredit } from 'interfaces/IClient'
import { IProduct } from 'interfaces/IProduct'
import { usePopup } from 'hooks/usePopup'
import { getMinOrderDate } from 'utils/orderDateUtils'
import FormModal from 'shared/FormModal'
import { formatCurrency } from 'shared/format'

interface OrderFormValues {
  client: IClient | null
  scheduledDate: string
  paymentMethod: PaymentMethod
  items: { product: IProduct | null; quantity: number }[]
}

const orderSchema = yup.object({
  client: yup.object().nullable().required('Selecione um cliente'),
  scheduledDate: yup.string().required('Informe a data de entrega'),
  paymentMethod: yup.string().required(),
  items: yup
    .array()
    .of(
      yup.object({
        product: yup.object().nullable().required('Selecione um produto'),
        quantity: yup
          .number()
          .typeError('Quantidade inválida')
          .min(0.01, 'Quantidade deve ser maior que zero')
          .required('Informe a quantidade'),
      }),
    )
    .min(1, 'Adicione ao menos um item'),
})

const ProductRow = ({ index, control, products, errors, fields, remove }: any) => {
  const watchedItems = useWatch({ control, name: 'items' }) as OrderFormValues['items']
  const usedIds = new Set(
    watchedItems?.filter((_, i) => i !== index).map((it) => it.product?.id).filter(Boolean),
  )
  const availableProducts = products.filter((p: IProduct) => !usedIds.has(p.id))

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
      <Controller
        name={`items.${index}.product`}
        control={control}
        render={({ field: f }) => (
          <Autocomplete
            options={availableProducts}
            getOptionLabel={(o: IProduct) =>
              `${o.sku ? o.sku + ' — ' : ''}${o.name} (${formatCurrency(o.unit_price)})`
            }
            value={f.value}
            onChange={(_, v) => f.onChange(v)}
            sx={{ flex: 1 }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Produto"
                size="small"
                error={!!errors.items?.[index]?.product}
                helperText={(errors.items?.[index]?.product as any)?.message}
              />
            )}
          />
        )}
      />
      <Controller
        name={`items.${index}.quantity`}
        control={control}
        render={({ field: f }) => (
          <TextField
            {...f}
            label="Qtd"
            type="number"
            size="small"
            sx={{ width: 100 }}
            inputProps={{ min: 0.01, step: 0.01 }}
            error={!!errors.items?.[index]?.quantity}
            helperText={errors.items?.[index]?.quantity?.message}
          />
        )}
      />
      <IconButton onClick={() => remove(index)} disabled={fields.length === 1} size="small" sx={{ mt: 0.5 }}>
        <DeleteIcon />
      </IconButton>
    </Box>
  )
}

interface OrderFormModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
  title?: string
}

/**
 * Modal de criação de pedido (admin e vendedor).
 * - Escolha de forma de pagamento quando o cliente aceita as duas.
 * - Total do pedido calculado ao vivo (Σ preço × qtd).
 * - Ao escolher "A prazo", mostra a situação de crédito e BLOQUEIA se estourar o limite.
 */
export const OrderFormModal = ({
  open,
  onClose,
  onCreated,
  title = 'Novo Pedido',
}: OrderFormModalProps) => {
  const { addPopup } = usePopup()
  const [submitting, setSubmitting] = useState(false)
  const [clients, setClients] = useState<IClient[]>([])
  const [products, setProducts] = useState<IProduct[]>([])
  const [credit, setCredit] = useState<IClientCredit | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: yupResolver(orderSchema) as any,
    defaultValues: {
      client: null,
      scheduledDate: '',
      paymentMethod: PaymentMethod.CASH,
      items: [{ product: null, quantity: 1 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  // valores observados para cálculos ao vivo
  const selectedClient = useWatch({ control, name: 'client' })
  const paymentMethod = useWatch({ control, name: 'paymentMethod' })
  const watchedItems = useWatch({ control, name: 'items' })

  const load = useCallback(async () => {
    try {
      const [clientsData, productsData] = await Promise.all([
        clientService.getClients(undefined, true),
        productService.getProducts(undefined, true),
      ])
      setClients(clientsData)
      setProducts(productsData)
      setCredit(null)
      reset({
        client: null,
        scheduledDate: '',
        paymentMethod: PaymentMethod.CASH,
        items: [{ product: null, quantity: 1 }],
      })
    } catch {
      addPopup({ type: 'error', title: 'Erro ao carregar dados', message: 'Tente novamente.' })
      onClose()
    }
  }, [addPopup, onClose, reset])

  useEffect(() => {
    if (open) load()
  }, [open, load])

  // Ao trocar de cliente: buscar crédito e ajustar a forma de pagamento permitida
  useEffect(() => {
    if (!selectedClient) {
      setCredit(null)
      return
    }
    // ajusta a forma padrão conforme o que o cliente aceita
    if (!selectedClient.allow_cash && selectedClient.allow_credit) {
      setValue('paymentMethod', PaymentMethod.CREDIT)
    } else if (selectedClient.allow_cash && !selectedClient.allow_credit) {
      setValue('paymentMethod', PaymentMethod.CASH)
    }
    clientService
      .getClientCredit(selectedClient.id)
      .then(setCredit)
      .catch(() => setCredit(null))
  }, [selectedClient, setValue])

  // total do pedido (Σ preço × qtd)
  const orderTotal = useMemo(() => {
    if (!watchedItems) return 0
    return watchedItems.reduce((sum, it) => {
      const price = Number(it.product?.unit_price ?? 0)
      const qty = Number(it.quantity ?? 0)
      return sum + price * qty
    }, 0)
  }, [watchedItems])

  const acceptsBoth = !!selectedClient?.allow_cash && !!selectedClient?.allow_credit
  const isCredit = paymentMethod === PaymentMethod.CREDIT

  // avaliação do limite (só quando a prazo)
  const creditBlocked = useMemo(() => {
    if (!isCredit || !credit) return false
    const available = Number(credit.available)
    return orderTotal > available
  }, [isCredit, credit, orderTotal])

  const onSubmit = async (values: OrderFormValues) => {
    if (!values.client) return
    const productIds = values.items.map((i) => i.product?.id).filter(Boolean)
    if (new Set(productIds).size !== productIds.length) {
      addPopup({
        type: 'error',
        title: 'Produtos duplicados',
        message: 'Cada produto só pode aparecer uma vez no pedido.',
      })
      return
    }
    setSubmitting(true)
    try {
      const payload: IOrderCreate = {
        clientId: values.client.id,
        scheduledDate: values.scheduledDate,
        paymentMethod: values.paymentMethod,
        items: values.items.map((i) => ({ product_id: i.product!.id, quantity: i.quantity })),
      }
      await orderService.createOrder(payload)
      addPopup({ type: 'success', title: 'Pedido criado com sucesso!' })
      onClose()
      onCreated()
    } catch (error: any) {
      addPopup({
        type: 'error',
        title: 'Erro ao criar pedido',
        message: error?.detail || error?.message || 'Tente novamente.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <FormModal
      open={open}
      title={title}
      onClose={onClose}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel="Criar Pedido"
      submitting={submitting}
      actions={
        <>
          <Button onClick={onClose} disabled={submitting} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={submitting || creditBlocked}>
            {submitting ? 'Salvando...' : 'Criar Pedido'}
          </Button>
        </>
      }
    >
      <Controller
        name="client"
        control={control}
        render={({ field }) => (
          <Autocomplete
            options={clients}
            getOptionLabel={(o) => `${o.name} — ${o.cpf_cnpj}`}
            value={field.value}
            onChange={(_, v) => field.onChange(v)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Cliente"
                error={!!errors.client}
                helperText={errors.client?.message}
              />
            )}
          />
        )}
      />

      <Controller
        name="scheduledDate"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Data de entrega"
            type="date"
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: getMinOrderDate() }}
            error={!!errors.scheduledDate}
            helperText={errors.scheduledDate?.message}
          />
        )}
      />

      {/* Forma de pagamento */}
      {selectedClient && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            Forma de pagamento
          </Typography>
          {acceptsBoth ? (
            <Controller
              name="paymentMethod"
              control={control}
              render={({ field }) => (
                <ToggleButtonGroup
                  exclusive
                  color="primary"
                  value={field.value}
                  onChange={(_, v) => v && field.onChange(v)}
                  size="small"
                >
                  <ToggleButton value={PaymentMethod.CASH}>À vista</ToggleButton>
                  <ToggleButton value={PaymentMethod.CREDIT}>A prazo</ToggleButton>
                </ToggleButtonGroup>
              )}
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              {selectedClient.allow_credit ? 'A prazo' : 'À vista'} (única forma aceita por este cliente)
            </Typography>
          )}
        </Box>
      )}

      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Itens
      </Typography>

      {fields.map((field, index) => (
        <ProductRow
          key={field.id}
          index={index}
          control={control}
          products={products}
          errors={errors}
          fields={fields}
          remove={remove}
        />
      ))}

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => append({ product: null, quantity: 1 })}
        sx={{ alignSelf: 'flex-start' }}
      >
        Adicionar item
      </Button>

      <Divider />

      {/* Total do pedido */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Total do pedido
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {formatCurrency(orderTotal)}
        </Typography>
      </Box>

      {/* Situação de crédito (só a prazo) */}
      {isCredit && credit && (
        <Alert severity={creditBlocked ? 'error' : 'info'} sx={{ borderRadius: 2 }}>
          Crédito: em aberto {formatCurrency(credit.outstanding)} de{' '}
          {formatCurrency(credit.credit_limit)} — disponível {formatCurrency(credit.available)}.
          {creditBlocked && (
            <>
              <br />
              <strong>Limite atingido para este pedido.</strong> Peça ao administrador para aumentar o
              limite ou marcar um pedido do cliente como pago.
            </>
          )}
        </Alert>
      )}
    </FormModal>
  )
}

export default OrderFormModal
