<template>
	<v-app id="app">

		<!--Sidebar-->
		<!--	TODO: Manage sidebar state https://stackoverflow.com/questions/40780730/vue-js-changing-props		-->
		<v-navigation-drawer
			v-model="drawer"
			app
		>
			<v-list>
				<!-- Sidebar link list -->
				<v-list-item-group>
					<!-- Home Page -->
					<v-list-item class="mb-10 sideLink" to="/">
						<router-link to="/"><v-icon size="36" color="purple">mdi-home</v-icon>&nbsp;Home</router-link>
					</v-list-item>
					<!-- Spotify Page -->
					<v-list-item class="mb-10 sideLink" to="Spotify">
						<router-link to="Spotify"><v-icon size="36" color="green">mdi-spotify</v-icon>&nbsp;Spotify</router-link>
					</v-list-item>
				</v-list-item-group>
			</v-list>
		</v-navigation-drawer>
		<!--End sidebar-->

		<!-- Navbar -->
		<v-app-bar app>
			<!-- Sidebar hamburger button (only active when logged in) -->
			<v-app-bar-nav-icon v-if="$store.state.loggedIn" @click="drawer = !drawer"></v-app-bar-nav-icon>
			<!-- Page title : x + {{ route's title }} -->
			<v-toolbar-title>AudioHaven 🛠 {{ currentRouteName }}</v-toolbar-title>
			<!-- Spacer -->
			<v-spacer>

			</v-spacer>
			<!--	Dark/Light mode toggle button	-->
			<v-btn icon style="margin-right: 10px" class=""><v-icon>mdi-brightness-4</v-icon></v-btn>
			<!--	Log-out button (bg colour = accent & text colour = black)	-->
			<v-btn v-if="$store.state.loggedIn" class="accent black--text" @click="logout()">Log Out</v-btn>
		</v-app-bar>

		<!-- Router View -->
		<v-main>
			<transition name="fade" mode="out-in">
				<router-view></router-view>
			</transition>
		</v-main>

		<!-- Status Bar -->
		<SystemBar></SystemBar>

	</v-app>
</template>

<script>
import { mapState } from 'vuex'
import SystemBar from "@/components/SystemBar";

export default {
	name: 'App',
	components: { SystemBar },
	data: () => ({
		drawer: false
	}),
	created(){
		if (localStorage.getItem('token')){
			this.$store.commit('SET_LOGGED_IN_STATUS', true)
		} else {
			this.$store.commit('SET_LOGGED_IN_STATUS', false)
		}
	},
	methods: {
		logout() {
			this.$store.dispatch('logout')
			this.$router.replace("/")
		},
	},
	computed: {
		currentRouteName() {
			return this.$route.name;
		},
		// mapping loggedIn state
		...mapState(['loggedIn']),
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

.sideLink:link *{
	font-size: 24px;
	text-decoration: none;
	color: black;
}

/* Utility Classes */

.unselectable {
	user-select: none;
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
