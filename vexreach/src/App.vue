<script setup>
import { ref } from 'vue'


const welcomeMessage = ref('Welcome to the VexReach ')
</script>

<template>
  <main class="main-content">
    <h2>{{ welcomeMessage }}</h2>
    

    
    </main>
</template>

<style scoped>
/* Scoped styles will only apply to this component */
.main-content {
  padding: 2rem;
  font-family: sans-serif;
}
</style>