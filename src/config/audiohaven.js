import axios from 'axios'

export default axios.create({
   // Live version: ''
    // Using localhost URL while running the API locally
    baseURL: 'https://audiohaven.herokuapp.com/'
})