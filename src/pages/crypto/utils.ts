import CryptoJS from 'crypto-js'

export type InputEncoding = keyof typeof CryptoJS.enc
export type OutputEncoding = keyof typeof CryptoJS.enc

// 将输入字符串转换为 WordArray
export function parseInput(data: string, encoding: InputEncoding): CryptoJS.lib.WordArray {
  const inputEncoding = CryptoJS.enc[encoding]
  try {
    return inputEncoding.parse(data)
  }
  catch (error) {
    throw new Error('输入编码失败')
  }
}

// 将 WordArray 转换为指定编码的输出字符串
export function formatOutput(wordArray: CryptoJS.lib.WordArray, encoding: OutputEncoding): string {
  const outputEncoding = CryptoJS.enc[encoding]
  try {
    return wordArray.toString(outputEncoding)
  }
  catch (error) {
    throw new Error('输出编码失败')
  }
}

// 读取文件内容
export function readFileAsText(file: File | null | undefined): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('请选择文件'))
      return
    }

    if (file.size > 1024 * 1024) {
      reject(new Error('文件大小不能超过1MB'))
      return
    }

    const reader = new FileReader()
    reader.onload = e => resolve(e.target?.result as string)
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file)
  })
}
