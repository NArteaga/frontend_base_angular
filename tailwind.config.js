module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
      },
      keyframes: {
        swing: {
          '0%': {
            transform: 'rotate(0deg)',
          },
          '10%': {
            transform: 'rotate(10deg)',
          },
          '30%': {
            transform: 'rotate(0deg)',
          },
          '40%': {
            transform: 'rotate(-5deg)',
          },
          '50%': {
            transform: 'rotate(0deg)',
          },
          '60%': {
            transform: 'rotate(5deg)',
          },
          '70%': {
            transform: 'rotate(0deg)',
          },
          '80%': {
            transform: 'rotate(0deg)',
          },
          '100%': {
            transform: 'rotate(0deg)',
          },
        },
        shadowDropTl: {
          '0%': {
            transform: 'translateZ(0) translateX(0) translateY(0)',
            boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)',
          },
          '100%': {
            transform: 'translateZ(50px) translateX(5px) translateY(5px)',
            boxShadow: '-5px -5px 13px -5px rgba(0, 0, 0, 0.35)',
          },
        },
        slideIn: {
          '0%': {
            transform: 'translateX(-100%)',
          },
          '100%': {
            transform: 'translateX(0%)',
          },
        },
        slideOut: {
          '0%': {
            transform: 'translateX(0%)',
          },
          '100%': {
            transform: 'translateX(-100%)'
          },
        },
        wave: {
          '0%': {
            'background-position-x': '0px'
          },
          '100%': {
            'background-position-x': '1000px'
          },
        },
        wave2: {
          '0%': {
            'background-position-x': '0px'
          },
          '100%': {
            'background-position-x': '-1000px'
          },
        }
      },
    },
  },
  plugins: [],
}
