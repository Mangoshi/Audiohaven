import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'

import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify)

const opts = {
	theme: {
		themes: {
			light: {
				primary: '#d9d7d5',
				secondary: '#3f4142',
				accent: colors.purple.lighten3
			},
			dark: {
				primary: '#3f4142',
				secondary: '#d9d7d5',
				accent: colors.purple.darken4
			},
		}
	}
}

export default new Vuetify(opts)
