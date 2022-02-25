<template>
	<v-navigation-drawer app :value="sideBarValue">
		<v-list>
			<!-- Sidebar link list -->
			<v-list-item-group>
				<!-- Home Page -->
				<v-list-item class="mb-10 sideLink" to="/" @click="sideBarValue=!sideBarValue">
					<router-link to="/"><v-icon size="36" color="purple">mdi-home</v-icon>&nbsp;Home</router-link>
				</v-list-item>
				<!-- Spotify Page -->
				<v-list-item class="mb-10 sideLink" to="Spotify" @click="sideBarValue=!sideBarValue">
					<router-link to="Spotify"><v-icon size="36" color="green">mdi-spotify</v-icon>&nbsp;Spotify</router-link>
				</v-list-item>
			</v-list-item-group>
		</v-list>
	</v-navigation-drawer>
</template>

<script>
export default {
	name: "NavSideBar",
	methods: {

	},
	props: ['sideBarValue']
}
</script>

<style>

</style>