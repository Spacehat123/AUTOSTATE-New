const postcss = require('postcss')
const tailwindcss = require('@tailwindcss/postcss')

const css = `
@import "tailwindcss";
@custom-variant dark (&:is(.dark *));
.test {
  @apply text-black dark:text-white;
}
`

postcss([tailwindcss]).process(css, { from: undefined }).then(result => {
  console.log(result.css)
})
