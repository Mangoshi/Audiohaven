<template>
	<v-container fluid>
		<v-simple-table>
			<template v-slot:default>
				<thead>
				<tr>
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
					v-for="item in spotifyRequests"
					:key="item.type"
				>
					<td :style="`background-color:${item.color}`">{{ item.type }}</td>
					<td>{{ item.request }}</td>
					<td>{{ item.response }}</td>
				</tr>
				</tbody>
			</template>
		</v-simple-table>
	</v-container>
</template>

<script>
// import axios from '/config/audiohaven.js'

export default {
	name: "Spotify",
	title: 'Spotify',
	components: {},
	data(){
		return{
			spotifyRequests: [
				{
					type: 'GET',
					color: 'cyan',
					request: '',
					response: '',
				},
				{
					type: 'POST',
					color: 'lime',
					request: '',
					response: '',
				},
				{
					type: 'PUT',
					color: 'orange',
					request: '',
					response: '',
				},
				{
					type: 'DELETE',
					color: 'red',
					request: '',
					response: '',
				}

			]
		}
	},
	mounted(){

	},
	methods: {

	}
}
</script>

<style>

</style>