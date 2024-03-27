import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:3000",
});

client.interceptors.response.use(function (response) {
  console.log(response.data);
  return { ...response, data: response.data.data };
});

export { client };
