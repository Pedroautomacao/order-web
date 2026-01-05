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
  FormControlLabel,
  Switch,
  Box,
  CircularProgress,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'

import productService from 'services/productService'
import { IProduct, IProductCreate, IProductUpdate } from 'interfaces/IProduct'
import { IUnitOfMeasure } from 'interfaces/IUnitOfMeasure'
import { usePopup } from 'hooks/usePopup'

interface ProductModalProps {
  open: boolean
  onClose: () => void
  onSave: () => void
  product: IProduct | null
  units: IUnitOfMeasure[]
}

const validationSchema = Yup.object({
  name: Yup.string().required('Nome é obrigatório'),
  unitOfMeasureId: Yup.number().required('Unidade de medida é obrigatória').min(1, 'Unidade de medida é obrigatória'),
  isActive: Yup.boolean().optional(),
  description: Yup.string().optional(),
})

const ProductModal = ({ open, onClose, onSave, product, units }: ProductModalProps) => {
  const { addPopup } = usePopup()
  const [loading, setLoading] = useState(false)
  const [loadingProduct, setLoadingProduct] = useState(false)
  const [productData, setProductData] = useState<IProduct | null>(null)

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<IProductCreate>({
    resolver: yupResolver(validationSchema) as any,
    mode: 'onChange',
    defaultValues: {
      name: '',
      unitOfMeasureId: 0,
      isActive: true,
      description: '',
    },
  })

  useEffect(() => {
    const fetchProductData = async () => {
      if (open && product) {
        try {
          setLoadingProduct(true)
          const fullProduct = await productService.getProduct(product.id)
          setProductData(fullProduct)
        } catch (error: any) {
          addPopup({
            type: 'error',
            title: 'Erro ao carregar produto',
            message: error?.detail || error?.message || 'Tente novamente mais tarde',
          })
          onClose()
        } finally {
          setLoadingProduct(false)
        }
      } else {
        setProductData(null)
      }
    }

    fetchProductData()
  }, [open, product, addPopup, onClose])

  const watchedValues = watch()
  const initialValues = useMemo(() => {
    if (productData) {
      return {
        name: productData.name,
        unitOfMeasureId: productData.unit?.id || productData.unit_of_measure_id || 0,
        isActive: productData.is_active,
        description: productData.description || '',
      }
    }
    return {
      name: '',
      unitOfMeasureId: 0,
      isActive: true,
      description: '',
    }
  }, [productData])

  const hasChanges = useMemo(() => {
    if (!productData) return false
    return (
      watchedValues.name !== initialValues.name ||
      watchedValues.unitOfMeasureId !== initialValues.unitOfMeasureId ||
      watchedValues.isActive !== initialValues.isActive ||
      watchedValues.description !== initialValues.description
    )
  }, [watchedValues, initialValues, productData])

  const canSubmit = productData ? hasChanges && isValid : isValid

  useEffect(() => {
    if (productData && units.length > 0) {
      const unitId = productData.unit?.id || productData.unit_of_measure_id || 0
      reset({
        name: productData.name,
        unitOfMeasureId: unitId,
        isActive: productData.is_active,
        description: productData.description || '',
      })
    } else if (!productData) {
      reset({
        name: '',
        unitOfMeasureId: 0,
        isActive: true,
        description: '',
      })
    }
  }, [productData, units, reset])

  const onSubmit = async (data: IProductCreate) => {
    try {
      setLoading(true)
      if (productData) {
        await productService.updateProduct(productData.id, data as IProductUpdate)
        addPopup({
          type: 'success',
          title: 'Produto atualizado com sucesso',
        })
      } else {
        await productService.createProduct(data)
        addPopup({
          type: 'success',
          title: 'Produto criado com sucesso',
        })
      }
      onSave()
    } catch (error: any) {
      addPopup({
        type: 'error',
        title: productData ? 'Erro ao atualizar produto' : 'Erro ao criar produto',
        message: error?.detail || error?.message || 'Tente novamente mais tarde',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{productData ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
        <DialogContent>
          {loadingProduct ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <CircularProgress />
            </Box>
          ) : (
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

            {productData && (
              <TextField
                label="SKU"
                value={productData.id}
                fullWidth
                disabled
                helperText="O SKU é o ID do produto e não pode ser alterado"
              />
            )}

            <Controller
              name="unitOfMeasureId"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.unitOfMeasureId}>
                  <InputLabel>Unidade de Medida</InputLabel>
                  <Select 
                    {...field} 
                    label="Unidade de Medida"
                    value={field.value || 0}
                  >
                    {units.map(unit => (
                      <MenuItem key={unit.id} value={unit.id}>
                        {unit.code} - {unit.description || unit.code}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.unitOfMeasureId && (
                    <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                      {errors.unitOfMeasureId.message}
                    </Box>
                  )}
                </FormControl>
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Descrição"
                  fullWidth
                  multiline
                  rows={3}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />

            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch {...field} checked={field.value} />}
                  label={field.value ? 'Ativo' : 'Desativado'}
                />
              )}
            />
          </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading || loadingProduct}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={loading || loadingProduct || !canSubmit}>
            {loading ? 'Salvando...' : productData ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default ProductModal

