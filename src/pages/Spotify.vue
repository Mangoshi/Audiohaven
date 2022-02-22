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
						v-for="requestEntry in spotifySampleRequests"
						:key="requestEntry.type"
						style="text-align: left"
					>
						<td>{{ requestEntry.endpoint }}</td>
						<td :style="`background-color:${requestEntry.color}`" style="text-align: center">{{ requestEntry.type }}</td>
						<td>{{ requestEntry.request }}</td>
						<td>{{ requestEntry.response }}</td>
					</tr>
					</tbody>
				</template>
			</v-simple-table>
		</v-container>
		<!-- Spotify Login Button	-->
		<v-container>
			<!--	If there is no token == You're not logged-in to Spotify	-->
			<div v-if="!spotifyLoggedIn">
				<v-btn href="https://audiohaven-api.herokuapp.com/spotify/login/">
					<v-icon>mdi-spotify</v-icon> Log-in to Spotify
				</v-btn>
			</div>
			<!--	Else if there is a token == You're logged-in to Spotify	-->
			<div v-else>
				<v-btn v-on:click="logoutSpotify()">
					<v-icon>mdi-spotify</v-icon> Log-out of Spotify
				</v-btn>
				<!--  DEV FUNCTION: Invalidate token for easy 401 error testing  -->
				<v-btn v-on:click="removeSpotifyToken()">
					<v-icon>mdi-delete</v-icon> Remove access token
				</v-btn>
			</div>
		</v-container>
		<div v-if="spotifyErrors">
			<h4 style="color: deeppink; background-color: #333; font-family: 'Courier New', monospace;">{{ spotifyErrors }}</h4>
			<v-btn v-on:click="refreshSpotifyToken()">
				<v-icon>mdi-spotify</v-icon> Refresh Token
			</v-btn>
		</div>
		<!--	Followed Artists Data Iterator	-->
		<v-container>
			<!--	If there is a token && no Spotify errors  -->
			<div v-if="spotifyLoggedIn && !spotifyErrors">
				<h1>Artists You Follow</h1>
				<v-data-iterator
					:items="followedArtists"
					:items-per-page.sync="followedArtistsPerPage"
					:page.sync="followedArtistPage"
					:search="followedArtistSearch"
					:sort-by="followedArtistSortBy.toLowerCase()"
					:sort-desc="followedArtistSortDesc"
					hide-default-footer
				>
					<template v-slot:header>
						<v-toolbar
							dark
							color="purple darken-3"
							class="mb-1"
						>
							<v-text-field
								v-model="followedArtistSearch"
								clearable
								flat
								solo-inverted
								hide-details
								prepend-inner-icon="mdi-magnify"
								label="Search"
							></v-text-field>
							<template v-if="$vuetify.breakpoint.mdAndUp">
								<v-spacer></v-spacer>
								<v-select
									v-model="followedArtistSortBy"
									flat
									solo-inverted
									hide-details
									:items="followedArtistKeys"
									prepend-inner-icon="mdi-magnify"
									label="Sort by"
								></v-select>
								<v-spacer></v-spacer>
								<v-btn-toggle
									v-model="followedArtistSortDesc"
									mandatory
								>
									<v-btn
										large
										depressed
										color="purple"
										:value="false"
									>
										<v-icon>mdi-arrow-up</v-icon>
									</v-btn>
									<v-btn
										large
										depressed
										color="purple"
										:value="true"
									>
										<v-icon>mdi-arrow-down</v-icon>
									</v-btn>
								</v-btn-toggle>
							</template>
						</v-toolbar>
					</template>

					<!-- Data Iterator Items -->
					<template v-slot:default="props">
						<v-row>
							<v-col
								v-for="followedArtist in props.items"
								:key="followedArtist.name"
								cols="12"
								sm="6"
								md="4"
								lg="3"
							>
								<v-card>
									<v-card-title class="subheading font-weight-bold">
										{{ followedArtist.name }}
									</v-card-title>
									<!-- Artist Artwork (Links to artist page on Spotify) -->
									<a :href="followedArtist.external_urls.spotify" target="_blank">
										<v-img
											:src="followedArtist.images[0].url"
											:aspect-ratio="1"
										>
										</v-img>
									</a>

									<v-divider></v-divider>

									<v-list dense>
										<v-list-item
											v-for="(key, followedArtist) in followedArtistFilteredKeys"
											:key="followedArtist"
										>
											<v-list-item-content :class="{ 'purple--text': followedArtistSortBy === key }">
												{{ key }}:
											</v-list-item-content>
											<v-list-item-content
												class="align-end"
												:class="{ 'purple--text': followedArtistSortBy === key }"
											>
												{{ followedArtist[key.toLowerCase()] }}
											</v-list-item-content>
										</v-list-item>
									</v-list>
								</v-card>
							</v-col>
						</v-row>
					</template>

					<template v-slot:footer>
						<v-row
							class="mt-2"
							align="center"
							justify="center"
						>
							<span class="grey--text">Artists per page</span>
							<v-menu offset-y>
								<template v-slot:activator="{ on, attrs }">
									<v-btn
										dark
										text
										color="primary"
										class="ml-2"
										v-bind="attrs"
										v-on="on"
									>
										{{ followedArtistsPerPage }}
										<v-icon>mdi-chevron-down</v-icon>
									</v-btn>
								</template>
								<v-list>
									<v-list-item
										v-for="(number, followedArtist) in followedArtistsPerPageArray"
										:key="followedArtist"
										@click="updateFollowedArtistsPerPage(number)"
									>
										<v-list-item-title>{{ number }}</v-list-item-title>
									</v-list-item>
								</v-list>
							</v-menu>

							<v-spacer></v-spacer>

							<span class="mr-4grey--text">
								Page {{ followedArtistPage }} of {{ numberOfFollowedArtistPages }}
							</span>
							<v-btn
								fab
								dark
								color="purple darken-3"
								class="mr-1"
								@click="formerFollowedArtistPage"
							>
								<v-icon>mdi-chevron-left</v-icon>
							</v-btn>
							<v-btn
								fab
								dark
								color="purple darken-3"
								class="ml-1"
								@click="nextFollowedArtistPage"
							>
								<v-icon>mdi-chevron-right</v-icon>
							</v-btn>
						</v-row>
					</template>
				</v-data-iterator>
			</div>
		</v-container>
	</v-container>
