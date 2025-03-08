<template>
  <div class="min-h-screen bg-white">
    <header class="border-b">
      <nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 justify-between">
          <div class="flex">
            <div class="flex flex-shrink-0 items-center">
              <NuxtLink
                to="/"
                class="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium"
              >
                Home
              </NuxtLink>
              <NuxtLink
                to="/about"
                class="text-gray-900 hover:text-gray-600 px-3 py-2 text-sm font-medium"
              >
                About
              </NuxtLink>
            </div>
          </div>
        </div>
      </nav>
    </header>
    <main>
      <slot />
    </main>
  </div>
</template>
