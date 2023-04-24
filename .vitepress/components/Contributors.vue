<script setup lang="ts">
import { contributors } from '../contributors'
</script>

<template>
  <div flex="~ wrap gap2" justify-center>
    <a v-for="{ name, avatar } of contributors" :key="name" :href="`https://github.com/${name}`" m-0 rel="noopener noreferrer" :aria-label="`${name} na GitHub`">
      <img loading="lazy" :src="avatar" width="50" height="50" rounded-full h-12 w-12 :alt="`avatar do ${name}`">
    </a>
  </div>
</template>
