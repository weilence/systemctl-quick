<script setup lang="ts">
import { restartTableColumns, restartTableData } from '../data'
</script>

<template>
  <n-data-table :columns="restartTableColumns" :data="restartTableData" striped />
</template>
