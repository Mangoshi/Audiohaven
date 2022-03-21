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
				<!-- Spotify Logo -->
				<v-row justify="center" class="mt-10 mb-10">
					<v-img
						:src="spotifyLogo('text')"
						class="align-self-center"
						max-width="500px"
						transition="scale-transition"
					></v-img>
				</v-row>
				<v-btn :href="`${appBaseURL}/spotify/login`">
					<v-icon>mdi-spotify</v-icon> Log-in to Spotify
				</v-btn>
			</div>
		</v-container>

		<v-scale-transition>
			<v-card
				v-if="spotifyLoggedIn"
				class="mx-auto text-left"
				max-width="344"
				outlined
			>
				<v-list-item three-line>
					<v-list-item-content>
						<div class="text-overline mb-4">
							SPOTIFY PROFILE
						</div>
						<v-list-item-title class="text-h5 mb-1">
							{{ this.spotifyUserData.display_name }}
						</v-list-item-title>
						<v-list-item-subtitle>{{ this.spotifyUserData.email }}</v-list-item-subtitle>
					</v-list-item-content>

					<v-img
						max-height="80"
						max-width="80"
						color="grey"
						:src="userProfilePic()"
					></v-img>
				</v-list-item>

				<v-card-actions>
					<v-btn
						v-on:click="logoutSpotify()"
						class="mr-1"
						outlined
						rounded
						text
					>
						<v-icon>mdi-spotify</v-icon>
						Log Out
					</v-btn>
					<!--  DEV FUNCTION: Invalidate token for easy 401 error testing  -->
					<v-btn
						v-on:click="removeSpotifyToken()"
						class="ml-1"
						outlined
						rounded
						text
					>
						<v-icon>mdi-delete</v-icon>
						Remove token
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-scale-transition>

		<!-- Spotify Errors & Refresh Token Button -->
		<div v-if="spotifyStatusMessage">
			<h4 style="
				color: deeppink;
				background-color: #333;
				font-family: 'Courier New',
				monospace;
			">{{
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
							color="accent"
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
													<vuetify-audio v-if="item.track.preview_url" :file="item.track.preview_url" color="accent"></vuetify-audio>
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
						<v-divider></v-divider>
						<p class="unselectable mb-2 mt-2">Required Parameters
							<br>
							<small>Choose at least one!</small>
						</p>
						<v-divider></v-divider>
						<!-- Required fields -->
						<v-row class="mb-3">
							<!-- Artist seed type selector -->
							<v-col cols="0" md="3"></v-col>
							<v-col class="d-flex flex-row justify-center" cols="12" md="6">
								<!-- Radio group models artistSeedType from requiredParams -->
								<!-- Row boolean determined by computed method -->
								<v-radio-group
									v-model="recommendationsForm.requiredParams.artistSeedType"
									:row="recommenderRowBreakpoints"
								>
									<!-- Clicking either radio wipes seed_artists -->
									<!-- This is so we aren't keep something invisible selected -->
									<v-radio
										color="accent"
										label="Artist Search"
										off-icon="mdi-magnify"
										on-icon="mdi-magnify"
										value="artistSearch"
										@click="recommendationsForm.requiredParams.seed_artists = ''"
									>
										Artist Search
									</v-radio>
									<v-radio
										color="accent"
										label="Followed Artists"
										off-icon="mdi-heart"
										on-icon="mdi-heart"
										value="followedArtists"
										@click="recommendationsForm.requiredParams.seed_artists = ''"
									>
										Followed Artists
									</v-radio>
								</v-radio-group>
							</v-col>
							<v-col cols="0" md="3"></v-col>
							<!-- Followed Artists Mode -->
							<v-col
								v-if="recommendationsForm.requiredParams.artistSeedType === 'followedArtists'"
								cols="12"
								md="6"
							>
								<v-autocomplete
									v-model="recommendationsForm.requiredParams.seed_artists"
									:items="followedArtists"
									clearable
									color="accent"
									item-text="name"
									item-value="id"
									label="Choose a followed artist!"
									no-data-text="It seems you don't follow any artists... 🙁"
									outlined
								></v-autocomplete>
							</v-col>
							<!-- Artist Search Mode -->
							<v-col
								v-if="recommendationsForm.requiredParams.artistSeedType === 'artistSearch'"
								cols="12"
								md="6"
							>
								<v-row no-gutters>
									<v-text-field
										v-model="recommendationsForm.requiredParams.artistSearch"
										clearable
										color="accent"
										label="Search for an artist!"
										outlined
										@keydown.enter="recommenderArtistSearch()"
									></v-text-field>
									<v-btn
										:disabled="!recommendationsForm.requiredParams.artistSearch"
										color="accent"
										height="56"
										outlined
										x-small
										@click="recommenderArtistSearch()">
										<v-icon>mdi-magnify</v-icon>
									</v-btn>
								</v-row>
							</v-col>
							<v-col
								v-if="recommendationsForm.requiredParams.artistOptions.length !== 0
								&& recommendationsForm.requiredParams.artistSeedType==='artistSearch'"
								cols="12"
								md="6"
							>
								<v-autocomplete
									v-model="recommendationsForm.requiredParams.seed_artists"
									:items="recommendationsForm.requiredParams.artistOptions"
									clearable
									color="accent"
									item-text="name"
									item-value="id"
									label="Choose an artist!"
									no-data-text="Nothing here! Did you search? 🤔"
									outlined
								></v-autocomplete>
							</v-col>
							<v-col cols="12" md="6">
								<v-autocomplete
									v-model="recommendationsForm.requiredParams.seed_genres"
									:items="recommendationsForm.requiredParams.genreOptions"
									clearable
									color="accent"
									item-text="item"
									item-value="id"
									label="Choose a genre!"
									no-data-text="We couldn't find any genres... This is on us, sorry! 🙁"
									outlined
								>
									<!-- This v-slot determines how the items in the selection list look -->
									<template v-slot:item="{ item }">
										<span class="text-capitalize">
											{{ item }}
										</span>
									</template>
									<!-- This v-slot determines how the selected item looks -->
									<template v-slot:selection="{ item }">
										<span class="text-capitalize">
											{{ item }}
										</span>
									</template>
								</v-autocomplete>
							</v-col>
							<v-col
								cols="12"
								md="6"
							>
								<v-row no-gutters>
									<v-text-field
										v-model="recommendationsForm.requiredParams.trackSearch"
										clearable
										color="accent"
										label="Search for a track!"
										outlined
										@keydown.enter="recommenderTrackSearch()"
									></v-text-field>
									<v-btn
										:disabled="!recommendationsForm.requiredParams.trackSearch"
										color="accent"
										height="56"
										outlined
										x-small
										@click="recommenderTrackSearch()">
										<v-icon>mdi-magnify</v-icon>
									</v-btn>
								</v-row>

							</v-col>
							<v-col v-if="recommendationsForm.requiredParams.trackOptions.length !== 0" cols="12" md="6">
								<v-autocomplete
									v-model="recommendationsForm.requiredParams.seed_tracks"
									:items="recommendationsForm.requiredParams.trackOptions"
									clearable
									color="accent"
									item-text="item"
									item-value="id"
									label="Choose a track!"
									no-data-text="Nothing here! Did you search? 🤔"
									outlined
								>
									<!-- This v-slot determines how the items in the selection list look -->
									<template v-slot:item="{ item }">
										'{{ item.name }}' (by {{ item.artists[0].name }})
									</template>
									<!-- This v-slot determines how the selected item looks -->
									<template v-slot:selection="{ item }">
										'{{ item.name }}' (by {{ item.artists[0].name }})
									</template>
								</v-autocomplete>
							</v-col>
							<!-- Technically-not-required-as-it-has-a-default-value field -->
							<v-col cols="12" md="6">
								<v-select
									v-model="recommendationsForm.optionalParams.limitSelected"
									:items="recommendationsForm.optionalParams.limitOptions"
									color="accent"
									item-text="value"
									item-value="value"
									label="How many recommendations?"
									outlined
								></v-select>
							</v-col>
						</v-row>

						<!-- Slider choices -->
						<v-divider></v-divider>
						<p class="unselectable mb-2 mt-2">Optional Parameters</p>
						<v-simple-checkbox v-model="recommendationsForm.optionalParamsEnabled" off-icon="mdi-chevron-up" on-icon="mdi-chevron-down"></v-simple-checkbox>
						<v-divider></v-divider>

						<v-row v-if="recommendationsForm.optionalParamsEnabled" class="justify-center" dense>
							<v-col
								v-for="slider in recommendationsForm.optionalParams.sliderParams"
								:key="slider.param"
								:class="sliderCheckboxBreakpoints"
								cols="12" lg="2" md="3" sm="5">
								<!-- TODO: Maybe use v-autocomplete with multiple enabled? -->
								<!-- This would make the params take up a lot less space! -->
								<!-- Only issue may lie in adding the special slider(s) to it? -->
								<v-checkbox
									v-model="slider.enabled"
									:label="slider.label"
									:off-icon="slider.icon"
									:on-icon="slider.icon"
									class="text-capitalize"
									color="accent"
								></v-checkbox>
							</v-col>
							<!--	 Special slider choices		-->
							<v-col
								v-for="slider in recommendationsForm.optionalParams.specialSliders"
								:key="slider.param"
								:class="sliderCheckboxBreakpoints"
								cols="12" lg="2" md="3" sm="5">
								<v-checkbox
									v-model="slider.enabled"
									:label="slider.label"
									:off-icon="slider.icon"
									:on-icon="slider.icon"
									class="text-capitalize"
									color="accent"
								></v-checkbox>
							</v-col>
						</v-row>

						<!-- Parameter controls -->
						<v-divider class="mb-15"></v-divider>
						<v-row
							v-for="slider in recommendationsForm.optionalParams.sliderParams"
							:key="slider.param"
						>
							<v-col v-if="slider.enabled" class="mt-n4" cols="1">
								<v-radio-group v-model="slider.type" dense row>
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
							<v-col v-if="slider.enabled" cols="9">
								<v-slider
									v-model="slider.value"
									:append-icon="slider.icon"
									:max="slider.max"
									:min="slider.min"
									:step="slider.step"
									class="ml-6 mr-n3"
									thumb-color="accent"
									thumb-label="always"
									ticks="always"
									track-color="primary"
									track-fill-color="green"
								>
									<!-- For the key slider, we're using the keyDoctor() function
											so that the label shows 'C' to the user instead of '0', for example -->
									<template v-if="(slider.param)==='key'" v-slot:thumb-label="key">
										{{ keyDoctor(key.value) }}
									</template>

									<!-- For most of the other sliders, we calculate the percentage and return it on the label -->
									<template v-else-if="(slider.param)==='acousticness'" v-slot:thumb-label="acousticness">
										{{ percentageDoctor(acousticness.value, 1) }}%
									</template>

									<template v-else-if="(slider.param)==='danceability'" v-slot:thumb-label="danceability">
										{{ percentageDoctor(danceability.value, 1) }}%
									</template>

									<template v-else-if="(slider.param)==='energy'" v-slot:thumb-label="energy">
										{{ percentageDoctor(energy.value, 1) }}%
									</template>

									<template v-else-if="(slider.param)==='instrumentalness'" v-slot:thumb-label="instrumentalness">
										{{ percentageDoctor(instrumentalness.value, 1) }}%
									</template>

									<template v-else-if="(slider.param)==='liveness'" v-slot:thumb-label="liveness">
										{{ percentageDoctor(liveness.value, 1) }}%
									</template>

									<template v-else-if="(slider.param)==='loudness'" v-slot:thumb-label="loudness">
										{{ percentageDoctor(loudness.value, 1) }}%
									</template>

									<template v-else-if="(slider.param)==='speechiness'" v-slot:thumb-label="speechiness">
										{{ percentageDoctor(speechiness.value, 1) }}%
									</template>

									<template v-else-if="(slider.param)==='valence'" v-slot:thumb-label="valence">
										{{ percentageDoctor(valence.value, 1) }}%
									</template>

									<template v-else-if="(slider.param)==='popularity'" v-slot:thumb-label="popularity">
										{{ percentageDoctor(popularity.value, 100) }}%
									</template>

								</v-slider>
							</v-col>
							<v-col v-if="slider.enabled" class="mt-1" cols="2">
								<p class="text-left">{{ slider.label }}</p>
							</v-col>
						</v-row>
						<!-- Special parameter controls -->
						<v-row
							v-for="slider in recommendationsForm.optionalParams.specialSliders"
							:key="slider.param"
						>
							<v-col v-if="slider.enabled" class="mt-n4" cols="1">
								<v-radio-group v-model="slider.type" dense row>
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
							<v-col v-if="slider.enabled" cols="9">
								<v-slider
									v-model="slider.value"
									:append-icon="slider.icon"
									:max="slider.max"
									:min="slider.min"
									:step="slider.step"
									class="ml-6 mr-n3"
									thumb-color="accent"
									thumb-label="always"
									ticks="always"
									track-color="primary"
									track-fill-color="green"
								></v-slider>
							</v-col>
							<v-col v-if="slider.enabled" class="mt-1" cols="2">
								<p class="text-left">{{ slider.label }}</p>
							</v-col>
						</v-row>
						<!-- Recommender request button -->
						<v-row class="mt-n5 mb-3">
							<v-spacer></v-spacer>
							<!-- If there was an artist seed provided -->
							<v-col v-if="recommendationsRequired" cols="3" md="3">
								<v-btn block color="accent" @click="generateRecommendations(recommendationsForm)">
									Recommend!
								</v-btn>
							</v-col>
							<!-- If there wasn't an artist seed provided -->
							<v-col v-else cols="4" md="4">
								<v-btn block color="grey" disable>
									I need more data!
								</v-btn>
							</v-col>
							<v-spacer></v-spacer>
							<v-btn
								v-if="this.recommendationData.response.length!==0"
								color="green"
								@click="createRecommendationsPlaylist()"
							>
								Create Playlist
							</v-btn>
							<v-spacer v-if="this.recommendationData.response.length!==0"></v-spacer>
						</v-row>
						<v-row v-if="this.newPlaylistURL" class="justify-center mt-5 mb-5">
							<p>Your new playlist can be found <a :href="this.newPlaylistURL" class="newPlaylistURL" target="_blank">here!</a></p>
						</v-row>

						<!-- RECOMMENDATIONS -->
						<!-- TODO: Show extra details in row expansion? -->
						<!-- TODO: Allow user to add tracks to one of their playlists -->
						<!-- TODO: Add play button to each listing -->
						<v-row v-if="recommendationData.response[0]" class="justify-center">
							<v-data-table
								:headers="recommendationData.headers"
								:item-key="recommendationData.response.id"
								:items="recommendationData.response"
								calculate-widths
								no-data-text="No data!?"
								no-results-text="No results :C"
							>
								<template v-slot:item.album.images[0].url="{ item }">
									<a
										:href="item.album.external_urls.spotify"
										class="black--text text-decoration-none"
										target="_blank"
									>
										<v-img
											:src="item.album.images[0].url"
											aspect-ratio="1"
											class="ma-5"
											width="150"
										></v-img>
									</a>
									<!-- TODO: Get track preview working nicely (may need expand) -->
									<!--
									<vuetify-audio
										v-if="item.preview_url"
										:ended="audioFinish"
										:file="item.preview_url"
										color="accent"
										flat
									></vuetify-audio>
									-->
								</template>
								<template v-slot:item.name="{ item }">
									<a
										:href="item.external_urls.spotify"
										class="text--primary text-decoration-none"
										target="_blank"
									>
										{{ item.name }}
									</a>
								</template>
								<template v-slot:item.album.name="{ item }">
									<a
										:href="item.album.external_urls.spotify"
										class="text--primary text-decoration-none"
										target="_blank"
									>
										{{ item.album.name }}
									</a>
								</template>
								<template v-slot:item.artists[0].name="{ item }">
									<a
										:href="item.artists[0].external_urls.spotify"
										class="text--primary text-decoration-none"
										target="_blank"
									>
										{{ item.artists[0].name }}
									</a>
								</template>
							</v-data-table>
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
			// Environment Variables //
			appBaseURL: process.env.VUE_APP_BASE_URL,
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
			spotifyUserData: {
				images: [

				]
			},
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
						// Which search is enabled [options: 'artistSearch' and 'followedArtists']
						artistSeedType: "artistSearch",
						// Initialising string to be used for artist searches
						artistSearch: "",
						// Initialising array for artists returned by search on 'Search' endpoint
						artistOptions: [],
						// A comma separated list of any genres in the set of available genre seeds
						seed_genres: "",
						// Initialising array for available genres, retrieved from 'Get Available Genre Seeds' endpoint
						genreOptions: [],
						// A comma separated list of Spotify IDs for a seed track
						seed_tracks: "",
						// Initialising string to be used for track searches
						trackSearch: "",
						// Initialising array for tracks returned by search on 'Search' endpoint
						trackOptions: [],
					},

				// OPTIONAL PARAMS //
				optionalParamsEnabled: false,
				optionalParams:
					{
						// Amount of tracks returned (Default 20, Max 100)
						limitOptions: [
							{
								value: "1"
							},
							{
								value: "5"
							},
							{
								value: "25"
							},
							{
								value: "50"
							},
							{
								value: "100"
							},
						],
						limitSelected: "5",
						// An ISO 3166-1 alpha-2 country code
						market: "",
						// SLIDER PARAMETERS //
						sliderParams: [
							// The following accept values between 0 -> 1 (eg. 0.35) //
							{
								// How acoustic the tracks are
								enabled: false,
								label: "Acoustic",
								param: "acousticness",
								type: "target",
								value: null,
								icon: "mdi-guitar-acoustic",
								min: 0,
								max: 1,
								step: 0.1,
							},
							{
								// How "danceable" the tracks are
								enabled: false,
								label: "Danceable",
								param: "danceability",
								type: "target",
								value: null,
								icon: "mdi-human-female-dance",
								min: 0,
								max: 1,
								step: 0.1
							},
							{
								// How energetic the tracks are
								enabled: false,
								label: "Energy",
								param: "energy",
								type: "target",
								value: null,
								icon: "mdi-flash",
								min: 0,
								max: 1,
								step: 0.1
							},
							{
								// How instrumental the tracks are
								enabled: false,
								label: "Instrumental",
								param: "instrumentalness",
								type: "target",
								value: null,
								icon: "mdi-instrument-triangle",
								min: 0,
								max: 1,
								step: 0.1
							},
							{
								// How live the tracks sound
								enabled: false,
								label: "Live",
								param: "liveness",
								type: "target",
								value: null,
								icon: "mdi-theater",
								min: 0,
								max: 1,
								step: 0.1
							},
							{
								// The loudness of the tracks
								enabled: false,
								label: "Loud",
								param: "loudness",
								type: "target",
								value: null,
								icon: "mdi-volume-high",
								min: 0,
								max: 1,
								step: 0.1
							},
							{
								// How much speech is in the tracks
								enabled: false,
								label: "Speech",
								param: "speechiness",
								type: "target",
								value: null,
								icon: "mdi-account-voice",
								min: 0,
								max: 1,
								step: 0.1
							},
							{
								// How "happy" the tracks are
								enabled: false,
								label: "Uplifting",
								param: "valence",
								type: "target",
								value: null,
								icon: "mdi-emoticon-happy",
								min: 0,
								max: 1,
								step: 0.1
							},
							// Other range parameters //
							{
								// The key tracks are in (accepts values between 0 -> 11)
								enabled: false,
								label: "Key",
								param: "key",
								type: "target",
								value: null,
								icon: "mdi-piano",
								min: 0,
								max: 11,
								step: 1
							},
							{
								// Popularity of the tracks (accepts 0 -> 100)
								enabled: false,
								label: "Popularity",
								param: "popularity",
								type: "target",
								value: null,
								icon: "mdi-star-face",
								min: 0,
								max: 100,
								step: 10
							},
							{
								// Tempo of the tracks (accepts any integer)
								enabled: false,
								label: "BPM",
								param: "tempo",
								type: "target",
								value: null,
								icon: "mdi-metronome",
								min: 0,
								max: 200,
								step: 5
							},
						],
						// Special sliders
						specialSliders: [
							{
								// Duration slider
								enabled: false,
								label: "Duration",
								param: "max_duration_ms",
								type: "target",
								value: null,
								icon: "mdi-timer-outline",
								min: 0,
								max: 60,
								step: 5
							}
						],
					},
			},
			// Recommendations Response Data
			recommendationData: {
				headers: [
					{
						text: 'ID',
						value: 'id',
						align: ' d-none'
					},
					{
						text: 'Art',
						value: 'album.images[0].url',
						align: 'left',
						sortable: false
					},
					{
						text: 'Title',
						value: 'name',
						align: 'left'
					},
					{
						text: 'Album',
						value: 'album.name',
						align: 'left'
					},
					{
						text: 'Artist',
						value: 'artists[0].name',
						align: 'left'
					},
				],
				response: [],
				seeds: [],
				artistSeed: "",
				trackSeed: "",
				genreSeed: "",
			},
			newPlaylistURL: "",
			// TODO: Playback Data
			refCount: 0,
			isLoading: false
		}
	},
	watch: {
		// Watching selectedModule variable to only trigger necessary functions
		'selectedModule' : function(val){
			switch (val) {
				case "followedArtists" :
					console.log("Selected: Followed Artists Module");
					if(this.followedArtists.length===0){
						console.log("No followed artists found! Trying again..")
						this.getFollowedArtists();
					}
					break
				case "userPlaylists" :
					console.log("Selected: User Playlists Module");
					if(this.playlistTable[0].Items.length === 0){
						this.getUserPlaylists();
					}
					break
				case "recommendationGenerator" :
					console.log("Selected: Recommender Module");
					if(this.followedArtists.length===0){
						console.log("No followed artists found! Trying again..")
						this.getFollowedArtists();
					}
					break
			}
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
		recommendationsRequired(){
			// if all required fields are empty, return false
			// else if even one is filled, return true
			if
			(
				!this.recommendationsForm.requiredParams.seed_artists
				&&
				!this.recommendationsForm.requiredParams.seed_genres
				&&
				!this.recommendationsForm.requiredParams.seed_tracks
			)
			{ return false }
			else { return true }
		},
		sliderCheckboxBreakpoints(){
			// Switch case using current global breakpoint
			// If breakpoint is xs or sm, we want the content of the cols to be centered
			// Else if md/lg/xl, we want the contents to be left aligned
			switch (this.$vuetify.breakpoint.name) {
				case 'xs': return 'd-flex justify-center'
				case 'sm': return 'mr-1 d-flex justify-center'
				case 'md': return 'mr-1 d-flex justify-center'
				case 'lg': return 'mr-2 d-flex justify-center'
				case 'xl': return 'mr-2 d-flex justify-center'
			}
			// If none of the above, return nothing (required for a computed method)
			return ''
		},
		recommenderRowBreakpoints(){
			// If breakpoint is xs, put radio-group in column mode
			// Else, put radio-group in row mode
			switch (this.$vuetify.breakpoint.name) {
				case 'xs': return false
				case 'sm': return true
				case 'md': return true
				case 'lg': return true
				case 'xl': return true
			}
			return false
		}
	},
	mounted(){
		this.checkTokens()
		this.checkSpotifyLogin()
		this.getFollowedArtists()
		this.getUserPlaylists()
		this.getSpotifyGenres()
		this.getUserData()
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
		userProfilePic() {
			if(this.spotifyUserData.images.length === 0){
				return "https://placekitten.com/80/80"
			} else {
				return this.spotifyUserData.images[0].url
			}
		},
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

		// Logo Methods //
		spotifyLogo(type) {
			if (type === "text") {
				return require("@/assets/Spotify_logo_with_text.svg")
			} else {
				return require("@/assets/Spotify_logo_without_text.svg")
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
			localStorage.removeItem("spotify_user_id")
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
			let baseUrl = this.appBaseURL
			let refresh_token = localStorage.getItem('spotify_refresh_token')
			axios
				.get(`${baseUrl}/spotify/refresh_token?refresh_token=${refresh_token}`,{
					headers: {
						"Content-Type" : 'application/x-www-form-urlencoded'
					}
				})
				.then(response => {
						// Log response
						console.log("refreshSpotifyToken() response: ", response.data)
						// Assign local storage access token to new access token
						localStorage.setItem("spotify_access_token", response.data.access_token)
						// Clear spotifyStatusMessage message
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
			let token = localStorage.getItem('spotify_access_token')
			let spotifyBaseURL = 'https://api.spotify.com/v1'
			axios
				.get(`${spotifyBaseURL}/me/`,
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
		},
		// Function for getting user's followed artists
		getFollowedArtists(){
			if(this.selectedModule==="followedArtists" || this.selectedModule === "recommendationGenerator") {
				// If user is logged-in
				if (this.spotifyLoggedIn) {
					let token = localStorage.getItem('spotify_access_token')
					let spotifyBaseURL = 'https://api.spotify.com/v1'
					axios
						// GET request for followed artists, with the maximum limit of 50 set
						.get(`${spotifyBaseURL}/me/following?type=artist&limit=50`,
							{
								headers: {
									"Authorization": `Bearer ${token}`
								}
							})
						.then(response => {
								// Log response
								console.log("getFollowedArtists() response: ", response.data.artists.items)
								// Assign followedArtists to response.artists.items (followed artist array)
								this.followedArtists = response.data.artists.items
							}
						)
						.catch(error => {
							// Log errors
							console.log("getFollowedArtists() error caught: ", error)
							console.log("getFollowedArtists() error message: ", error.message)
							// Assign spotifyStatusMessage string to the value of error.message
							this.spotifyStatusMessage = error.message
							// If error is a 401 (token has likely expired)
							if (error.message === "Request failed with status code 401") {
								// Run refreshSpotifyToken() to get new access token
								this.refreshSpotifyToken()
							}
						})
				}
			}
		},
		// Function for getting user's saved playlists
		getUserPlaylists(selectedPlaylist) {
			if(this.selectedModule==="userPlaylists") {
				let token = localStorage.getItem('spotify_access_token')
				let userID = localStorage.getItem('spotify_user_id')
				let spotifyBaseURL = 'https://api.spotify.com/v1'
				if (this.spotifyLoggedIn) {
					if (userID !== null && userID !== "") {
						// If no playlist was selected (ie we want list of playlists)
						if (!selectedPlaylist) {
							this.currentSpotifyPlaylist = null
							axios
								// GET request using user's ID
								.get(`${spotifyBaseURL}/users/${userID}/playlists`,
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
									// Assign spotifyStatusMessage string to the value of error.message
									this.spotifyStatusMessage = error.message
									// If error is a 401 (token has likely expired)
									if (error.message === "Request failed with status code 401") {
										// Run refreshSpotifyToken() to get new access token
										this.refreshSpotifyToken()
									}
								})
						}
						// If a playlist was selected (ie we want list of tracks inside playlist)
						if (selectedPlaylist) {
							// console.log(`getUserPlaylists(${selectedPlaylist.id}): '${selectedPlaylist.name}' executed.`)
							this.currentSpotifyPlaylist = selectedPlaylist
							axios
								.get(`${spotifyBaseURL}/playlists/${selectedPlaylist.id}/tracks`,
									{
										headers: {
											"Authorization": `Bearer ${token}`
										}
									})
								.then(response => {
										console.log("getUserPlaylistTracks() response: ", response.data)
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
						this.refreshSpotifyToken()
					}
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
			let spotifyBaseURL = 'https://api.spotify.com/v1'
			axios
				.post(`${spotifyBaseURL}/me/player/queue?uri=spotify:track:${selected.track.id}`,
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
				let spotifyBaseURL = 'https://api.spotify.com/v1'
				axios
					.delete(`${spotifyBaseURL}/playlists/${playlist.id}/followers`,
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
				let spotifyBaseURL = 'https://api.spotify.com/v1'
				axios
					.delete(`${spotifyBaseURL}/playlists/${playlist.id}/tracks`,
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
		// Function for getting available genre seeds
		getSpotifyGenres(){
			// If user is logged-in
			if (this.spotifyLoggedIn) {
				let token = localStorage.getItem('spotify_access_token')
				let spotifyBaseURL = 'https://api.spotify.com/v1'
				axios
					// GET request for followed artists, with the maximum limit of 50 set
					.get(`${spotifyBaseURL}/recommendations/available-genre-seeds`,
						{
							headers: {
								"Authorization": `Bearer ${token}`
							}
						})
					.then(response => {
							// Log response
							console.log("getSpotifyGenres() response: ", response.data.genres)
							// Assign recommendationData.requiredParams.genreOptions to response data.genres (array)
							this.recommendationsForm.requiredParams.genreOptions = response.data.genres
						}
					)
					.catch(error => {
							// Log errors
							console.log("getSpotifyGenres() error caught: ", error)
							console.log("getSpotifyGenres() error message: ", error.message)
							// Assign spotifyStatusMessage string to the value of error message
							this.spotifyStatusMessage = error.response.data.error.message
							// If error is a 401 (token has likely expired)
							if (error.message === "Request failed with status code 401") {
								// Run refreshSpotifyToken() to get new access token
								this.refreshSpotifyToken()
							}
						}
					)
			}
		},
		// Function to search for tracks
		recommenderTrackSearch(){
			console.log("recommenderTrackSearch() executed")
			// If user is logged-in
			if (this.spotifyLoggedIn) {
				let token = localStorage.getItem('spotify_access_token')
				let spotifyBaseURL = 'https://api.spotify.com/v1'
				let searchQuery = this.recommendationsForm.requiredParams.trackSearch
				axios
					// GET request which searches for tracks, with the maximum limit of 50 set
					.get(`${spotifyBaseURL}/search?q=${searchQuery}&type=track&limit=50`,
						{
							headers: {
								"Authorization": `Bearer ${token}`
							}
						})
					.then(response => {
							// Log response
							console.log("recommenderTrackSearch() response: ", response.data.tracks.items)
							// Assign recommendationData.requiredParams.trackOptions to response data.tracks (array)
							this.recommendationsForm.requiredParams.trackOptions = response.data.tracks.items
						}
					)
					.catch(error => {
							// Log errors
							console.log("recommenderTrackSearch() error caught: ", error)
							console.log("recommenderTrackSearch() error message: ", error.message)
							// Assign spotifyStatusMessage string to the value of error message
							this.spotifyStatusMessage = error.response.data.error.message
							// If error is a 401 (token has likely expired)
							if (error.message === "Request failed with status code 401") {
								// Run refreshSpotifyToken() to get new access token
								this.refreshSpotifyToken()
							}
						}
					)
			}
		},
		// Function to search for artists
		recommenderArtistSearch(){
			console.log("recommenderArtistSearch() executed")
			// If user is logged-in
			if (this.spotifyLoggedIn) {
				let token = localStorage.getItem('spotify_access_token')
				let spotifyBaseURL = 'https://api.spotify.com/v1'
				let searchQuery = this.recommendationsForm.requiredParams.artistSearch
				axios
					// GET request which searches for artists, with the maximum limit of 50 set
					.get(`${spotifyBaseURL}/search?q=${searchQuery}&type=artist&limit=50`,
						{
							headers: {
								"Authorization": `Bearer ${token}`
							}
						})
					.then(response => {
							// Log response
							console.log("recommenderArtistSearch() response: ", response.data.artists.items)
							// Assign recommendationData.requiredParams.trackOptions to response data.tracks (array)
							this.recommendationsForm.requiredParams.artistOptions = response.data.artists.items
						}
					)
					.catch(error => {
							// Log errors
							console.log("recommenderArtistSearch() error caught: ", error)
							console.log("recommenderArtistSearch() error message: ", error.message)
							// Assign spotifyStatusMessage string to the value of error message
							this.spotifyStatusMessage = error.response.data.error.message
							// If error is a 401 (token has likely expired)
							if (error.message === "Request failed with status code 401") {
								// Run refreshSpotifyToken() to get new access token
								this.refreshSpotifyToken()
							}
						}
					)
			}
		},
		// Function for generating recommendations
		generateRecommendations(formData){
			if(this.selectedModule==="recommendationGenerator") {

				// filter sliderParameter array by enabled sliders only (inserts into enabledSliders array)
				let enabledSliders = formData.optionalParams.sliderParams.filter(slider => slider.enabled !== false)

				// lots of logging for testing purposes
				console.log("Enabled sliders: ", enabledSliders)
				// console.log("Query Output:")
				// console.log(`?limit=${formData.optionalParams.limitSelected}`)
				// console.log(`&seed_artists=${formData.requiredParams.seed_artists}`)
				// console.log(`&seed_genres=${formData.requiredParams.seed_genres}`)
				// enabledSliders.forEach(slider =>
				// 	console.log(`&${slider.type}_${slider.param}=${slider.value}`)
				// )

				// if required parameters are empty on arrival...
				if (!this.recommendationsRequired) {
					console.log("Required params not filled!")
					this.spotifyStatusMessage = "You must pick one of the required parameters before we can generate any recommendations!"
				} else {
					// else if required parameters were passed...
					console.log("Required params filled! Executing request...")
					let token = localStorage.getItem('spotify_access_token')
					let spotifyBaseURL = 'https://api.spotify.com/v1'

					// Required Params //

					// '?limit=x' starts off the recommendation URL queries (although it is optional)
					let limit = `?limit=${formData.optionalParams.limitSelected}`

					// '&market=x' specifies the target market for recommendations.
					// While technically optional, without this set, some tracks will be unplayable.
					let market = `&market=${this.spotifyUserData.country}`

					// Artist seed
					// initialising as blank
					let artist = ""
					// if the user provided something in the artist field...
					if(formData.requiredParams.seed_artists){
						// ...assign artist the value of '&seed_artists=<data>'
						artist = `&seed_artists=${formData.requiredParams.seed_artists}`
					}

					// Genre seed
					// initialising as blank
					let genre = ""
					// if the user provided something in the genre field...
					if(formData.requiredParams.seed_genres){
						// ...assign genre the value of '&seed_genres=<data>'
						genre = `&seed_genres=${formData.requiredParams.seed_genres}`
					}

					// Track seed
					// initialising as blank
					let track = ""
					// if the user provided something in the track field...
					if(formData.requiredParams.seed_tracks){
						// ...assign track the value of '&seed_tracks=<data>'
						track = `&seed_tracks=${formData.requiredParams.seed_tracks}`
					}

					// Optional Params //
					// initialising sliderQueries as a String
					let sliderQueries = ""
					// for each enabled slider, format as '&type_param=value'
					// then on each loop, auto-increment (concatenate)
					// this gives us our desired '&type_param=value&type_param=value...' chain
					enabledSliders.forEach(slider => (sliderQueries += `&${slider.type}_${slider.param}=${slider.value}`))
					// if duration slider is enabled, concatenate sliderQueries with milliseconds
					if (formData.optionalParams.specialSliders[0].enabled) {
						let durationSlider = formData.optionalParams.specialSliders[0]
						let type = durationSlider.type
						let value = this.timeDoctor(durationSlider.value)
						sliderQueries += `&${type}_duration_ms=${value}`
					}

					// // log sliderQueries for testing purposes
					// if (sliderQueries !== "") {
					// 	console.log(sliderQueries)
					// }

					// logging the URL to be used in the GET request
					console.log(`Built URL: ${spotifyBaseURL}/recommendations${limit}${market}${artist}${genre}${track}${sliderQueries}`)

					// The HTTP Request //
					// finally, make axios GET request using limit, artist, and sliderQueries variables
					axios
						.get(`${spotifyBaseURL}/recommendations${limit}${market}${artist}${track}${genre}${sliderQueries}`,
							{
								headers: {
									"Authorization": `Bearer ${token}`
								}
							})
						.then(response => {
								console.log("generateRecommendations() response: ", response.data)
								// assign recommendationData.response variable to response.tracks array
								this.recommendationData.response = response.data.tracks
								// assign recommendationData.seeds variable to response.seeds array
								this.recommendationData.seeds = response.data.seeds
								// get name of artist/track seeds if used
								response.data.seeds.forEach(seed => {
									if(seed.type === "ARTIST"){
										axios
											.get(seed.href,{ headers: {"Authorization": `Bearer ${token}`}})
											.then(response=>{
												console.log("Artist seed name:", response.data.name)
												this.recommendationData.artistSeed = `${response.data.name} [artist]`
											})
											.catch(error =>{console.log(error)})
									}
									if(seed.type === "TRACK"){
										axios
											.get(seed.href,{ headers: {"Authorization": `Bearer ${token}`}})
											.then(response=>{
												console.log("Track seed name:", response.data.name, "by", response.data.artists[0].name)
												this.recommendationData.trackSeed = `${response.data.name} by ${response.data.artists[0].name} [track]`
											})
											.catch(error =>{console.log(error)})
									}
									if(seed.type === "GENRE"){
										this.recommendationData.genreSeed = `${seed.id} [genre]`
									}
								})
								// clear the spotifyStatusMessage
                if(this.recommendationData.response.length===0){
                  this.spotifyStatusMessage = "No recommendations found! :("
                } else {
                  this.spotifyStatusMessage = "Recommendations found!"
                }
							}
						)
						.catch(error => {
							console.log("generateRecommendations() error caught: ", error)
							// Assign spotifyStatusMessage string to the value of error message
							this.spotifyStatusMessage = error.response.data.error.message
							// If error is a 401 (token has likely expired)
							if (error.message === "Request failed with status code 401") {
								// Run refreshSpotifyToken() to get new access token
								this.refreshSpotifyToken()
							}
						})
				}
			}
		},
		// durationCalculator
		timeDoctor(minutes){
			return minutes * 60000
		},
		// Legend:
		// 0:C, 1:C#, 2:D, 3:D#, 4:E, 5:F
		// 6:F#, 7:G, 8:G#, 9:A, 10:A#, 11:B
		keyDoctor(number){
			switch(number) {
				case 0: return 'C'
				case 1: return 'C#'
				case 2: return 'D'
				case 3: return 'D#'
				case 4: return 'E'
				case 5: return 'F'
				case 6: return 'F#'
				case 7: return 'G'
				case 8: return 'G#'
				case 9: return 'A'
				case 10: return 'A#'
				case 11: return 'B'
			}
		},
		percentageDoctor(value, max){
			// console.log("value: ", value)
			// console.log("max: ", max)
			let v = parseFloat(value)
			let m = parseFloat(max)
			// console.log("v: ", v)
			// console.log("m: ", m)
			return Math.floor((v / m) * 100)
		},
		createRecommendationsPlaylist(){
			console.log("Got these recommendations: ",this.recommendationData.response)
			let token = localStorage.getItem('spotify_access_token')
			let spotifyBaseURL = 'https://api.spotify.com/v1'
			let userID = localStorage.getItem('spotify_user_id')
			// Initialise selected seed variables
			let artistSeed = this.recommendationData.artistSeed
			let trackSeed = this.recommendationData.trackSeed
			let genreSeed = this.recommendationData.genreSeed
			// Initialise array to hold selected seeds
			let selectedSeedsArray = []
			// If seed exists, push to our new array
			if (artistSeed){selectedSeedsArray.push(artistSeed)}
			if (trackSeed){selectedSeedsArray.push(trackSeed)}
			if (genreSeed){selectedSeedsArray.push(genreSeed)}
			// Log the array
			console.log("selectedSeedsArray: ", selectedSeedsArray)
			// Initialise selected seeds string
			let selectedSeedsString = ""
			// If only one seed was chosen, append this to the string
			if(selectedSeedsArray.length===1){selectedSeedsString += "1 seed used: "}
			// Else, append this to the string
			else{selectedSeedsString += `${selectedSeedsArray.length} seeds used: `}
			// For each seed in our array, concatenate with our string adding a comma & space
			selectedSeedsArray.forEach(seed => selectedSeedsString += `${seed}, `)
			// Log the string
			console.log("selectedSeedsString: ", selectedSeedsString)
			// Using Date prototype object to make a method to return today's date, formatted nicely
			Date.prototype.today = function () {
				return ((this.getDate() < 10)?"0":"") + this.getDate() +"-"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"-"+ this.getFullYear();
			}
			// The same again, but for the current time
			Date.prototype.timeNow = function () {
				return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
			}
			// Initialising Date Object
			let now = new Date()
			// Logging date & time to see the output
			console.log("Now: ", now.today(),"@",now.timeNow())
			// Create new playlist
			axios
				.post(`${spotifyBaseURL}/users/${userID}/playlists`,
					{
						"name" : `Audiohaven (${now.today()} @ ${now.timeNow()})`,
						"public" : false,
						"collaborative" : false,
						// Slice the leading comma & whitespace off our string
						"description" : `${selectedSeedsString.slice(0,-2)}`
					},
					{
						headers: {
							"Authorization": `Bearer ${token}`
						}
					})
				.then(response => {
						// Log response
						console.log("createRecommendationsPlaylist() response: ", response.data)
						// Initialise URL of new playlist
						this.newPlaylistURL = response.data.external_urls.spotify
						// Log message indicating beginning of add-to-playlist stage of function
						console.log("Adding recommendations to playlist...")
						// Initialise the ID of the playlist just made
						let newPlaylistID = response.data.id
						// Initialise string to be used for the query of URIs
						let uriQueries = ""
						// For each URI in our recommendations array, add to uriQueries string, with a comma separating each
						this.recommendationData.response.forEach(recommendation => (uriQueries += `${recommendation.uri},`))
						// Log the uriQueries for debugging purposes
						console.log("uriQueries: ", uriQueries)
						// Add recommendations to new playlist
						axios
							.post(`${spotifyBaseURL}/playlists/${newPlaylistID}/tracks?uris=${uriQueries}`, {},
								{
									headers: {
										"Authorization": `Bearer ${token}`
									}
								})
							.then(response => {
									// Log response
									console.log("Adding recommendations to new playlist response: ", response.data)
									this.spotifyStatusMessage = `Your playlist was made!`
								}
							)
							.catch(error => {
									// Log errors
									console.log("Error caught adding to new playlist: ", error)
									console.log("Message: ", error.message)
									// Assign spotifyStatusMessage string to the value of error message
									this.spotifyStatusMessage = error.response.data.error.message
									// If error is a 401 (token has likely expired)
									if (error.message === "Request failed with status code 401") {
										// Run refreshSpotifyToken() to get new access token
										this.refreshSpotifyToken()
									}
									// Log message indicating attempt at unfollowing the new playlist,
									// since adding tracks to it failed.
									console.log("Unfollowing empty playlist.")
									// DEL request using the ID of the new playlist
									axios
										.delete(`${spotifyBaseURL}/playlists/${response.id}/followers`,
											{
												headers: {
													"Authorization" : `Bearer ${token}`
												}
											})
										.then(response => {
												console.log("Unfollowed empty playlist due to error! \n Response: ", response.data)
											}
										)
										.catch(error => {
											console.log("Error caught unfollowing empty playlist: ", error.response, "\n Message: ", error.response.data.error.message)
											this.spotifyStatusMessage = `${error.response.data.error.message}...`
										})
								}
							)
					}
				)
				.catch(error => {
						// Log errors
						console.log("createRecommendationsPlaylist() error caught: ", error)
						console.log("createRecommendationsPlaylist() error message: ", error.message)
						// Assign spotifyStatusMessage string to the value of error message
						this.spotifyStatusMessage = error.response.data.error.message
						// If error is a 401 (token has likely expired)
						if (error.message === "Request failed with status code 401") {
							// Run refreshSpotifyToken() to get new access token
							this.refreshSpotifyToken()
						}
					}
				)
		}
	}
}
</script>

<style>
.newPlaylistURL{
	color: hotpink;
	font-size: 1.5em;
}
.newPlaylistURL:link{
	color: hotpink;
	text-decoration: none;
}
.newPlaylistURL:visited{
	color: hotpink;
	text-decoration: none;
}
.newPlaylistURL:hover{
	color: deeppink;
	text-decoration: underline;
}

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