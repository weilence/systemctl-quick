import type { DataTableColumn, DataTableColumns } from 'naive-ui'

interface CellData {
  'type': string
  'no'?: string
  'always'?: string
  'on-success'?: string
  'on-failure'?: string
  'on-abnormal'?: string
  'on-abort'?: string
  'on-watchdog'?: string
}

const restartTypes = ['no', 'always', 'on-success', 'on-failure', 'on-abnormal', 'on-abort', 'on-watchdog']

export const restartTypeOptions = restartTypes.map(item => ({ label: item, value: item }))

export const restartTableColumns: DataTableColumns<CellData> = [
  { title: 'Restart settings/Exit causes', key: 'type', align: 'center' },
  ...restartTypes.map(item => ({ title: item, key: item, align: 'center' } as DataTableColumn<CellData>)),
]

export const restartTableData: CellData[] = [
  {
    'type': 'Clean exit code or signal',
    'always': '✔',
    'on-success': '✔',
  },
  {
    'type': 'Unclean exit code',
    'always': '✔',
    'on-failure': '✔',
  },
  {
    'type': 'Unclean signal',
    'always': '✔',
    'on-failure': '✔',
    'on-abnormal': '✔',
    'on-abort': '✔',
  },
  {
    'type': 'Timeout',
    'always': '✔',
    'on-failure': '✔',
    'on-abnormal': '✔',
  },
  {
    'type': 'Watchdog',
    'always': '✔',
    'on-failure': '✔',
    'on-abnormal': '✔',
    'on-watchdog': '✔',
  },
]

const targetList = [
  'network.target',
  'multi-user.target',
]

export const preDefinedTarget = targetList.map(item => ({ label: item, value: item }))
