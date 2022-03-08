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
				accent: {
					base: colors.purple.lighten2,
					lighter: colors.purple.lighten4,
					darker: colors.purple
				}
			},
			dark: {
				primary: '#3f4142',
				secondary: '#d9d7d5',
				accent: {
					base: colors.purple.darken2,
					lighter: colors.purple,
					darker: colors.purple.darken4
				}
			},
		}
	}
}

export default new Vuetify(opts)
