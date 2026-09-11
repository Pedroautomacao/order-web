/**
 * Componentes e utilidades compartilhados da UI (Uai System).
 * Ponto único de importação: `import { PageHeader, DataTable, StatusChip } from 'shared'`.
 */

export { default as BrandLogo } from 'shared/BrandLogo'
export { brand } from 'shared/brand'
export type { BrandConfig } from 'shared/brand'

export { default as PageLayout } from 'shared/PageLayout'
export { default as PageHeader } from 'shared/PageHeader'
export { default as StatusChip } from 'shared/StatusChip'
export { default as PaymentChip } from 'shared/PaymentChip'
export { default as ApprovalChip } from 'shared/ApprovalChip'
export { default as ActionsMenu } from 'shared/ActionsMenu'
export type { ActionItem } from 'shared/ActionsMenu'
export { default as DataTable } from 'shared/DataTable'
export { default as OrderListCard } from 'shared/OrderListCard'
export { default as KpiCard } from 'shared/KpiCard'
export type { KpiTone } from 'shared/KpiCard'
export { default as BarChart } from 'shared/BarChart'
export type { BarChartPoint } from 'shared/BarChart'
export { default as FormModal } from 'shared/FormModal'
export { default as ChangePasswordModal } from 'shared/ChangePasswordModal'
export { default as OrderFormModal } from 'shared/OrderFormModal'
export { default as OrderDetailView } from 'shared/OrderDetailView'

export { LoadingState, EmptyState } from 'shared/states'
export { formatCurrency, productLabel, formatQuantityWithUnit } from 'shared/format'
export { SearchField, DateField, SelectField } from 'shared/fields'

export { Header } from 'shared/Header'
export { default as Loading } from 'shared/Loading'
export { default as ConfirmDialog } from 'shared/ConfirmDialog'
export { default as Alert } from 'shared/Alert'
export { ErrorBoundary } from 'shared/ErrorBoundary'
