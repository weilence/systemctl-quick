<template>
  <nav my-6 inline-flex gap-2 text-xl>
    <button class="icon-btn !outline-none" @click="toggleDark()">
      <div v-if="isDark" i-carbon-moon />
      <div v-else i-carbon-sun />
    </button>

    <a
      class="icon-btn"
      i-carbon-logo-github
      rel="noreferrer"
      href="https://github.com/Weilence/systemctl-quick"
      target="_blank"
      title="GitHub"
    />
  </nav>
</template>
