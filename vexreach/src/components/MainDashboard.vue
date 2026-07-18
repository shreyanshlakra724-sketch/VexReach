<template>
  <div class="min-h-[70vh] px-4 py-10 bg-slate-50 text-slate-800 font-sans">
    <div class="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
      <div class="text-left mb-6">
        <h1 class="text-4xl font-bold mb-2 text-slate-900">Dashboard</h1>
        <p class="text-gray-600">Fill out your profile information to discover custom sponsors.</p>
      </div>

      <form @submit.prevent="handleFormSubmit" class="space-y-4 text-left">
        <div>
          <label for="sponsorshipType" class="block text-sm font-medium text-gray-700">For what are you looking for sponsors?</label>
          <input v-model="form.sponsorshipType" type="text" id="sponsorshipType" class="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-sm" placeholder="e.g., event, project, organization" required>

          <label for="organizationName" class="block text-sm font-medium text-gray-700 mt-4">What is the name of your organization/event?</label>
          <input v-model="form.organizationName" type="text" id="organizationName" maxlength="100" class="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-sm" placeholder="Enter name (max 100 chars)" required>
          
          <label for="organizationField" class="block text-sm font-medium text-gray-700 mt-4">What is the field of your organization/event?</label>
          <input v-model="form.organizationField" type="text" id="organizationField" class="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-sm" placeholder="e.g., STEM, Education, Robotics" required>

          <div class="mt-4 flex justify-between items-center">
            <label for="description" class="block text-sm font-medium text-gray-700">Describe your organization/event in brief</label>
            <span class="text-xs text-gray-400 font-mono">{{ form.description.length }}/500</span>
          </div>
          <textarea v-model="form.description" id="description" rows="4" maxlength="500" class="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-sm" placeholder="Enter a brief description... (max 500 chars)" required></textarea>

          <label for="size" class="block text-sm font-medium text-gray-700 mt-4">What is the size of your organization/event?</label>
          <input v-model="form.size" type="text" id="size" class="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-sm" placeholder="e.g., number of members, attendees" required>

          <label for="community" class="block text-sm font-medium text-gray-700 mt-4">What is the community of your organization/event?</label>
          <input v-model="form.community" type="text" id="community" class="mt-1 block w-full border border-gray-300 rounded-xl shadow-sm p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-sm" placeholder="e.g., high schoolers, university students" required>
        </div>

        <div class="flex justify-center pt-2">
          <button :disabled="isFormInvalid" type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
            Find Sponsors
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const STORAGE_KEY = 'vexreachData'
const router = useRouter()

const form = ref({
  sponsorshipType: '',
  organizationName: '',
  organizationField: '',
  description: '',
  size: '',
  community: ''
})

const isFormInvalid = computed(() => {
  return !form.value.sponsorshipType.trim() ||
         !form.value.organizationName.trim() ||
         !form.value.organizationField.trim() ||
         !form.value.description.trim() ||
         !form.value.size.trim() ||
         !form.value.community.trim()
})

const handleFormSubmit = () => {
  if (isFormInvalid.value) return

  try {
    form.value.sponsorshipType = form.value.sponsorshipType.trim()
    form.value.organizationName = form.value.organizationName.trim()
    form.value.organizationField = form.value.organizationField.trim()
    form.value.description = form.value.description.trim()
    form.value.size = form.value.size.trim()
    form.value.community = form.value.community.trim()

    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    existing.push({ ...form.value })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
  } catch (err) {
    if (!window.__vexreachMemory) {
      window.__vexreachMemory = []
    }
    window.__vexreachMemory.push({ ...form.value })
  }

  if (router && typeof router.push === 'function') {
    router.push('/sponsors')
  } else {
    if (window.location.hash) {
      window.location.hash = '#/sponsors'
    } else {
      window.location.pathname = '/sponsors'
    }
  }
}
</script>