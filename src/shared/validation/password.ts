import * as Yup from 'yup'

/**
 * Política de senha da plataforma: mínimo 6 caracteres, ao menos 1 número e
 * 1 caractere especial. Reutilizada no cadastro de usuários e na troca de senha.
 */
export const PASSWORD_HELP = 'Mínimo 6 caracteres, com pelo menos um número e um caractere especial.'

export const passwordSchema = () =>
  Yup.string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
    .matches(/\d/, 'A senha deve conter ao menos um número')
    .matches(/[^A-Za-z0-9]/, 'A senha deve conter ao menos um caractere especial')
