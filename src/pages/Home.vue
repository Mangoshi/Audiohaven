<template>
	<v-img
		:lazy-src="this.photoSD"
		:src="this.photoHD"
		height="100%"
		max-height="100%"
		max-width="100%"
		width="100%"
	>
		<v-container fluid>
			<v-row justify="center">
				<v-col cols="12" lg="6" md="8" sm="10" xl="4">
					<v-item-group class="loginBox primary">
						<!-- If user is not logged in -->
						<div v-if="!loggedIn" class="d-flex flex-column">
							<!-- Logo -->
							<v-img
								transition="scale-transition"
								:src="themedLogo()"
								class="align-self-center"
								width="350"
							></v-img>
							<!-- Login Form -->
							<div v-if="formToggle" class="text-center">
								<h3 class="testText2 text-center text--primary">Please log in to start organising your music. </h3>
								<p class="testText2 text-center text--primary"> Not a user yet? Why not sign up now!</p>
								<br>
								<v-form v-model="loginValid">
									<v-text-field
										v-model="loginForm.email"
										:rules="emailRules"
										color="accent"
										filled
										placeholder="email"
										required
										type="email"
									/>
									<small v-if="errors.email" class="unselectable errorMessage">{{ errors[0].email }}</small>
									<v-text-field
										v-model="loginForm.password"
										:rules="passwordRules"
										color="accent"
										filled
										placeholder="password"
										required
										type="password"
									/>
									<small v-if="errors.password" class="align-left unselectable errorMessage">{{ errors.password[0] }}</small>
									<small v-if="errors.message" class="unselectable errorMessage">{{ errors.message }}</small>
								</v-form>
								<br>
								<v-btn class="mr-2" color="primary" large @click="toggleForm()">Register</v-btn>
								<v-btn class="secondary--text ml-2" color="accent" large @click="login(loginForm)">Login</v-btn>
							</div>
							<!-- Register Form -->
							<div v-else>
								<h3 class="testText2 text-center text--primary">Please register to start organising your music. </h3>
								<br>
								<v-form v-model="registerValid">
									<v-text-field
										v-model="registerForm.username"
										:rules="usernameRules"
										color="accent"
										filled
										placeholder="username"
										required
										type="text"
									/>
									<small v-if="errors.username" class="unselectable errorMessage">{{ errors.name[0] }}</small>
									<v-text-field
										v-model="registerForm.email"
										:rules="emailRules"
										color="accent"
										filled
										placeholder="email"
										required
										type="email"
									/>
									<small v-if="errors.email" class="unselectable errorMessage">{{ errors.email[0] }}</small>
									<v-text-field
										v-model="registerForm.password"
										:rules="passwordRules"
										color="accent"
										filled
										placeholder="password"
										required
										type="password"
									/>
									<small v-if="errors.password" class="unselectable errorMessage">{{ errors.password[0] }}</small>
									<small v-if="errors.message" class="unselectable errorMessage">{{ errors.message }}</small>
								</v-form>
								<br>
								<v-btn class="mr-2" color="primary" large @click="toggleForm()">Login</v-btn>
								<v-btn class="secondary--text ml-2" color="accent" large @click="register(registerForm)">Register
								</v-btn>
							</div>
						</div>
						<!-- If user is logged in -->
						<div v-else>
							<!-- Logo -->
							<div class="d-flex flex-column">
								<v-img
									transition="scale-transition"
									:src="themedLogo()"
									class="align-self-center"
									width="400"
								></v-img>
							</div>
						</div>
					</v-item-group>
				</v-col>
			</v-row>
		</v-container>
	</v-img>
</template>

<!--suppress JSUnresolvedVariable, JSUnresolvedVariable, SpellCheckingInspection -->
<script>
import axios from '../config/audiohaven.js'
import {mapActions, mapState} from 'vuex'

export default {
	name: "Home",
	title: 'Home',
	components: {},
	data() {
		return {
			// Image data
			photoHD: "",
			photoSD: "",
			// Form data
			loginForm: {
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
				// has to exist
				v => !!v || 'E-mail is required',
				// has to be valid = *@*
				v => /.+@.+/.test(v) || 'E-mail must be valid',
			],
			passwordRules: [
				// has to exist
				v => !!v || 'Password is required',
				// has to be greater than or equal to 5char
				v => v.length >= 5 || 'Password must be more than 5 characters long',
			],
			usernameRules: [
				// has to exist
				v => !!v || 'Name is required',
				// has to be greater than 1 character
				v => v.length > 1 || 'Name must be more than 1 character long',
			]
		}
	},
	mounted() {
		this.getBackgroundImage()
	},
	methods: {
		...mapActions(['login', 'register']),
		randomInt(min, max) {
			return Math.floor(Math.random() * (max - min + 1) + min)
		},
		getBackgroundImage() {
			let searchQuery = 'code'
			const PEXELS_URL = `https://api.pexels.com/v1/search?query=${searchQuery}&per_page=20&orientation=landscape`
			const PEXELS_TOKEN = "563492ad6f91700001000001660dc6de6e62494da4a3601ccfc6ecc3"
			axios
				.get(PEXELS_URL, {headers: {"Authorization": `Bearer ${PEXELS_TOKEN}`}})
				.then(pexels => {
					console.log("Pexels data: ", pexels.data)
					let photoIndex = this.randomInt(0, 19)
					console.log("Random Photo Index: ", photoIndex)
					this.photoHD = pexels.data.photos[photoIndex].src.original
					this.photoSD = pexels.data.photos[photoIndex].src.medium
				})
				.catch(error => console.log("Pexels error: ", error))
		},
		toggleForm() {
			this.formToggle = !this.formToggle
			this.$store.commit('SET_ERRORS', '')
		},
		themedLogo() {
			if (!this.$vuetify.theme.dark) {
				return require("@/assets/Audiohaven_logo_lightmode.svg")
			} else {
				return require("@/assets/Audiohaven_logo_darkmode.svg")
			}
		}
	},
	computed: {
		...mapState(['loggedIn', 'errors'])
	},
}
</script>

<style>

.loginBox {
	margin-top: 6vw;
	padding: 30px;
	background-color: #fafafa;
	border-radius: 30px;
	max-width: 1000px;
}

.testText {
	color: #222020;
	text-align: left;
}

.testText2 {
	color: #423F3F;
	text-align: left;
	font-weight: 300;
}

.errorMessage {
	color: hotpink;
}

</style>