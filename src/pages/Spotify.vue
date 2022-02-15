<template>
	<v-container fluid>
		<v-container>
			<v-simple-table>
				<template v-slot:default>
					<thead>
					<tr>
						<th class="text-left">
							Endpoint
						</th>
						<th class="text-left">
							Type
						</th>
						<th class="text-left">
							Request
						</th>
						<th class="text-left">
							Response
						</th>
					</tr>
					</thead>
					<tbody>
					<tr
						v-for="item in spotifyRequests"
						:key="item.type"
						style="text-align: left"
					>
						<td>{{ item.endpoint }}</td>
						<td :style="`background-color:${item.color}`" style="text-align: center">{{ item.type }}</td>
						<td>{{ item.request }}</td>
						<td>{{ item.response }}</td>
					</tr>
					</tbody>
				</template>
			</v-simple-table>
		</v-container>
		<v-container>
			<!--	If there is no token == You're not logged-in to Spotify	-->
			<div v-if="!spotifyLoggedIn">
				<v-btn icon href="http://localhost:3000/spotify/login/">
					<v-icon>mdi-spotify</v-icon> Log-in to Spotify
				</v-btn>
			</div>
			<!--	Else if there is a token == You're logged-in to Spotify	-->
			<div v-else>
				<v-btn icon v-on:click="logoutSpotify()">
					<v-icon>mdi-spotify</v-icon> Log-out of Spotify
				</v-btn>
			</div>
		</v-container>
		<v-container>
			<!--	If there is a token == You're logged-in to Spotify	-->
			<div v-if="spotifyLoggedIn">

			</div>
		</v-container>
	</v-container>
</template>

<script>
// import axios from '../config/audiohaven.js'
import router from "@/router";

require('dotenv').config();


export default {
	name: "Spotify",
	title: 'Spotify',
	components: {},
	data(){
		return{
			spotifyRequests: [
				{
					endpoint: 'N/A',
					type: 'OAuth',
					color: 'magenta',
					request: 'http://localhost:3000/spotify/login',
					response: '[URL] Access Token & Refresh Token',
				},
				{
					endpoint: 'Create Playlist',
					type: 'POST',
					color: 'lime',
					request: 'https://api.spotify.com/v1/users/1174214454/playlists',
					response: '[JSON] New playlist details.',
				},
				{
					endpoint: 'Get Playlist Items',
					type: 'GET',
					color: 'cyan',
					request: 'https://api.spotify.com/v1/playlists/6ExDnRZ59C0NKPKW4YW54S/tracks',
					response: "[JSON] Items from given playlist.",
				},
				{
					endpoint: 'Add To Playlist',
					type: 'POST',
					color: 'lime',
					request: 'https://api.spotify.com/v1/playlists/6ExDnRZ59C0NKPKW4YW54S/tracks',
					response: '[JSON] Snapshot ID.',
				},
				{
					endpoint: 'Update Playlist Items',
					type: 'PUT',
					color: 'orange',
					request: 'https://api.spotify.com/v1/playlists/6ExDnRZ59C0NKPKW4YW54S/tracks',
					response: '[JSON] Snapshot ID.',
				},
				{
					endpoint: 'Remove Playlist Items',
					type: 'DELETE',
					color: 'red',
					request: 'https://api.spotify.com/v1/playlists/6ExDnRZ59C0NKPKW4YW54S/tracks',
					response: '[JSON] Snapshot ID.',
				}
			],
			spotifyLoggedIn: false,
			// Data Iterator //,
		}
	},
	mounted(){
		this.checkTokens()
		this.checkSpotifyLogin()
	},
	methods: {
		// spotifyOAuth(){
		// 	axios("/spotify/login")
		// }
		checkTokens(){
			if(this.$route.query.access_token && this.$route.query.refresh_token) {
				// Assign tokens as variables
				let access_token = this.$route.query.access_token
				let refresh_token = this.$route.query.refresh_token
				// Log tokens
				console.log("Access Token: ", access_token)
				console.log("Refresh Token: ", refresh_token)
				// Store tokens in localStorage
				localStorage.setItem("spotify_access_token", access_token)
				localStorage.setItem("spotify_refresh_token", refresh_token)

			} else {
				// Otherwise, log the fact there are no tokens in the URL
				console.log("No access/refresh token in URL!")
			}
		},
		checkSpotifyLogin(){
			// If spotify_access_token exists, spotifyLoggedIn = true, else spotifyLoggedIn = false
			this.spotifyLoggedIn = !!localStorage.getItem("spotify_access_token");
		},
		logoutSpotify(){
			// Remove tokens
			localStorage.removeItem("spotify_access_token")
			localStorage.removeItem("spotify_refresh_token")
			// Push "/spotify" to URL (to remove tokens if present)
			router.push("/spotify")
			// Go to current location (to refresh/reload page)
			router.go(0)
			// Set spotifyLoggedIn to true
			this.spotifyLoggedIn = false;
		}
	}
}
</script>

<style>

</style>