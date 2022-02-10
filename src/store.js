import Vue from 'vue'
import Vuex from 'vuex'
import axios from './config/audiohaven'

Vue.use(Vuex)

export default new Vuex.Store({
	// state: Store's data
	state: {
		loggedIn: false
	},
	// getters:
	getters:{},
	// mutations: Store's methods which directly alter Store
	mutations:{
		SET_LOGGED_IN_STATUS(state, loggedIn){
			state.loggedIn = loggedIn
		}
	},
	// actions: Store's methods
	actions:{
		login(context, credentials){
			axios
				.post("login",
					{
						username: credentials.username,
						email: credentials.email,
						password: credentials.password
					})
				.then(response =>{
					console.log(response.data)
					context.commit('SET_LOGGED_IN_STATUS', true)
					localStorage.setItem('token', response.data.token)
				})
				.catch(error =>{
					console.log(error)
					console.log(error.response.data.message)
				})
		},
		register(context, credentials){
			axios
				.post("register",
					{
						name: credentials.name,
						email: credentials.email,
						password: credentials.password
					})
				.then(response =>{
					console.log(`register() response: ${response.data}`)
					context.commit('SET_LOGGED_IN_STATUS', true)
					localStorage.setItem('token', response.data.token)
					localStorage.setItem('username', response.data.name)
				})
				.catch(error =>{
					console.log(`register() error: ${error}`)
					context.commit('SET_ERRORS', error)
				})
		},
		logout(context){
			localStorage.removeItem('token')
			context.commit('SET_LOGGED_IN_STATUS', false)
		}
	}
})