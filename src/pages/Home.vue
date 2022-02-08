<template>
	<v-img
		height="100%"
		max-height="100%"
		width="100%"
		max-width="100%"
		:lazy-src="this.photoSD"
		:src="this.photoHD"
	>
		<v-container fluid>
			<v-row justify="center">
				<v-item-group
					style="
					margin-top: 300px;
					padding: 50px;
					background-color: yellowgreen;
					border-radius: 100px;
					border: 20px solid black;
					max-width: 800px;
					font-family: 'Courier New', monospace;
				">
					<h1>Welcome!</h1>
					<h2>Check the sidebar for the testing grounds :)</h2>
				</v-item-group>
			</v-row>
		</v-container>
	</v-img>
</template>

<!--suppress JSUnresolvedVariable, JSUnresolvedVariable, SpellCheckingInspection -->
<script>
import axios from '/config/audiohaven.js'

export default {
	name: "Home",
	title: 'Home',
	components: {},
	data(){
		return{
			// Image data
			photoHD: "",
			photoSD: "",
		}
	},
	mounted(){
		this.getBackgroundImage()
	},
	methods: {
		randomInt(min, max) {
			return Math.floor(Math.random() * (max - min + 1) + min)
		},
		getBackgroundImage(){
			let searchQuery = 'code'
			const PEXELS_URL = `https://api.pexels.com/v1/search?query=${searchQuery}&per_page=20&orientation=landscape`
			const PEXELS_TOKEN = "563492ad6f91700001000001660dc6de6e62494da4a3601ccfc6ecc3"
			axios
				.get(PEXELS_URL, { headers: {"Authorization" : `Bearer ${PEXELS_TOKEN}`} })
				.then(pexels => {
					console.log("Pexels data: ", pexels.data)
					let photoIndex = this.randomInt(0,19)
					console.log("Random Photo Index: ", photoIndex)
					this.photoHD = pexels.data.photos[photoIndex].src.original
					this.photoSD = pexels.data.photos[photoIndex].src.medium
				})
				.catch(error => console.log("Pexels error: ", error))
		}
	}
}
</script>

<style>

</style>