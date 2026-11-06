<script setup>
import { onMounted, ref } from 'vue';

// Same-origin API calls: nginx (or the Vite dev proxy) forwards /v1 to the backend.
const health = ref(null);
const items = ref([]);
const newName = ref('');
const error = ref('');

async function api(path, options) {
	const res = await fetch(`/v1${path}`, {
		headers: { 'Content-Type': 'application/json' },
		...options,
	});
	if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
	return res.json();
}

async function load() {
	error.value = '';
	try {
		[health.value, items.value] = await Promise.all([api('/health'), api('/items')]);
	} catch (e) {
		error.value = `Backend unreachable: ${e.message}`;
	}
}

async function addItem() {
	if (!newName.value.trim()) return;
	try {
		items.value.push(await api('/items', { method: 'POST', body: JSON.stringify({ name: newName.value }) }));
		newName.value = '';
	} catch (e) {
		error.value = e.message;
	}
}

onMounted(load);
</script>

<template>
	<main>
		<h1>Howard Lite</h1>

		<p v-if="error" class="error">{{ error }}</p>
		<p v-else-if="health" class="ok">
			API {{ health.status }} · {{ health.service }} ({{ health.environment }}) · Node {{ health.node }} · up {{ health.uptime }}s
		</p>
		<p v-else>Checking API…</p>

		<form @submit.prevent="addItem">
			<input v-model="newName" placeholder="New item" />
			<button type="submit">Add</button>
			<button type="button" @click="load">Refresh</button>
		</form>

		<ul>
			<li v-for="item in items" :key="item.id">{{ item.name }}</li>
		</ul>
	</main>
</template>

<style>
body { font-family: system-ui, sans-serif; margin: 0; padding: 2rem 1rem; }
main { max-width: 32rem; margin: 0 auto; }
.ok { color: #1a7f37; }
.error { color: #cf222e; }
form { display: flex; gap: 0.5rem; }
input { flex: 1; padding: 0.4rem; }
</style>
