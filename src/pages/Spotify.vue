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

		<!-- Spotify Errors & Refresh Token Button -->
		<div v-if="spotifyError">
			<h4 style="color: deeppink; background-color: #333; font-family: 'Courier New', monospace;">{{ spotifyError }}</h4>
			<v-btn v-on:click="refreshSpotifyToken()">
				<v-icon>mdi-spotify</v-icon> Refresh Token
			</v-btn>
		</div>

		<!-- Loader (shows when API request is loading) -->
		<div v-if="isLoading">
			<div class="lds-heart"><div></div></div>
			<div>Loading... ({{refCount}})</div>
		</div>

		<v-row>
			<v-col cols="0" md="1" lg="2"></v-col>
			<v-col cols="12" md="10" lg="8">
				<!-- Module Container -->
				<v-card>
					<!-- Module Selector -->
					<v-container>
						<v-select
							v-model="selectedModule"
							:items="modules"
							item-text="label"
							item-value="value"
							label="Module Selector"
						>
						</v-select>
					</v-container>

					<!--	Followed Artists Data Iterator	-->
					<v-container fluid v-if="selectedModule === 'followedArtists'">
						<!--	If there is a token && no Spotify errors  -->
						<div v-if="spotifyLoggedIn && !spotifyError">
							<v-card>
								<v-card-title>
									Followed Artists
								</v-card-title>
								<v-data-iterator
									:items="followedArtists"
									:items-per-page.sync="followedArtistsPerPage"
									:page.sync="followedArtistPage"
									:search="followedArtistSearch"
									:sort-by="followedArtistSortBy.toLowerCase()"
									:sort-desc="followedArtistSortDesc"
									hide-default-footer
									class="pa-4"
								>
									<template v-slot:header>
										<v-toolbar
											class="mb-1"
											color="purple darken-3"
											dark
										>
											<v-text-field
												v-model="followedArtistSearch"
												clearable
												flat
												hide-details
												label="Search"
												prepend-inner-icon="mdi-magnify"
												solo-inverted
											></v-text-field>
											<template v-if="$vuetify.breakpoint.mdAndUp">
												<v-spacer></v-spacer>
												<v-select
													v-model="followedArtistSortBy"
													:items="followedArtistKeys"
													flat
													hide-details
													label="Sort by"
													prepend-inner-icon="mdi-magnify"
													solo-inverted
												></v-select>
												<v-spacer></v-spacer>
												<v-btn-toggle
													v-model="followedArtistSortDesc"
													mandatory
												>
													<v-btn
														:value="false"
														color="purple"
														depressed
														large
													>
														<v-icon>mdi-arrow-up</v-icon>
													</v-btn>
													<v-btn
														:value="true"
														color="purple"
														depressed
														large
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
												lg="3"
												md="4"
												sm="6"
											>
												<v-card>
													<v-card-title class="subheading font-weight-bold">
														{{ followedArtist.name }}
													</v-card-title>
													<!-- Artist Artwork (Links to artist page on Spotify) -->
													<a :href="followedArtist.external_urls.spotify" target="_blank">
														<v-img
															:aspect-ratio="1"
															:src="followedArtist.images[0].url"
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
																:class="{ 'purple--text': followedArtistSortBy === key }"
																class="align-end"
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
											align="center"
											class="mt-2 ml-2"
											justify="center"
										>
											<span class="grey--text">Artists per page</span>
											<v-menu offset-y>
												<template v-slot:activator="{ on, attrs }">
													<v-btn
														class="ml-2"
														color="primary"
														dark
														text
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

											<span class="mr-4 grey--text">
											Page {{ followedArtistPage }} of {{ numberOfFollowedArtistPages }}
										</span>
											<v-btn
												class="mr-1"
												color="purple darken-2"
												dark
												fab
												@click="formerFollowedArtistPage"
											>
												<v-icon>mdi-chevron-left</v-icon>
											</v-btn>
											<v-btn
												class="ml-1 mr-2"
												color="purple darken-2"
												dark
												fab
												@click="nextFollowedArtistPage"
											>
												<v-icon>mdi-chevron-right</v-icon>
											</v-btn>
										</v-row>
									</template>
								</v-data-iterator>
							</v-card>
						</div>
					</v-container>

					<!--	My Playlists Module	-->
					<v-container fluid v-if="selectedModule === 'userPlaylists'">
						<!--	If there is a token && no Spotify errors  -->
						<div v-if="spotifyLoggedIn && !spotifyError">
							<v-card>
								<v-card-title>
									Playlists
									<v-spacer></v-spacer>
									<v-text-field
										v-model="playlistTableSearch"
										append-icon="mdi-magnify"
										hide-details
										label="Search"
										single-line
									></v-text-field>
								</v-card-title>
								<!-- Table LOADING -->
								<v-data-table
									v-if="isLoading"
									item-key="name"
									loading
									loading-text="Loading playlists... Please wait"
									class="pa-4"
								></v-data-table>
								<!-- Table LOADED -->
								<v-data-table
									v-else
									v-model="playlistTableSelected"
									:headers="playlistTableHeaders"
									:items="playlistTableItems"
									:search="playlistTableSearch"
									:sort-by="playlistTableSort.toLowerCase()"
									:sort-desc="playlistTableSortDesc"
									checkbox-color="purple"
									dense
									expand-icon="mdi-music"
									item-key="name"
									no-data-text="No data! Are you signed in to Spotify?"
									no-results-text="No playlists here :C"
									show-expand
									show-select
									single-expand
									single-select
								>

									<!--	Custom item colours using chips, set with item v-slots	-->
									<template v-slot:item.tracks.total="{ item }">
										<v-chip
											:color="colorizeTableTracks(item.tracks.total)"
											dark
										>
											{{ item.tracks.total }}
										</v-chip>
									</template>
									<template v-slot:item.collaborative="{ item }">
										<v-chip
											:color="colorizeTableBooleans(item.collaborative)"
											dark
										>
											{{ item.collaborative }}
										</v-chip>
									</template>
									<template v-slot:item.public="{ item }">
										<v-chip
											:color="colorizeTableBooleans(item.public)"
											dark
										>
											{{ item.public }}
										</v-chip>
									</template>

									<!--  Expanded row  -->
									<template v-slot:expanded-item="{ headers, item }" v-slot:top>
										<td :colspan="headers.length">
											<v-row>
												<v-col v-if="item.images[0]" cols="4">
													<a :href="item.external_urls.spotify" target="_blank">
														<v-img
															:src="item.images[0].url"
															aspect-ratio="1"
															class="ma-5"
															width="350"
														></v-img>
													</a>
												</v-col>
												<v-col v-else>
													<a :href="item.external_urls.spotify" target="_blank">Link to playlist</a>
												</v-col>
												<v-col v-if="item.description" cols="6">
													<v-card class="ma-5">
														<v-card-text>
															{{ item.description }}
														</v-card-text>
													</v-card>
												</v-col>
												<v-col cols="2"></v-col>
											</v-row>
										</td>
									</template>
								</v-data-table>
							</v-card>
						</div>
					</v-container>
				</v-card>
			</v-col>
			<v-col cols="0" md="1" lg="2"></v-col>
		</v-row>
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
			spotifyError: "",
			// Module Data
			selectedModule: "userPlaylists",
			modules: [
				{
					label: "Your Playlists",
					value: "userPlaylists"
				},
				{
					label: "Followed Artists",
					value: "followedArtists"
				},
			],
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
			// Playlists Table Data
			playlistTableSearch: "",
			playlistTableSort: 'tracks.total',
			playlistTableSortDesc: true,
			playlistTableHeaders: [
				{
					text: 'Name',
					value: 'name',
					align: 'start',
					width: 400
				},
				{
					text: 'Tracks',
					value: 'tracks.total'
				},
				{
					text: 'Collab',
					value: 'collaborative'
				},
				{
					text: 'Public',
					value: 'public'
				},
				// {
				// 	text: 'View',
				// 	sortable: false,
				// 	value: 'id'
				// },
			],
			playlistTableItems: [],
			playlistTableSelected: [],
			// TODO: Recommendations Data Iterator
			// TODO: Playback Data
			refCount: 0,
			isLoading: false
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
		this.getUserPlaylists()
	},
	created() {
		// When an axios request is made, intercept it and:
		axios.interceptors.request.use((config) => {
			// assign setLoading to true
			this.setLoading(true);
			// return request config
			return config;
			// Otherwise:
		}, (error) => {
			// assign setLoading to false
			this.setLoading(false);
			// return a Promise Object with given reason
			return Promise.reject(error);
		});

		// When an axios response is received, intercept it and setLoading to false
		axios.interceptors.response.use((response) => {
			this.setLoading(false);
			return response;
		}, (error) => {
			this.setLoading(false);
			return Promise.reject(error);
		});
	},
	methods: {
		// Loading status method
		setLoading(isLoading) {
			// if loading
			if (isLoading) {
				// increment refCount
				this.refCount++;
				// assign isLoading to true
				this.isLoading = true;
				// else if refCount is higher than 1
			} else if (this.refCount > 0) {
				// decrement refCount
				this.refCount--;
				// assign isLoading to true/false depending on if more than 0 or not
				this.isLoading = (this.refCount > 0);
			}
		},

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

		// Data Table Methods //
		colorizeTableTracks(tracks) {
			if (tracks > 250) return 'red'
			else if (tracks > 100) return 'orange'
			else if (tracks <= 100 && tracks > 0) return 'green'
			else return 'black'
		},
		colorizeTableBooleans(boolean) {
			if (boolean) return 'green'
			else return 'red'
		},

		// Spotify Token Management //
		checkTokens(){
			// If there is both an access & refresh token in the URL
			if(this.$route.query.access_token && this.$route.query.refresh_token) {
				// Assign tokens as variables
				let access_token = this.$route.query.access_token
				let refresh_token = this.$route.query.refresh_token
				// Log tokens
				console.log("Tokens received through redirect URL:")
				console.log("Access Token", access_token)
				console.log("Refresh Token", refresh_token)
				// Store tokens in localStorage
				localStorage.setItem("spotify_access_token", access_token)
				localStorage.setItem("spotify_refresh_token", refresh_token)
			} else {
				// Otherwise, log the fact there are no tokens in the URL
				// console.log("No access/refresh token in URL!")
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
						// Log response
						console.log("refreshSpotifyToken() response: ", response.data)
						// Assign local storage access token to new access token
						localStorage.setItem("spotify_access_token", response.data.access_token)
						// Clear spotifyError message
						this.spotifyError = ""
						// Re-run anything that would have failed with an expired token
						this.getFollowedArtists()
						this.getUserPlaylists()
					}
				)
				.catch(error => {
					console.log("refreshSpotifyToken() error caught: ", error)
					console.log("refreshSpotifyToken() error message: ", error.message)
					this.spotifyError = error.message
				})
		},

		// Spotify API Requests //
		getFollowedArtists(){
			// If user is logged-in
			if(this.spotifyLoggedIn){
				let token = localStorage.getItem('spotify_access_token')
				let baseURL = 'https://api.spotify.com/v1'
				axios
					// GET request for followed artists, with the maximum limit of 50 set
					.get(`${baseURL}/me/following?type=artist&limit=50`,
						{
							headers: {
								"Authorization" : `Bearer ${token}`
							}
						})
					.then(response => {
							// Log response
							console.log("getFollowedArtists() response: ", response.data)
							// Assign followedArtists to response.artists.items (followed artist array)
							this.followedArtists = response.data.artists.items
						}
					)
					.catch(error => {
						// Log errors
						console.log("getFollowedArtists() error caught: ", error)
						console.log("getFollowedArtists() error message: ", error.message)
						// Assign spotifyError string to the value of error.message
						this.spotifyError = error.message
						// If error is a 401 (token has likely expired)
						if(error.message==="Request failed with status code 401"){
							// Run refreshSpotifyToken() to get new access token
							this.refreshSpotifyToken()
						}
					})
			}
		},
		getUserPlaylists(){
			// If user is logged-in
			if(this.spotifyLoggedIn){
				let token = localStorage.getItem('spotify_access_token')
				let baseURL = 'https://api.spotify.com/v1'
				// TODO: Save User's ID to localStorage for use here!
				let userID = 1174214454
				axios
					// GET request using user's ID
					.get(`${baseURL}/users/${userID}/playlists`,
						{
							headers: {
								"Authorization" : `Bearer ${token}`
							}
						})
					.then(response => {
							// Log response
							console.log("getUserPlaylists() response: ", response.data)
							// Assign playlistTableItems to response.data.items (playlist array)
							this.playlistTableItems = response.data.items
						}
					)
					.catch(error => {
						// Log error
						console.log("getUserPlaylists() error caught: ", error)
						console.log("getUserPlaylists() error message: ", error.message)
						// Assign spotifyError string to the value of error.message
						this.spotifyError = error.message
						// If error is a 401 (token has likely expired)
						if(error.message==="Request failed with status code 401"){
							// Run refreshSpotifyToken() to get new access token
							this.refreshSpotifyToken()
						}
					})
			}
		},
	}
}
</script>

<style>
/* https://loading.io/css/ heart CSS */
.lds-heart {
	display: inline-block;
	position: relative;
	width: 80px;
	height: 80px;
	transform: rotate(45deg);
	transform-origin: 40px 40px;
}
.lds-heart div {
	top: 32px;
	left: 32px;
	position: absolute;
	width: 32px;
	height: 32px;
	background: #fff;
	animation: lds-heart 1.2s infinite cubic-bezier(0.215, 0.61, 0.355, 1);
}
.lds-heart div:after,
.lds-heart div:before {
	content: " ";
	position: absolute;
	display: block;
	width: 32px;
	height: 32px;
	background: #fff;
}
.lds-heart div:before {
	left: -24px;
	border-radius: 50% 0 0 50%;
}
.lds-heart div:after {
	top: -24px;
	border-radius: 50% 50% 0 0;
}
@keyframes lds-heart {
	0% {
		transform: scale(0.95);
	}
	5% {
		transform: scale(1.1);
	}
	39% {
		transform: scale(0.85);
	}
	45% {
		transform: scale(1);
	}
	60% {
		transform: scale(0.95);
	}
	100% {
		transform: scale(0.9);
	}
}
</style>