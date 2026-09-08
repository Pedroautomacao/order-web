/**
 * Base da API usada pelo Axios em src/services/api.ts.
 *
 * REACT_APP_API_URL, quando definida, tem prioridade. O CRA embute o valor no
 * bundle em tempo de build — por isso ela entra como ARG no Dockerfile, não
 * como variável de runtime do container.
 *
 * Sem ela: no `npm start` a API roda solta em outra porta; em qualquer build a
 * app é servida atrás do proxy reverso, que expõe a API em /api. Rota relativa
 * de propósito, para o bundle não ficar preso a um IP nem a um domínio.
 */
const url = () => {
  const configured = process.env.REACT_APP_API_URL?.trim()

  if (configured) {
    return { baseURL: configured }
  }

  if (process.env.NODE_ENV === 'development') {
    return { baseURL: 'http://localhost:8000' }
  }

  return { baseURL: '/api' }
}

const { baseURL } = url()
export { baseURL }
