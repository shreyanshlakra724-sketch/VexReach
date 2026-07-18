<template>
  <div class="min-h-[70vh] px-4 py-10 bg-slate-50 text-slate-800 font-sans">
    <div class="max-w-6xl mx-auto">
      
      <div v-if="loadState === 'loading'" class="max-w-md mx-auto bg-white p-12 rounded-2xl shadow-xl border border-gray-200 flex flex-col items-center text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p class="text-xl font-semibold text-slate-800">Analyzing Profile Data...</p>
        <p class="text-gray-500 text-sm mt-2">Querying Hugging Face AI context nodes for active corporate matching grants.</p>
      </div>

      <div v-else-if="loadState === 'error'" class="max-w-2xl mx-auto rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800 shadow-xl text-left">
        <p class="font-semibold text-lg">Could not load sponsor results.</p>
        <p class="mt-2 text-sm bg-white/50 p-3 rounded-xl border border-red-100 font-mono text-xs">{{ errorMessage }}</p>
        <div class="flex gap-3 mt-4">
          <button type="button" class="inline-flex items-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors shadow-sm" @click="loadSponsors">
            Retry Connection
          </button>
          <button type="button" class="inline-flex items-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm" @click="goBackToForm">
            Modify Form Info
          </button>
        </div>
      </div>

      <div v-else-if="loadState === 'success'">
        <div class="text-left mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 class="text-3xl md:text-4xl font-bold text-slate-900">
              Available sponsors for "{{ latestRequest?.organizationName || 'your organization/event' }}"
            </h1>
            <p class="text-sm text-gray-600 mt-2">
              Results are fetched from Hugging Face and checked locally for validity.
            </p>
          </div>
          
          <div class="w-full md:w-72">
            <input v-model="searchQuery" type="text" placeholder="🔍 Live filter results..." class="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm bg-white" />
          </div>
        </div>

        <div v-if="filteredSponsors.length === 0" class="rounded-2xl border border-gray-200 bg-white p-8 text-gray-500 shadow-md text-center">
          No matches found for "{{ searchQuery }}". Try adjusting your filter term.
        </div>

        <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article v-for="sponsor in paginatedSponsors" :key="`${sponsor.name}-${sponsor.href}`" class="bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-shadow p-5 text-left flex flex-col justify-between">
            <div>
              <div class="flex items-start gap-4">
                <div class="h-14 w-14 shrink-0 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                  <img
                    :src="`https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(sponsor.href)}`"
                    :alt="`${sponsor.name} logo`"
                    class="h-10 w-10 object-contain"
                    referrerpolicy="no-referrer"
                  />
                </div>

                <div class="min-w-0 flex-1">
                  <h2 class="text-xl font-semibold text-slate-900 truncate">{{ sponsor.name }}</h2>
                  <p class="text-xs uppercase tracking-wide text-slate-500 mt-1">Timezone: {{ sponsor.timezone }}</p>
                </div>
              </div>

              <div class="mt-4 space-y-3 text-sm text-gray-700">
                <p><span class="font-semibold text-slate-900">Summary:</span> {{ sponsor.summary }}</p>
                <p><span class="font-semibold text-slate-900">Deadline:</span> {{ sponsor.deadline }}</p>
                <p v-if="sponsor.why"><span class="font-semibold text-slate-900">Why it matches:</span> {{ sponsor.why }}</p>
                <p>
                  <span class="font-semibold text-slate-900">Website:</span>
                  <a :href="sponsor.href" target="_blank" rel="noreferrer" class="text-blue-600 hover:underline break-all ml-1">{{ sponsor.label }}</a>
                </p>
                <p><span class="font-semibold text-slate-900">Contact:</span> {{ sponsor.contact }}</p>
              </div>
            </div>
          </article>
        </div>

        <div v-if="filteredSponsors.length > itemsPerPage" class="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            :disabled="!canGoPrevious"
            @click="goToPreviousPage"
          >
            <span aria-hidden="true">←</span> Previous
          </button>

          <p class="text-sm text-slate-600 font-medium">
            Page {{ currentPage }} of {{ totalPages }}
          </p>

          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            :disabled="!canGoNext"
            @click="goToNextPage"
          >
            Next <span aria-hidden="true">→</span>
          </button>
        </div>

        <div class="mt-8 border-t border-gray-200 pt-6 text-center">
          <button @click="goBackToForm" class="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
            ← Go Back to Dashboard Home
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const STORAGE_KEY = 'vexreachData'
const HF_MODEL = 'Qwen/Qwen2.5-7B-Instruct'
const HF_URL = 'https://router.huggingface.co/v1/chat/completions'
const router = useRouter()

const sponsorCards = ref([])
const loadState = ref('loading')
const errorMessage = ref('')
const currentPage = ref(1)
const itemsPerPage = 9
const searchQuery = ref('')

