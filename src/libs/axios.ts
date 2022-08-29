
import axios from 'axios';

export const internal = axios.create({
  headers: {
    'content-type': 'application/json',
    'Authorization': `Bearer ${process.env.SYSTEM_ACCESS_TOKEN}`,
  },
});

export const external = axios.create({
  headers: {
    'content-type': 'application/json',
  },
});
