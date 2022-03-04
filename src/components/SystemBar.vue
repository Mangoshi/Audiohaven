<template>
	<v-system-bar
		app
		height="64"
		style="padding:10px"
	>
		<!-- Message -->
		<h3 v-if="!systemBarMessage" class="secondary--text consoleFont">Hello 👽</h3>
		<h3 v-else class="secondary--text consoleFont">{{ systemBarMessage }}</h3>

		<!-- Seekbar -->
		<v-slider
			:append-icon="currentPlayerIcon"
			:label="position+'/'+duration"
			:max="seekbarMax"
			:min="seekbarMin"
			:value="seekbarPosition"
			class="playbackSeekbar"
			inverse-label
			readonly
			thumb-color="secondary"
			thumb-label
			track-color="secondary"
			track-fill-color="green"
		></v-slider>

		<!-- Playback Controls -->
		<v-item-group class="playbackButtons">
			<v-btn icon>
				<v-icon color="darkgrey" size="48">mdi-skip-backward</v-icon>
			</v-btn>
			<v-btn icon>
				<v-icon color="green" size="48">mdi-play-pause</v-icon>
			</v-btn>
			<v-btn icon>
				<v-icon color="darkgrey" size="48">mdi-skip-forward</v-icon>
			</v-btn>
		</v-item-group>

		<!-- Link to current player? -->
		<v-icon color="green" size="48">{{ currentPlayerIcon }}</v-icon>
	</v-system-bar>
</template>

<script>
export default {
	name: "SystemBar",
	data() {
		return{
			systemBarMessage : "",
			currentPlayerIcon: "mdi-spotify",
			position: "00:30",
			duration: "01:00",
			seekbarPosition: 50,
			seekbarMin: 0,
			seekbarMax: 100,
		}
	}
}
</script>

<style scoped>
.consoleFont{
	font-family: "Courier New",monospace;
}
.playbackButtons *{
	margin-right: 1em;
}
.playbackSeekbar{
	padding: 20px 20px 0 10px;
}
</style>