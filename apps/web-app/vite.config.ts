import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

console.log("BUILD ENV:", process.env.VITE_API_URL)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
