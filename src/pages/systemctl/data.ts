export const restartTableColumns = [
  { title: 'Restart settings/Exit causes', key: 'type' },
  { title: 'no', key: 'no' },
  { title: 'always', key: 'always' },
  { title: 'on-success', key: 'on-success' },
  { title: 'on-failure', key: 'on-failure' },
  { title: 'on-abnormal', key: 'on-abnormal' },
  { title: 'on-abort', key: 'on-abort' },
  { title: 'on-watchdog', key: 'on-watchdog' },
]

export const restartTableData = [
  {
    'type': 'Clean exit code or signal',
    'always': 'X',
    'on-success': 'X',
  },
  {
    'type': 'Unclean exit code',
    'always': 'X',
    'on-failure': 'X',
  },
  {
    'type': 'Unclean signal',
    'always': 'X',
    'on-failure': 'X',
    'on-abnormal': 'X',
    'on-abort': 'X',
  },
  {
    'type': 'Timeout',
    'always': 'X',
    'on-failure': 'X',
    'on-abnormal': 'X',
  },
  {
    'type': 'Watchdog',
    'always': 'X',
    'on-failure': 'X',
    'on-abnormal': 'X',
    'on-watchdog': 'X',
  },
]

export const restartTypes = restartTableColumns.slice(1).map(item => ({ label: item.key, value: item.key }))

const targetList = [
  'network.target',
  'multi-user.target',
]

export const preDefinedTarget = targetList.map(item => ({ label: item, value: item }))
