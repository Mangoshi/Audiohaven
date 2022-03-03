<template>
	<v-app id="app" :style="cssProps">

		<!--Sidebar-->
		<v-navigation-drawer
			v-model="drawer"
			app
			color="primary"
		>
			<v-list>
				<!-- Sidebar link list -->
				<v-list-item-group>
					<!-- Home Page -->
					<v-list-item class="mb-10 sideLink secondary--text" to="/">
						<v-icon color="purple" size="36">mdi-home</v-icon>&nbsp;
						Home
					</v-list-item>
					<!-- Spotify Page -->
					<v-list-item class="mb-10 sideLink secondary--text" to="Spotify">
						<v-icon color="green" size="36">mdi-spotify</v-icon>&nbsp;
						Spotify
					</v-list-item>
				</v-list-item-group>
			</v-list>
		</v-navigation-drawer>
		<!--End sidebar-->

		<!-- Navbar -->
		<v-app-bar app color="primary">
			<!-- Sidebar hamburger button (only active when logged in) -->
			<v-app-bar-nav-icon v-if="$store.state.loggedIn" @click="drawer = !drawer"></v-app-bar-nav-icon>
			<!-- Page title : x + {{ route's title }} -->
			<v-toolbar-title>AudioHaven 🛠 {{ currentRouteName }}</v-toolbar-title>
			<!-- Spacer -->
			<v-spacer>

			</v-spacer>
			<!--	System-bar toggle button	-->
			<v-btn icon @click="toggleSystemBar()"><v-icon>mdi-play-pause</v-icon></v-btn>
			<!--	Dark/Light mode toggle button	-->
			<v-btn icon style="margin-right: 15px" @click="toggleDarkMode()"><v-icon>mdi-brightness-4</v-icon></v-btn>
			<!--	Log-out button (bg colour = accent & text colour = black)	-->
			<v-btn v-if="$store.state.loggedIn" class="accent secondary--text" @click="logout()">Log Out</v-btn>
		</v-app-bar>

		<!-- Router View -->
		<v-main>
			<transition mode="out-in" name="fade">
				<router-view></router-view>
			</transition>
		</v-main>

		<!-- Status Bar -->
		<SystemBar v-if="systemBar"></SystemBar>

	</v-app>
</template>

<script>
import { mapState } from 'vuex'
import SystemBar from "@/components/SystemBar";

export default {
	name: 'App',
	components: { SystemBar },
	data: () => ({
		drawer: false,
		systemBar: false
	}),
	created(){
		if (localStorage.getItem('token')){
			this.$store.commit('SET_LOGGED_IN_STATUS', true)
		} else {
			this.$store.commit('SET_LOGGED_IN_STATUS', false)
		}
	},
	mounted(){
		this.$vuetify.theme.dark = this.$store.state.darkMode
	},
	methods: {
		logout() {
			this.$store.dispatch('logout')
			this.$router.replace("/")
		},
		toggleSystemBar() {
			this.systemBar = !this.systemBar
		},
		toggleDarkMode() {
			this.$store.commit('SWITCH_THEME')
			this.$vuetify.theme.dark = this.$store.state.darkMode
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

.sideLink:link{
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
