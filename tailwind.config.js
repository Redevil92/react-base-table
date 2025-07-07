// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,css}", // covers all your components
    // add more paths if needed
  ],
  plugins: [require("daisyui")], // if you use daisyui
};
