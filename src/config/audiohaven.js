import axios from 'axios'

export default axios.create({
    baseURL: "https://audiohaven-api.herokuapp.com"
})