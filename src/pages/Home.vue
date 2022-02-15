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
				<v-col cols="12" sm="6" md="6">
					<v-item-group class="loginBox">
						<!-- If user is not logged in -->
						<div v-if="!loggedIn">
							<!-- Login Form -->
							<div v-if="formToggle">
								<h1 class="testText">Welcome to AudioHaven</h1>
								<h3 class="testText2">Please log in to start organising your music. </h3>
								<p class="testText2"> Not a user (yet), why not sign up now.</p>
								<br>
								<v-form v-model="loginValid">
									<v-text-field
										required
										type="text"
										v-model="loginForm.username"
										filled
										placeholder="username"
										:rules="usernameRules"
									/>
									<v-text-field
										required
										type="email"
										v-model="loginForm.email"
										filled
										placeholder="email"
										:rules="emailRules"
									/>
									<small v-if="errors.email" class="unselectable errorMessage">{{errors[0].email}}</small>
									<v-text-field
										required
										type="password"
										filled
										v-model="loginForm.password"
										placeholder="password"
										:rules="passwordRules"
									/>
									<small v-if="errors.password" class="align-left unselectable errorMessage">{{errors.password[0]}}</small>
								</v-form>
								<br>
								<v-btn color="secondary" class="mr-2" @click="toggleForm()" large>Register</v-btn>
								<v-btn color="accent" class="secondary--text ml-2" @click="login(loginForm)" large>Login</v-btn>
							</div>
							<!-- Register Form -->
							<div v-else>
								<h1 class="testText">Welcome to AudioHaven</h1>
								<h3 class="testText2">Please register to start organising your music. </h3>
								<br>
								<v-form v-model="registerValid">
									<v-text-field
										required
										type="text"
										filled
										v-model="registerForm.username"
										placeholder="username"
										:rules="usernameRules"
									/>
									<small v-if="errors.username" class="unselectable errorMessage">{{errors.name[0]}}</small>
									<v-text-field
										required
										type="email"
										filled
										v-model="registerForm.email"
										placeholder="email"
										:rules="emailRules"
									/>
									<small v-if="errors.email" class="unselectable errorMessage">{{errors.email[0]}}</small>
									<v-text-field
										required
										type="password"
										filled
										v-model="registerForm.password"
										placeholder="password"
										:rules="passwordRules"
									/>
									<small v-if="errors.password" class="unselectable errorMessage">{{errors.password[0]}}</small>
								</v-form>
								<br>
								<v-btn color="secondary" class="mr-2" @click="toggleForm()" large>Login</v-btn>
								<v-btn color="accent" class="secondary--text ml-2" @click="register(registerForm)" large>Register</v-btn>
							</div>
						</div>
						<!-- If user is logged in -->
						<div v-else>
							<h2>
								You are logged in.
							</h2>
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

.loginBox{
	margin-top: 12vw;
	padding: 50px;
	background-color: #fafafa;
	border-radius: 30px;
	max-width: 1000px;
	font-family: 'Roboto', sans-serif;
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

</style>