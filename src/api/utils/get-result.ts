export default function getResult(resultData: string): number[] | null {
  if (!resultData) {
    return null
  }
  if (resultData === 'Vorbericht') {
    return null
  }
  const parsedResult = [
    ...resultData
      .replace(/\s|kl/g, '')
      .split(':')
      .map(string => parseInt(string)),
  ]
  return parsedResult && parsedResult.length === 2 ? parsedResult : null
}
