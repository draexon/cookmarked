export function unwrapApiData(response) {
  if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
    return response.data
  }

  return response
}
