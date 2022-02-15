<template>
	<v-app id="app">

    <!--Sidebar-->
    <NavSideBar v-if="$store.state.loggedIn" :drawer="false"> </NavSideBar>
    <!--End sidebar-->

		<!-- Navbar -->
		<v-app-bar app>

			<v-app-bar-nav-icon v-if="$store.state.loggedIn" @click="NavSideBar"></v-app-bar-nav-icon>
			<v-toolbar-title>AudioHaven API Playground - {{ currentRouteName }}</v-toolbar-title>
			<v-spacer>

			</v-spacer>
			<v-btn v-if="$store.state.loggedIn" class="v-btn accent black--text" @click="logout()">Log Out</v-btn>
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
import { mapState } from 'vuex'
import NavSideBar from '@/components/NavSideBar'

export default {
	name: 'App',
  components: {
    NavSideBar,
  },
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

/*Fonts*/
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap');

#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
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
