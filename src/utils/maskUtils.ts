/**
 * Utilitários para máscaras de entrada
 */

export const applyCpfCnpjMask = (value: string): string => {
  const numbers = value.replace(/\D/g, '')

  if (numbers.length <= 11) {
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  } else {
    return numbers
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
  }
}

export const validateCpfCnpj = (value: string): boolean => {
  const numbers = value.replace(/\D/g, '')
  return numbers.length === 11 || numbers.length === 14
}

export const removeMask = (value: string): string => {
  return value.replace(/\D/g, '')
}

