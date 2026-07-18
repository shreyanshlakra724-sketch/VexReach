<script setup>
import Home from './components/Home.vue'
import MainDashboard from './components/MainDashboard.vue'
import SponsorResults from './components/SponsorResults.vue'

const getCurrentView = () => {
  if (window.location.pathname.startsWith('/sponsors')) {
    return SponsorResults
  }

  if (window.location.pathname.startsWith('/dashboard')) {
    return MainDashboard
  }

  return Home
}

const currentView = getCurrentView()
</script>

<template>
  <div class="min-h-screen flex flex-col justify-between bg-gray-100">
    
    <main class="flex-grow flex flex-col justify-center">
      <component :is="currentView" />
    </main>

    <footer class="w-full bg-gray-800 text-white py-4 mt-6">
      <div class="max-w-7xl mx-auto px-4 text-center flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
        
        <div class="flex flex-col sm:flex-row gap-4 items-center">
          <a href="https://github.com/shreyanshlakra724-sketch/VexReach" target="_blank" class="hover:text-white" title="GitHub">GitHub</a>
          <img src="/github.png" alt="GitHub Logo" class="h-6 w-6"> 
        </div>

        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500"> VexReach-2026, An Open-Source Project. </span>
        </div>
        
      </div>
    </footer>
        
  </div>
</template>

<style scoped>

.main-content {
  padding: 2rem;
  font-family: sans-serif;
}
</style>