import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'

Vue.use(Vuetify)

const opts = {
	theme: {
		themes: {
			light: {
				bg: '#d9d7d5',
				text: '#3f4142',
				accent: '#f06292'
			},
			dark: {
				bg: '#3f4142',
				text: '#d9d7d5',
				accent: '#933051'
			}
		},
	}
}

export default new Vuetify(opts)
