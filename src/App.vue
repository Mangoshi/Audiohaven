<template>
	<v-app id="app">

		<!--Sidebar-->
		<!--	side-bar-value is the prop used to control the sidebar state	-->
		<!--	v-click-outside is a Vuetify directive allowing for a handler, -->
		<!--	invoked when the user clicks outside the target element. -->
		<!--	handler = function executed when user clicks outside the sidebar -->
		<!--	include = in this case, includes any element with class="include"	-->
		<!--	eg: the button used to open the sidebar must be included, or it fires the event on-click	-->
		<NavSideBar
			:side-bar-value="sideBar"
			v-click-outside="{ handler: onClickOutside, include: include }"
		> <!--
			TODO: Figure out how to assign sideBar to 'false' when a router link is clicked..
			Have tried it on NavSideBar.vue scope but it doesn't change the value here..
			Also tried swapping it on mounted & created on both, nada.
			-->
		</NavSideBar>
		<!--End sidebar-->

		<!-- Navbar -->
		<v-app-bar app>
			<!-- Sidebar hamburger button (only active when logged in) -->
			<v-app-bar-nav-icon v-if="$store.state.loggedIn" @click="toggleSideBar()" class="included"></v-app-bar-nav-icon>
			<!-- Page title : x + {{ route's title }} -->
			<v-toolbar-title>AudioHaven 🛠 {{ currentRouteName }}</v-toolbar-title>
			<!-- Spacer -->
			<v-spacer>

			</v-spacer>
			<!--	System-bar toggle button	-->
			<v-btn v-if="$store.state.loggedIn" icon @click="toggleSystemBar()"><v-icon>mdi-play-pause</v-icon></v-btn>
			<!--	Dark/Light mode toggle button	-->
			<v-btn icon style="margin-right: 15px"><v-icon>mdi-brightness-4</v-icon></v-btn>
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
		<SystemBar v-if="systemBar"></SystemBar>

	</v-app>
</template>

<script>
import { mapState } from 'vuex'
import SystemBar from "./components/SystemBar";
import NavSideBar from "./components/NavSideBar";

export default {
	name: 'App',
	components: { SystemBar, NavSideBar },
	data: () => ({
		sideBar: false,
		systemBar: false
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
		toggleSystemBar() {
				this.systemBar = !this.systemBar
		},
		toggleSideBar() {
			this.sideBar = !this.sideBar
		},
		onClickOutside() {
			if(this.sideBar)
			this.sideBar = false
		},
		include() {
			return [document.querySelector('.included')]
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