const latestRequest = computed(() => {
  try {
    const savedRequests = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    if (savedRequests && savedRequests.length > 0) {
      return savedRequests[savedRequests.length - 1]
    }
  } catch (e) {}

  if (window.__vexreachMemory && window.__vexreachMemory.length > 0) {
    return window.__vexreachMemory[window.__vexreachMemory.length - 1]
  }

  return null
})

const sanitizeText = (value) => String(value || '').replace(/[\u0000-\u001F\u007F]/g, '').trim()

const formatTimeZoneLabel = (date) => {
  const offsetMinutes = -date.getTimezoneOffset()
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const absoluteMinutes = Math.abs(offsetMinutes)
  const hours = String(Math.floor(absoluteMinutes / 60)).padStart(2, '0')
  const minutes = String(absoluteMinutes % 60).padStart(2, '0')
  return `UTC${sign}${hours}:${minutes}`
}

const buildSearchUrl = (query) => `https://www.google.com/search?q=${encodeURIComponent(query)}`

const normalizeWebsite = (value, sponsorName) => {
  const cleanedWebsite = sanitizeText(value)

  if (!cleanedWebsite) {
    return {
      href: buildSearchUrl(`${sponsorName} sponsorship`),
      label: 'Search website',
      isFallback: true,
    }
  }

  const websiteWithProtocol = /^https?:\/\//i.test(cleanedWebsite) ? cleanedWebsite : `https://${cleanedWebsite}`

  try {
    const url = new URL(websiteWithProtocol)
    return {
      href: url.toString(),
      label: url.hostname.replace(/^www\./i, ''),
      isFallback: false,
    }
  } catch {
    return {
      href: buildSearchUrl(`${sponsorName} sponsorship`),
      label: 'Search website',
      isFallback: true,
    }
  }
}

const formatDeadline = (daysAhead) => {
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + daysAhead)
  futureDate.setHours(17, 0, 0, 0)

  return `${futureDate.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })} ${formatTimeZoneLabel(futureDate)}`
}

const extractResponseText = (payload) => {
  const choice = payload?.choices?.[0]
  const content = choice?.message?.content ?? choice?.text ?? payload?.generated_text ?? payload?.answer ?? payload?.response

  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === 'string' ? part : part?.text || part?.content || ''))
      .join(' ')
      .trim()
  }

  if (typeof content === 'string') {
    return content.trim()
  }

  if (typeof payload === 'string') {
    return payload.trim()
  }

  return ''
}

const unwrapJson = (value) => {
  let current = String(value || '').trim()

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const withoutFences = current.replace(/^\u0060{3}(?:json)?\s*/i, '').replace(/\s*\u0060{3}$/i, '').trim()
    const firstObject = withoutFences.indexOf('{')
    const firstArray = withoutFences.indexOf('[')
    const startIndex = firstObject === -1 ? firstArray : firstArray === -1 ? firstObject : Math.min(firstObject, firstArray)
    const candidate = startIndex >= 0 ? withoutFences.slice(startIndex) : withoutFences

    try {
      const parsed = JSON.parse(candidate)
      if (typeof parsed === 'string') {
        current = parsed
        continue
      }

      return parsed
    } catch {
      if (candidate === current) {
        break
      }
      current = candidate
    }
  }

  return null
}

const toPositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(String(value ?? ''), 10)
  if (Number.isInteger(parsed) && parsed > 0) {
    return parsed
  }

  return fallback
}

const normalizeSponsors = (payload) => {
  let rawSponsors = []

  if (Array.isArray(payload)) {
    rawSponsors = payload
  } else if (payload && typeof payload === 'object') {
    rawSponsors = payload.sponsors || payload.results || payload.grants || payload.companies || payload.partners || payload.matches || []
    
    if (rawSponsors.length === 0) {
      for (const key in payload) {
        if (Array.isArray(payload[key]) && payload[key].length > 0) {
          rawSponsors = payload[key]
          break
        }
      }
    }
  }

  return rawSponsors
    .map((sponsor, index) => {
      const name = sanitizeText(sponsor?.name) || `Sponsor ${index + 1}`
      const website = normalizeWebsite(sanitizeText(sponsor?.website || sponsor?.url || sponsor?.link), name)
      const deadlineDays = Math.min(Math.max(toPositiveInteger(sponsor?.deadlineDays ?? sponsor?.deadline_days ?? sponsor?.daysAhead, 14 + index * 7), 1), 90)
      const summary = sanitizeText(sponsor?.summary || sponsor?.description || sponsor?.gives || sponsor?.overview || 'Matched from the submitted request.')
      const contact = sanitizeText(sponsor?.contact || sponsor?.email || sponsor?.contactPage || 'Not provided')
      const why = sanitizeText(sponsor?.why || sponsor?.match_reason || sponsor?.reason || '')

      return {
        name,
        summary,
        contact,
        why,
        deadline: formatDeadline(deadlineDays),
        timezone: formatTimeZoneLabel(new Date()),
        ...website,
      }
    })
    .filter((sponsor) => sponsor.name)
}