</template>

<script>
// import axios from '../config/audiohaven.js'
import router from "@/router";
import axios from "axios";

require('dotenv').config();


export default {
	name: "Spotify",
	title: 'Spotify Sandbox',
	components: {},
	data(){
		return{
			// Sample API Table Data
			spotifySampleRequests: [
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
			// Spotify Data
			spotifyLoggedIn: false,
			spotifyErrors: "",
			// Toggle Data
			selectedDataIterator: "followedArtists",
			// Followed Artists Data Iterator
			followedArtistsPerPageArray: [4, 8, 12],
			followedArtistSearch: '',
			followedArtistFilter: {},
			followedArtistSortDesc: false,
			followedArtistPage: 1,
			followedArtistsPerPage: 4,
			followedArtistSortBy: 'name',
			followedArtistKeys: [
				'Name',
				'Popularity',
			],
			followedArtists: [],
			// TODO: Playlists Data Iterator
			// TODO: Recommendations Data Iterator
			// TODO: Playback Data
		}
	},
	computed: {
		// Data Iterator Computed Methods //
		numberOfFollowedArtistPages () {
			return Math.ceil(this.followedArtists.length / this.followedArtistsPerPage)
		},
		followedArtistFilteredKeys () {
			return this.followedArtistKeys.filter(key => key !== 'Name')
		},
	},
	mounted(){
		this.checkTokens()
		this.checkSpotifyLogin()
		this.getFollowedArtists()
	},
	methods: {
		// Data Iterator Methods //
		nextFollowedArtistPage () {
			if (this.followedArtistPage + 1 <= this.numberOfFollowedArtistPages) this.followedArtistPage += 1
		},
		formerFollowedArtistPage () {
			if (this.followedArtistPage - 1 >= 1) this.followedArtistPage -= 1
		},
		updateFollowedArtistsPerPage (number) {
			this.followedArtistsPerPage = number
		},
		// Spotify Token Methods //
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
		},
		removeSpotifyToken(){
			// DEV FUNCTION //
			// Remove access token
			localStorage.setItem("spotify_access_token", "INVALID_TOKEN")
			// Push "/spotify" to URL (to remove tokens if present)
			router.push("/spotify")
			// Go to current location (to refresh/reload page)
			router.go(0)
		},
		refreshSpotifyToken(){
			let refresh_token = localStorage.getItem('spotify_refresh_token')
			axios
				.get(`http://localhost:3000/spotify/refresh_token?refresh_token=${refresh_token}`,{
					headers: {
						"Content-Type" : 'application/x-www-form-urlencoded'
					}
				})
				.then(response => {
					console.log("getData() response: ", response.data)
					localStorage.setItem("spotify_access_token", response.data.access_token)
					this.spotifyErrors = ""
					this.getFollowedArtists()
					}
				)
				.catch(error => {
					console.log("getData() error caught: ", error)
					this.spotifyErrors = error
				})
		},
		getFollowedArtists(){
			if(this.spotifyLoggedIn){
				let token = localStorage.getItem('spotify_access_token')
				let baseURL = 'https://api.spotify.com/v1'
				axios
					.get(`${baseURL}/me/following?type=artist&limit=50`,
						{
							headers: {
								"Authorization" : `Bearer ${token}`
							}
						})
					.then(response => {
						console.log("getData() response: ", response.data)
						this.followedArtists = response.data.artists.items
						}
					)
					.catch(error => {
						console.log("getData() error caught: ", error)
						this.spotifyErrors = error
					})
			}
		},
	}
}
</script>

<style>

</style>