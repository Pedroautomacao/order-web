import { Chip, Stack } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Payments, Schedule, CheckCircle } from '@mui/icons-material'

import colors from 'config/colors'
import { PaymentMethod, getPaymentMethodLabel } from 'interfaces/IOrder'

interface PaymentChipProps {
  method: string
  isPaid?: boolean
  /** Mostra também o chip Pago/Pendente ao lado. */
  showPaidStatus?: boolean
  size?: 'small' | 'medium'
}

/**
 * Chips de pagamento do pedido: forma (À vista / A prazo) e, opcionalmente,
 * situação (Pago / Pendente). Mesmo espírito do StatusChip.
 */
export const PaymentChip = ({
  method,
  isPaid,
  showPaidStatus = false,
  size = 'small',
}: PaymentChipProps) => {
  const isCredit = method === PaymentMethod.CREDIT
  const methodColor = isCredit ? colors.tertiary.dark : colors.secondary.dark
  const methodBg = isCredit
    ? alpha(colors.tertiary.main, 0.16)
    : alpha(colors.secondary.main, 0.14)

  return (
    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
      <Chip
        icon={isCredit ? <Schedule /> : <Payments />}
        label={getPaymentMethodLabel(method)}
        size={size}
        sx={{ color: methodColor, backgroundColor: methodBg, fontWeight: 600 }}
      />
      {showPaidStatus &&
        (isPaid ? (
          <Chip
            icon={<CheckCircle />}
            label="Pago"
            size={size}
            sx={{
              color: colors.primary.dark,
              backgroundColor: alpha(colors.primary.main, 0.14),
              fontWeight: 600,
            }}
          />
        ) : (
          <Chip
            label="Pendente"
            size={size}
            sx={{
              color: colors.outlineStrong,
              backgroundColor: alpha(colors.outlineStrong, 0.14),
              fontWeight: 600,
            }}
          />
        ))}
    </Stack>
  )
}

export default PaymentChip