const filteredSponsors = computed(() => {
  if (!searchQuery.value.trim()) return sponsorCards.value
  const query = searchQuery.value.toLowerCase()
  return sponsorCards.value.filter(sponsor => {
    return sponsor.name.toLowerCase().includes(query) || 
           sponsor.summary.toLowerCase().includes(query) ||
           sponsor.why.toLowerCase().includes(query)
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredSponsors.value.length / itemsPerPage)))

const offset = computed(() => (currentPage.value - 1) * itemsPerPage)

const paginatedSponsors = computed(() => {
  return filteredSponsors.value.slice(offset.value, offset.value + itemsPerPage)
})

const canGoPrevious = computed(() => currentPage.value > 1)

const canGoNext = computed(() => currentPage.value < totalPages.value)

const goToPreviousPage = () => {
  if (canGoPrevious.value) {
    currentPage.value -= 1
  }
}

const goToNextPage = () => {
  if (canGoNext.value) {
    currentPage.value += 1
  }
}

const buildPrompt = (request) => {
  const organizationName = sanitizeText(request?.organizationName || 'the organization')
  const sponsorshipType = sanitizeText(request?.sponsorshipType || 'sponsorship')
  const organizationField = sanitizeText(request?.organizationField || 'general')
  const description = sanitizeText(request?.description || '')
  const size = sanitizeText(request?.size || '')
  const community = sanitizeText(request?.community || '')

  return [
    'You are a sponsor matching assistant.',
    'Return valid JSON only. No markdown, no code fences, no explanation.',
    'The top-level JSON must be an object with a sponsors array containing as many highly relevant corporate sponsors, grants, or foundations as possible (minimum 25, up to 30 items). Keep each summary very short (1 sentence) to avoid truncation.',
    'Each sponsor object must include: name, summary, website, contact, why, deadlineDays.',
    'website should be the best official sponsor page or contact page URL you can infer.',
    'contact can be an email address or a contact page URL.',
    'deadlineDays must be a positive whole number between 7 and 60.',
    '',
    `Request summary: ${organizationName} is looking for ${sponsorshipType}.`,
    `Field: ${organizationField}.`,
    `Description: ${description}.`,
    `Size: ${size}.`,
    `Community: ${community}.`,
    '',
    'Choose sponsors that realistically fit the request and keep each summary concise.',
  ].join('\n')
}

const goBackToForm = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {}
  if (window.__vexreachMemory) {
    window.__vexreachMemory = []
  }
  sponsorCards.value = []
  searchQuery.value = ''
  currentPage.value = 1
  if (router && typeof router.push === 'function') {
    router.push('/dashboard')
  } else {
    if (window.location.hash) {
      window.location.hash = '#/dashboard'
    } else {
      window.location.pathname = '/dashboard'
    }
  }
}

const loadSponsors = async () => {
  const request = latestRequest.value

  if (!request) {
    if (router && typeof router.push === 'function') {
      router.push('/dashboard')
    } else {
      if (window.location.hash) {
        window.location.hash = '#/dashboard'
      } else {
        window.location.pathname = '/dashboard'
      }
    }
    return
  }

  const token = import.meta.env.VITE_HF_TOKEN?.trim()
  if (!token) {
    loadState.value = 'error'
    errorMessage.value = 'Missing Hugging Face token. Add VITE_HF_TOKEN to your local .env configuration file.'
    sponsorCards.value = []
    return
  }

  loadState.value = 'loading'
  errorMessage.value = ''
  sponsorCards.value = []

  try {
    const response = await fetch(HF_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages: [
          {
            role: 'system',
            content: 'Return valid JSON only. Do not include markdown wrappers or conversational intro text.',
          },
          {
            role: 'user',
            content: buildPrompt(request),
          },
        ],
        temperature: 0.2,
        max_tokens: 2000,
        response_format: {
          type: 'json_object',
        },
      }),
    })

    if (!response.ok) {
      const details = await response.text()
      throw new Error(`Hugging Face request failed (${response.status}): ${details.slice(0, 300)}`)
    }

    const payload = await response.json()
    const responseText = extractResponseText(payload)
    const parsed = unwrapJson(responseText) || unwrapJson(payload)
    const normalizedSponsors = normalizeSponsors(parsed)

    if (!normalizedSponsors.length) {
      throw new Error('Hugging Face returned no structured sponsor matching records.')
    }

    sponsorCards.value = normalizedSponsors
    currentPage.value = 1
    loadState.value = 'success'
  } catch (error) {
    loadState.value = 'error'
    sponsorCards.value = []
    currentPage.value = 1
    errorMessage.value = error instanceof Error ? error.message : 'Unable to balance sponsor retrieval handshake metrics.'
  }
}

onMounted(() => {
  loadSponsors()
})
</script>