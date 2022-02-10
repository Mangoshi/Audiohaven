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
					margin-top: 12vw;
					padding: 50px;
					background-color: lightgrey;
					border-radius: 100px;
					border: 20px solid black;
					max-width: 800px;
					font-family: 'Courier New', monospace;
				">
					<!-- If user is not logged in -->
					<div v-if="!loggedIn">
						<!-- Login Form -->
						<div v-if="formToggle">
							<h1>Welcome!</h1>
							<h2>You don't appeared to be logged in...</h2>
							<h3>Please log in below :)</h3>
							<h1>⬇</h1>
							<v-form v-model="loginValid">
								<v-text-field
									required
									type="text"
									v-model="loginForm.username"
									placeholder="username"
									:rules="usernameRules"
								/>
								<v-text-field
									required
									type="email"
									v-model="loginForm.email"
									placeholder="email"
									:rules="emailRules"
								/>
								<small v-if="errors.email" class="unselectable errorMessage">{{errors[0].email}}</small>
								<v-text-field
									required
									type="password"
									v-model="loginForm.password"
									placeholder="password"
									:rules="passwordRules"
								/>
								<small v-if="errors.password" class="align-left unselectable errorMessage">{{errors.password[0]}}</small>
							</v-form>
							<br>
							<v-btn color="secondary" class="mr-2" @click="toggleForm()">Register</v-btn>
							<v-btn color="accent" class="secondary--text ml-2" @click="login(loginForm)">Login</v-btn>
						</div>
						<!-- Register Form -->
						<div v-else>
							<h1>Welcome!</h1>
							<h2>Ah, you want to register?</h2>
							<h3>Please fill in your details below :)</h3>
							<h1>⬇</h1>
							<v-form v-model="registerValid">
								<v-text-field
									required
									type="text"
									v-model="registerForm.username"
									placeholder="username"
									:rules="usernameRules"
								/>
								<small v-if="errors.username" class="unselectable errorMessage">{{errors.name[0]}}</small>
								<v-text-field
									required
									type="email"
									v-model="registerForm.email"
									placeholder="email"
									:rules="emailRules"
								/>
								<small v-if="errors.email" class="unselectable errorMessage">{{errors.email[0]}}</small>
								<v-text-field
									required
									type="password"
									v-model="registerForm.password"
									placeholder="password"
									:rules="passwordRules"
								/>
								<small v-if="errors.password" class="unselectable errorMessage">{{errors.password[0]}}</small>
							</v-form>
							<br>
							<v-btn color="secondary" class="mr-2" @click="toggleForm()">Login</v-btn>
							<v-btn color="accent" class="secondary--text ml-2" @click="register(registerForm)">Register</v-btn>
						</div>
					</div>
					<!-- If user is logged in -->
					<div v-else>
						<h2>
							You are logged in.
						</h2>
					</div>
				</v-item-group>
			</v-row>
		</v-container>
	</v-img>
</template>

<!--suppress JSUnresolvedVariable, JSUnresolvedVariable, SpellCheckingInspection -->
<script>
import axios from '../config/audiohaven.js'
import { mapActions, mapState } from 'vuex'

export default {
	name: "Home",
	title: 'Home',
	components: {},
	data(){
		return{
			// Image data
			photoHD: "",
			photoSD: "",
			// Form data
			loginForm: {
				username: "",
				email: "",
				password: "",
			},
			registerForm: {
				username: "",
				email: "",
				password: ""
			},
			formToggle: true,
			// Form validation data
			loginValid: false,
			registerValid: false,
			// Form validation rules
			emailRules: [
				v => !!v || 'E-mail is required',
				v => /.+@.+/.test(v) || 'E-mail must be valid',
			],
			passwordRules: [
				v => !!v || 'Password is required',
				v => v.length >= 5 || 'Password must be more than 5 characters long',
			],
			usernameRules: [
				v => !!v || 'Name is required',
				v => v.length > 1 || 'Name must be more than 1 character long',
			]
		}
	},
	mounted(){
		this.getBackgroundImage()
	},
	methods: {
		...mapActions(['login', 'register']),
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
		},
		toggleForm(){
			this.formToggle = !this.formToggle
		}
	},
	computed: {
		...mapState(['loggedIn', 'errors'])
	},
}
</script>

<style>

</style>