import axios from 'axios'

export default axios.create({
    // Live version: 'https://audiohaven.herokuapp.com/'
    // Using localhost URL while running the API locally
    baseURL: 'http://localhost:3000'
})