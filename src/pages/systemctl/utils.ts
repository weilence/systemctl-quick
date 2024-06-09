import { isArray, isString, lowerFirst, upperFirst } from 'lodash'

export function generate(data: object) {
  let service = ''
  for (const [section, sectionValue] of Object.entries(data)) {
    if (section === 'name')
      continue

    service += `[${upperFirst(section)}]\n`
    for (const [key, value] of Object.entries<any | any[]>(sectionValue)) {
      if ((isArray(value) && !value.length))
        continue
      if (!isArray(value) && !value)
        continue
      if (key === 'environment') {
        for (const item of value)
          service += `${upperFirst(key)}=${generateValue(`${item.key}=${item.value}`)}\n`
      }
      else {
        service += `${upperFirst(key)}=${generateValue(value)}\n`
      }
    }

    if (section !== 'install')
      service += '\n'
  }
  return service
}

function generateValue(value: string | string[]) {
  if (isArray(value))
    return value.join(' ')
  else
    return value
}

export function parse(formValue: any, text: string) {
  const lines = text.split(/\r?\n/)
  const parsedData: any = {}
  let sectionKey = ''
  for (let line of lines) {
    line = line.trim()
    if (!line)
      continue

    if (line.startsWith('[') && line.endsWith(']')) {
      const section = lowerFirst(line.slice(1, line.length - 1))
      parsedData[section] = {}
      sectionKey = section
    }
    else {
      const eqIndex = line.indexOf('=')

      const key = lowerFirst(line.slice(0, eqIndex))
      const value = line.slice(eqIndex + 1)
      if (isString(formValue[sectionKey][key])) {
        parsedData[sectionKey][key] = lowerFirst(value)
      }
      else if (isArray(formValue[sectionKey][key])) {
        if (key === 'environment') {
          if (!parsedData[sectionKey][key])
            parsedData[sectionKey][key] = []
          const [environmentKey, environmentValue] = value.split('=')
          parsedData[sectionKey][key].push({ key: environmentKey || '', value: environmentValue || '' })
        }
        else {
          parsedData[sectionKey][key] = value.split(' ').map(lowerFirst)
        }
      }
    }
  }

  return parsedData
}

export function merge(target: any, source: any) {
  for (const [section, sectionValue] of Object.entries<any>(target)) {
    if (section === 'name')
      continue

    for (const key of Object.keys(sectionValue)) {
      if (source?.[section]?.[key]) {
        target[section][key] = source[section][key]
      }
      else {
        if (isString(target[section][key]))
          target[section][key] = ''
        else
          target[section][key] = []
      }
    }
  }
}
