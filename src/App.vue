<template>
	<v-app id="app">

		<!-- Sidebar -->
		<v-navigation-drawer
			v-model="drawer"
			app
		>
			<v-list>
				<v-list-item-group>
					<!-- Home Page -->
					<v-list-item class="mb-10" to="/">
						<router-link to="/"><v-icon>mdi-home</v-icon>&nbsp;Home</router-link>
					</v-list-item>
					<!-- Spotify Page -->
					<v-list-item class="mb-10" to="/">
						<router-link to="Spotify"><v-icon>mdi-spotify</v-icon>&nbsp;Spotify</router-link>
					</v-list-item>
				</v-list-item-group>
			</v-list>
		</v-navigation-drawer>

		<!-- Navbar -->
		<v-app-bar app>
			<v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
			<v-toolbar-title>AudioHaven API Playground - {{ currentRouteName }}</v-toolbar-title>
		</v-app-bar>

		<!-- Router View -->
		<v-main>
			<transition name="fade" mode="out-in">
				<router-view></router-view>
			</transition>
		</v-main>

	</v-app>
</template>

<script>
export default {
	name: 'App',
	data: () => ({
		drawer: null
	}),
	computed: {
		currentRouteName() {
			return this.$route.name;
		}
	}
}
</script>

<style>

/* Global Styling */

#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
}

/* Transition Styling */

.fade-enter-active {
	-webkit-animation: fade-in 0.6s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;
	animation: fade-in 0.6s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;
}
.fade-leave-active {
	-webkit-animation: fade-out 0.5s ease-out both;
	animation: fade-out 0.5s ease-out both;
}
@-webkit-keyframes fade-in {
	0% {
		opacity: 0;
	}
	100% {
		opacity: 1;
	}
}
@keyframes fade-in {
	0% {
		opacity: 0;
	}
	100% {
		opacity: 1;
	}
}
@-webkit-keyframes fade-out {
	0% {
		opacity: 1;
	}
	100% {
		opacity: 0;
	}
}
@keyframes fade-out {
	0% {
		opacity: 1;
	}
	100% {
		opacity: 0;
	}
}

</style>
