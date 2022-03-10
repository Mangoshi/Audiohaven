<template>
	<v-container :style="cssProps" fluid>

		<v-container v-if="sampleTableEnabled">
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
				<v-btn href="http://localhost:3000/spotify/login/">
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
		<div v-if="spotifyStatusMessage">
			<h4 style="color: deeppink; background-color: #333; font-family: 'Courier New', monospace;">{{
					spotifyStatusMessage
				}}</h4>
			<v-btn v-on:click="refreshSpotifyToken()">
				<v-icon>mdi-spotify</v-icon> Refresh Token
			</v-btn>
		</div>

		<!-- Loader (shows when API request is loading) -->
		<div v-if="isLoading">
			<div class="lds-heart"><div></div></div>
			<div>Loading... ({{refCount}})</div>
		</div>

		<v-row v-if="spotifyLoggedIn && spotifyStatusMessage!=='Request failed with status code 401'">
			<v-col cols="0" lg="2" md="1"></v-col>
			<v-col cols="12" lg="8" md="10">
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
					<v-container v-if="selectedModule === 'followedArtists'" fluid>
						<!--	If there is a token && no Spotify errors  -->
						<div v-if="spotifyLoggedIn && !spotifyStatusMessage">
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
									class="pa-4"
									hide-default-footer
								>
									<template v-slot:header>
										<v-toolbar
											class="mb-1"
											color="accent"
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
														color="accent"
														depressed
														large
													>
														<v-icon>mdi-arrow-up</v-icon>
													</v-btn>
													<v-btn
														:value="true"
														color="accent"
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
					<v-container v-if="selectedModule === 'userPlaylists'" fluid>
						<!--	If there is a token && no Spotify errors  -->
						<v-card>
							<v-card-title>
								<v-btn
									v-if="playlistLayer !== 0"
									class="mr-2"
									icon
									@click="decrementPlaylistLayer()"
								><v-icon>mdi-arrow-left</v-icon>
								</v-btn>
								Playlists
								<v-text-field
									v-model="playlistTable[playlistLayer].Search"
									append-icon="mdi-magnify"
									class="pl-8 pr-8 mt-n3"
									clearable
									color="purple"
									hide-details
									label="Search"
									single-line
								></v-text-field>
								<v-switch
									v-model="playlistTable[playlistLayer].singleExpand"
									class="mb-n3"
									color="purple"
									label="Single expand"
								></v-switch>
							</v-card-title>
							<!-- Table LOADING -->
							<v-data-table
								v-if="isLoading"
								:item-key="playlistTable[playlistLayer].Headers[0].value"
								loading
								loading-text="Loading playlists... Please wait"
							></v-data-table>
							<!-- Table LOADED -->
							<v-data-table
								v-else
								:expanded.sync="playlistTable[playlistLayer].Expanded"
								:headers="playlistTable[playlistLayer].Headers"
								:item-key="playlistTable[playlistLayer].Headers[0].value"
								:items="playlistTable[playlistLayer].Items"
								:search="playlistTable[playlistLayer].Search"
								:single-expand="playlistTable[playlistLayer].singleExpand"
								:sort-by="playlistTable[playlistLayer].Sort.toLowerCase()"
								:sort-desc="playlistTable[playlistLayer].SortDesc"
								:v-model="playlistTable[playlistLayer].Selected"
								checkbox-color="purple"
								expand-icon="mdi-music"
								no-data-text="No data! Are you signed in to Spotify?"
								no-results-text="No results :C"
								show-expand
								show-select
							>

								<!--				Layer One Customization				-->
								<!--	Customizing items under the name column 	-->
								<template v-if="playlistLayer === 0" v-slot:item.name="{ item }">
									<v-btn class="text-capitalize" text @click="getUserPlaylists(item)">
										{{ item.name }}
									</v-btn>
								</template>
								<!--	Custom item colours using chips, set with v-slots	-->
								<template v-if="playlistLayer === 0" v-slot:item.tracks.total="{ item }">
									<v-chip :color="colorizeTableTracks(item.tracks.total)" dark>
										{{ item.tracks.total }}
									</v-chip>
								</template>
								<template v-if="playlistLayer === 0" v-slot:item.collaborative="{ item }">
									<v-chip :color="colorizeTableBooleans(item.collaborative)" dark>
										{{ item.collaborative }}
									</v-chip>
								</template>
								<template v-if="playlistLayer === 0" v-slot:item.public="{ item }">
									<v-chip :color="colorizeTableBooleans(item.public)" dark>
										{{ item.public }}
									</v-chip>
								</template>
								<!-- Making delete buttons under delete column -->
								<template v-if="playlistLayer === 0" v-slot:item.delete="{ item }">
									<!-- Delete button -->
									<v-btn
										color="red"
										icon
										@click="unfollowSpotifyPlaylist(item)"
									>
										<!--	The button uses this icon	-->
										<v-icon>mdi-delete</v-icon>
									</v-btn>
								</template>

								<!--				Layer Two Customization				-->
								<!--	Customizing items under the title column 	-->
								<template v-if="playlistLayer === 1" v-slot:item.track.name="{ item }">
									<!--	Play button for track 	-->
									<!--	TODO: Implement pause/play functionality? -->
									<!--  ( May require hacky code without Spotify Premium.. ) -->
									<v-btn icon @click="queueSpotifyTrack(item)">
										<v-icon>mdi-playlist-plus</v-icon>
									</v-btn>
									<!--	Link to track 	-->
									<a
										:href="item.track.external_urls.spotify"
										class="black--text text-decoration-none"
										target="_blank"
									>
										<v-btn class="text-capitalize" text>
											{{ item.track.name }}
										</v-btn>
									</a>
								</template>
								<!--	Customizing items under the artist column 	-->
								<template v-if="playlistLayer === 1" v-slot:item.track.artists[0].name="{ item }">
									<a
										:href="item.track.artists[0].external_urls.spotify"
										class="black--text text-decoration-none"
										target="_blank"
									>
										<v-btn class="text-capitalize" text>
											{{ item.track.artists[0].name }}
										</v-btn>
									</a>
								</template>
								<!--	Customizing items under the added column 	-->
								<template v-if="playlistLayer === 1" v-slot:item.added_at="{ item }">
									{{ dateParser(item.added_at) }}
								</template>
								<!-- Making remove buttons under remove column -->
								<template v-if="playlistLayer === 1" v-slot:item.remove="{ item }">
									<v-btn
										color="red"
										icon
										@click="removeSpotifyPlaylistTrack(item, currentSpotifyPlaylist)"
									>
										<v-icon>mdi-delete</v-icon>
									</v-btn>
								</template>

								<!--  Data Table: Expanded Rows  -->
								<!--  Layer One  -->
								<template v-slot:expanded-item="{ headers, item }" v-slot:top>
									<td :colspan="headers.length">
										<div v-if="playlistLayer === 0">
											<v-row v-if="spotifyEmbeds">
												<!-- To-be Spotify embed -->
												<iframe :src="`${item.uri}`" allowtransparency="true" frameborder="0" height="80" width="500"></iframe>
											</v-row>
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
										</div>
										<!--  Layer Two  -->
										<div v-else>
											<v-row v-if="spotifyEmbeds">
												<!-- To-be Spotify embed -->
												<iframe :src="`${item.track.uri}`" allowtransparency="true" frameborder="0" height="80" width="500"></iframe>
											</v-row>
											<v-row>
												<v-col v-if="item.track.album.images[0].url" cols="4">
													<a :href="item.track.preview_url" target="_blank">
														<v-img
															:src="item.track.album.images[0].url"
															aspect-ratio="1"
															class="ma-5"
															width="350"
														></v-img>
													</a>
													<vuetify-audio v-if="item.track.preview_url" :ended="audioFinish" :file="item.track.preview_url" color="accent"></vuetify-audio>
													<small v-else>Sorry, no preview available.</small>
												</v-col>
												<v-col v-else>
													<a :href="item.track.preview_url" target="_blank">Link to playlist</a>
												</v-col>
												<v-col v-if="item.track.album.name" cols="6">
													<v-card class="ma-5">
														<v-card-text>
															<small>Album:</small> {{ item.track.album.name }}
															<br>
															<small>Artist:</small> {{ item.track.artists[0].name }}
															<br>
															<small>Track:</small> {{ item.track.name }}
														</v-card-text>
													</v-card>
												</v-col>
												<v-col cols="2"></v-col>
											</v-row>
										</div>
									</td>
								</template>

							</v-data-table>
						</v-card>
					</v-container>
					<!-- Recommendations Module	-->
					<v-container v-if="selectedModule === 'recommendationGenerator'" fluid>
						<v-autocomplete
							v-model="recommendationsForm.requiredParams.seed_artists"
							:items="followedArtists"
							color="accent"
							item-text="name"
							item-value="uri"
							label="Choose one of the artists you follow!"
						></v-autocomplete>
						<!-- Parameters selector -->
						<h5 align="left">Enabled parameters</h5>
						<v-row>
							<v-col
								v-for="slider in recommendationsForm.optionalParams.sliderParams"
								:key="slider.parameter"
								class="mr-2"
								cols="2">
								<v-checkbox
									v-model="slider.enabled"
									:label="slider.label"
									color="purple"
								></v-checkbox>
							</v-col>
						</v-row>
						<!-- Parameter controls -->
						<v-divider></v-divider>
						<v-row
							v-for="slider in recommendationsForm.optionalParams.sliderParams"
							:key="slider.parameter"
							class="mt-10"
						>
							<v-col v-if="slider.enabled" cols="10" md="8">
								<v-slider
									v-model="slider.value"
									:append-icon="slider.icon"
									:label="slider.label"
									:max="slider.max"
									:min="slider.min"
									:step="slider.step"
									thumb-color="accent"
									thumb-label="always"
									ticks="always"
									track-color="primary"
									track-fill-color="green"
								></v-slider>
							</v-col>
							<v-col v-if="slider.enabled" class="mt-n3" cols="2" md="4">
								<v-radio-group v-model="slider.type" row>
									<v-radio
										color="accent"
										label="Equal"
										value="target"
									></v-radio>
									<v-radio
										color="accent"
										label="Min"
										value="min"
									></v-radio>
									<v-radio
										color="accent"
										label="Max"
										value="max"
									></v-radio>
								</v-radio-group>
							</v-col>
						</v-row>
						<v-row>
							<v-spacer></v-spacer>
							<v-col cols="2" md="2">
								<v-btn block color="accent" @click="generateRecommendations(recommendationsForm)">
									Submit
								</v-btn>
							</v-col>
							<v-spacer></v-spacer>
						</v-row>
					</v-container>
				</v-card>
			</v-col>
			<v-col cols="0" lg="2" md="1"></v-col>
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
	components: {
		VuetifyAudio: () => import('vuetify-audio'),
	},
	data(){
		return{
			// Sample API Table Data //
			sampleTableEnabled: false,
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
			// Spotify Data //
			spotifyLoggedIn: false,
			spotifyStatusMessage: "",
			spotifyUserData: {},
			currentSpotifyPlaylist: null,
			// Disabling iframes for now
			spotifyEmbeds: false,
			// Module Data //
			selectedModule: "recommendationGenerator",
			modules: [
				{
					label: "Your Playlists",
					value: "userPlaylists"
				},
				{
					label: "Followed Artists",
					value: "followedArtists"
				},
				{
					label: "Recommendation Generator",
					value: "recommendationGenerator"
				},
			],
			// Followed Artists Data Iterator //
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
			// Playlist Data Table //
			playlistLayer: 0,
			playlistTable: [
				{
					// Playlists Table Data (Layer One) //
					// < Each item is a playlist > //
					Search: "",
					Sort: 'tracks.total',
					SortDesc: true,
					Headers: [
						{
							text: 'ID',
							value: 'id',
							align: ' d-none' // ' d-none' hides the column but keeps the search ability
						},
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
							text: 'Public',
							value: 'public'
						},
						{
							text: 'Collab',
							value: 'collaborative'
						},
						{
							text: 'Delete',
							value: 'delete',
							sortable: false
						},
					],
					Items: [],
					Selected: [],
					singleExpand: true,
					Expanded: [],
				},
				{
					// Playlists Table Data (Layer Two) //
					// < Each item is a track > //
					Search: "",
					Sort: 'added_at',
					SortDesc: true,
					Headers: [
						{
							text: 'ID',
							value: 'track.id',
							align: ' d-none'
						},
						{
							text: 'Title',
							value: 'track.name',
							align: 'start',
							width: 300
						},
						{
							text: 'Artist',
							value: 'track.artists[0].name',
						},
						{
							text: 'Added',
							value: 'added_at',
							align: 'right'
						},
						{
							text: 'Remove',
							value: 'remove',
							sortable: false
						},
					],
					Items: [],
					Selected: [],
					singleExpand: true,
					Expanded: [],
				}
			],
			// Recommendations Form Data
			recommendationsForm: {
				// Spotify docs: https://developer.spotify.com/documentation/web-api/reference/#/operations/get-recommendations
				// Max params: Hard ceiling on track attribute's value
				// Min params: Hard floor on track attribute's value
				// Target params: Returns tracks with attribute values nearest to target

				// REQUIRED PARAMS //
				requiredParams:
					{
						// Up to 5 seed values may be provided in any combination of seed_artists, seed_tracks and seed_genres
						// A comma separated list of Spotify IDs for seed artists
						seed_artists: "",
						// A comma separated list of any genres in the set of available genre seeds
						seed_genres: "",
						// A comma separated list of Spotify IDs for a seed track
						seed_tracks: ""
					},

				// OPTIONAL PARAMS //
				optionalParams:
					{
						// Amount of tracks returned (Default 20, Max 100)
						limit: 20,
						// An ISO 3166-1 alpha-2 country code
						market: "",
						// SLIDER PARAMETERS //
						sliderParams: [
							{
								enabled: false,
								parameter: "acousticness",
								label: "Acousticness",
								type: "target",
								value: null,
								icon: "mdi-guitar-acoustic",
								min: 0,
								max: 1,
								step: 0.1,
							},
							{
								enabled: false,
								parameter: "danceability",
								label: "Danceability",
								type: "target",
								value: null,
								icon: "mdi-dance-pole",
								min: 0,
								max: 1,
								step: 0.1
							},
						],
						// To-implement after testing above:
						// duration_ms: false,
						// energy: false,
						// instrumentalness: false,
						// key: false,
						// liveness: false,
						// loudness: false,
						// mode: false,
						// popularity: false,
						// speechiness: false,
						// tempo: false,
						// time_signature: false,
						// valence: false,
					},

				// The following accept values between 0 -> 1 (eg. 0.35)
				// How acoustic the tracks are
				max_acousticness: null,
				min_acousticness: null,
				target_acousticness: null,
				// How "danceable" the tracks are
				max_danceability: null,
				min_danceability: null,
				target_danceability: null,
				// How energetic the tracks are
				max_energy: null,
				min_energy: null,
				target_energy: null,
				// How instrumental the tracks are
				max_instrumentalness: null,
				min_instrumentalness: null,
				target_instrumentalness: null,
				// How live the tracks sound
				max_liveness: null,
				min_liveness: null,
				target_liveness: null,
				// The mode(?) of the tracks
				max_mode: null,
				min_mode: null,
				target_mode: null,
				// How much speech is in the tracks
				max_speechiness: null,
				min_speechiness: null,
				target_speechiness: null,
				// How "happy" the tracks are
				max_valence: null,
				min_valence: null,
				target_valence: null,
				// This accepts values between 0 -> 11
				// The key of the tracks
				// 0:C, 1:C#, 2:D, 3:D#, 4:E, 5:F
				// 6:F#, 7:G, 8:G#, 9:A, 10:A#, 11:B
				max_key: null,
				min_key: null,
				target_key: null,
				// This accepts values between 0 -> 100
				max_popularity: null,
				min_popularity: null,
				target_popularity: null,
				// Durations in milliseconds
				max_duration_ms: null,
				min_duration_ms: null,
				target_duration_ms: null,
				// Tempos (BPMs)
				max_tempo: null,
				min_tempo: null,
				target_tempo: null,
				// Time Signature
				max_time_signature: null,
				min_time_signature: null,
				target_time_signature: null,
			},
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
		// making CSS color variables out of vuetify.js custom themes
		cssProps() {
			// create themeColors object
			var themeColors = {}
			// if dark mode is off,
			if (this.darkMode === false) {
				// for each color key in themes.light, add to themeColors, adding '--v-' to the start of the key
				// then assign this key the value of the color
				Object.keys(this.$vuetify.theme.themes.light).forEach((color) => {
					themeColors[`--v-${color}`] = this.$vuetify.theme.themes.light[color]
				})
				// else if dark mode is on
			} else {
				// fill themeColors with the colors from themes.dark instead
				Object.keys(this.$vuetify.theme.themes.dark).forEach((color) => {
					themeColors[`--v-${color}`] = this.$vuetify.theme.themes.dark[color]
				})
			}
			// return themeColors object
			return themeColors
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
			if (tracks > 250) return 'purple'
			else if (tracks > 100) return 'purple darken-2'
			else if (tracks <= 100 && tracks > 0) return 'purple darken-4'
			else return '#333'
		},
		colorizeTableBooleans(boolean) {
			if (boolean) return 'purple darken-4'
			else return '#333'
		},
		dateParser(date){
			const parsedDate = new Date(date)
			return(`${parsedDate.getDate()}-${parsedDate.getMonth() +1}-${parsedDate.getFullYear()}`)
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
				// Get user's profile data
				this.getUserData()
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
						this.spotifyStatusMessage = ""
						// Re-run anything that would have failed with an expired token
						this.getFollowedArtists()
						this.getUserPlaylists()
					}
				)
				.catch(error => {
					console.log("refreshSpotifyToken() error caught: ", error)
					console.log("refreshSpotifyToken() error message: ", error.message)
					this.spotifyStatusMessage = error.message
				})
		},

		// Spotify API Requests //
		// Function for getting profile data from the user
		getUserData(){
			if(this.spotifyLoggedIn) {
				let token = localStorage.getItem('spotify_access_token')
				let baseURL = 'https://api.spotify.com/v1'
				axios
					.get(`${baseURL}/me/`,
						{
							headers: {
								"Authorization": `Bearer ${token}`
							}
						})
					.then(response => {
							console.log("getUserData() response: ", response.data)
							localStorage.setItem('spotify_user_id', response.data.id)
							this.spotifyUserData = response.data
						}
					)
					.catch(error => {
						console.log("getUserData() error caught: ", error)
						console.log("getUserData() error message: ", error.message)
						this.spotifyStatusMessage = error.message
					})
			}
		},
		// Function for getting user's followed artists
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
						this.spotifyStatusMessage = error.message
						// If error is a 401 (token has likely expired)
						if(error.message==="Request failed with status code 401"){
							// Run refreshSpotifyToken() to get new access token
							this.refreshSpotifyToken()
						}
					})
			}
		},
		// Function for getting user's saved playlists
		getUserPlaylists(selectedPlaylist) {
			let token = localStorage.getItem('spotify_access_token')
			let userID = localStorage.getItem('spotify_user_id')
			let baseURL = 'https://api.spotify.com/v1'
			if (this.spotifyLoggedIn){
				if(userID !== null && userID !== ""){
					// If no playlist was selected (ie we want list of playlists)
					if (!selectedPlaylist) {
						this.currentSpotifyPlaylist = null
						axios
							// GET request using user's ID
							.get(`${baseURL}/users/${userID}/playlists`,
								{
									headers: {
										"Authorization": `Bearer ${token}`
									}
								})
							.then(response => {
									// Log response
									console.log("getUserPlaylists() response: ", response.data)
									// Assign playlistTableItems to response.data.items (playlist array)
									this.playlistTable[0].Items = response.data.items
								}
							)
							.catch(error => {
								// Log error
								console.log("getUserPlaylists() error caught: ", error)
								console.log("getUserPlaylists() error message: ", error.message)
								// Assign spotifyError string to the value of error.message
								this.spotifyStatusMessage = error.message
								// If error is a 401 (token has likely expired)
								if (error.message === "Request failed with status code 401") {
									// Run refreshSpotifyToken() to get new access token
									this.refreshSpotifyToken()
								}
							})
					}
					// If a playlist was selected (ie we want list of tracks inside playlist)
					if(selectedPlaylist) {
						// console.log(`getUserPlaylists(${selectedPlaylist.id}): '${selectedPlaylist.name}' executed.`)
						this.currentSpotifyPlaylist = selectedPlaylist
						axios
							.get(`${baseURL}/playlists/${selectedPlaylist.id}/tracks`,
								{
									headers: {
										"Authorization" : `Bearer ${token}`
									}
								})
							.then(response => {
									console.log("response: ", response.data)
									// If we get a response, assign the second layer of playlistTable to it
									this.playlistTable[1].Items = response.data.items
									// Increment playlistLayer so the vuetify table changes too
									this.playlistLayer++
								}
							)
							.catch(error => {
								console.log("error caught: ", error)
								console.log("error message: ", error.message)
								this.spotifyStatusMessage = error.message
								if (error.message === "Request failed with status code 401") {
									// Run refreshSpotifyToken() to get new access token
									this.refreshSpotifyToken()
								}
							})
					}
				} else {
					this.spotifyStatusMessage = "No user ID found.. Refresh?"
					this.getUserData()
				}
			}
		},
		decrementPlaylistLayer() {
			this.playlistLayer = 0
			this.currentSpotifyPlaylist = null
		},
		queueSpotifyTrack(selected) {
			console.log(`queueSpotifyTrack(${selected.track.name})`)
			let token = localStorage.getItem('spotify_access_token')
			let baseURL = 'https://api.spotify.com/v1'
			axios
				.post(`${baseURL}/me/player/queue?uri=spotify:track:${selected.track.id}`,
					{},
					{
						headers: {
							"Authorization" : `Bearer ${token}`
						}
					})
				.then(response => {
						console.log("queueSpotifyTrack() SUCCESS! \n Response: ", response.data)
						this.spotifyStatusMessage = `Successfully added ${selected.track.name} to queue`
					}
				)
				.catch(error => {
					console.log("playSpotifyTrack() error caught: ", error.response, "\n Message: ", error.response.data.error.message)
					this.spotifyStatusMessage = `${error.response.data.error.message}...`
				})
		},
		unfollowSpotifyPlaylist(playlist){
			let indexOfPlaylist = this.playlistTable[0].Items.indexOf(playlist)
			if (confirm(`Are you sure you want to unfollow ${playlist.name}?`)) {
				// Delete it!
				console.log(`Playlist '${playlist.name}' unfollow confirmed.`);
				// Unfollow Playlist Request
				let token = localStorage.getItem('spotify_access_token')
				let baseURL = 'https://api.spotify.com/v1'
				axios
					.delete(`${baseURL}/playlists/${playlist.id}/followers`,
						{
							headers: {
								"Authorization" : `Bearer ${token}`
							}
						})
					.then(response => {
							console.log("unfollowSpotifyPlaylist() SUCCESS! \n Response: ", response.data)
							this.spotifyStatusMessage = `Successfully unfollowed ${playlist.name}`
							this.playlistTable[0].Items.splice(indexOfPlaylist, 1)
						}
					)
					.catch(error => {
						console.log("unfollowSpotifyPlaylist() error caught: ", error.response, "\n Message: ", error.response.data.error.message)
						this.spotifyStatusMessage = `${error.response.data.error.message}...`
					})
			} else {
				// Do nothing!
				console.log(`Playlist '${playlist.name}' unfollow cancelled.`);
			}
		},
		removeSpotifyPlaylistTrack(track, playlist){
			console.log("playlist: ", playlist, "\n", "track: ", track)
			let indexOfTrack = this.playlistTable[1].Items.indexOf(track)
			if (confirm(`Are you sure you want to remove ${track.track.name} from ${playlist.name}?`)) {
				// Delete it!
				console.log(`Track '${track.track.name}' removal confirmed.`);
				// Remove Track Request
				let token = localStorage.getItem('spotify_access_token')
				let baseURL = 'https://api.spotify.com/v1'
				axios
					.delete(`${baseURL}/playlists/${playlist.id}/tracks`,
						{
							headers: {
								"Authorization" : `Bearer ${token}`
							},
							data: {
								"tracks": [
									{"uri":`${track.track.uri}`},
								]
							}
						})
					.then(response => {
							console.log("removeSpotifyPlaylistTrack() SUCCESS! \n Response: ", response.data)
							this.spotifyStatusMessage = `Successfully removed ${track.track.name}`
							this.playlistTable[1].Items.splice(indexOfTrack, 1)
						}
					)
					.catch(error => {
						console.log("removeSpotifyPlaylistTrack() error caught: ", error.response, "\n Message: ", error.response.data.error.message)
						this.spotifyStatusMessage = `${error.response.data.error.message}...`
					})
			} else {
				// Do nothing!
				console.log(`Track '${track.name}' removal cancelled.`);
			}
		},
		// TODO: Multiple track removal
		// Function for generating recommendations
		generateRecommendations(formData){
			// let token = localStorage.getItem('spotify_access_token')
			// let baseURL = 'https://api.spotify.com/v1'
			let enabledSliders = formData.optionalParams.sliderParams.filter(slider => slider.enabled !== false)
			console.log(enabledSliders)
			console.log("Query Output:")
			console.log(`?limit=${formData.optionalParams.limit}`)
			console.log(`&seed_artists=${formData.requiredParams.seed_artists}`)
			enabledSliders.forEach(filter =>
				console.log(`&${filter.type}_${filter.parameter}=${filter.value}`)
			)
			// axios
			// 	.get(`${baseURL}/recommendations
			// 		?limit=${this.recommendationsForm.limit}
			//
			// 	`,
			// 		{
			// 			headers: {
			// 				"Authorization" : `Bearer ${token}`
			// 			}
			// 		})
			// 	.then(response => {
			// 			console.log("getFollowedArtists() response: ", response.data)
			// 			this.followedArtists = response.data.artists.items
			// 		}
			// 	)
			// 	.catch(error => {
			// 		console.log("getFollowedArtists() error caught: ", error)
			// 		// Assign spotifyError string to the value of error.message
			// 		this.spotifyStatusMessage = error.message
			// 		// If error is a 401 (token has likely expired)
			// 		if(error.message==="Request failed with status code 401"){
			// 			// Run refreshSpotifyToken() to get new access token
			// 			this.refreshSpotifyToken()
			// 		}
			// 	})
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
	background-color: var(--v-accent);
	animation: lds-heart 1.2s infinite cubic-bezier(0.215, 0.61, 0.355, 1);
}
.lds-heart div:after,
.lds-heart div:before {
	content: " ";
	position: absolute;
	display: block;
	width: 32px;
	height: 32px;
	background-color: var(--v-accent);
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