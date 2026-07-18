<script setup>
import {ref} from 'vue'

const welcomeMessage = ref('Welcome to the VexReach ')

</script>

<template>
    <div class="main-content text-center py-20">
    <h1 class="text-4xl font-bold mb-4 text-slate-900">{{ welcomeMessage }}</h1>
    <p class="text-lg text-gray-700 max-w-md mx-auto">
      An Open-Source Web Application for Finding Sponsorships
    </p>

    <div class="flex justify-center mt-8">
      <a href="/dashboard" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-md transform hover:-translate-y-0.5">
        Get Started
      </a>
    </div>
  </div>

</template>

<style scoped>
.main-content{
  font-family: 'Inter', sans-serif;
}


</style>



    