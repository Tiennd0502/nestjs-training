export const ROUTES = {
  HOME: '/',
  CART: '/cart',
  SIGN_IN: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? '/sign-in',
  SIGN_UP: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? '/sign-up',
  SIGN_UP_VERIFY: `${process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? '/sign-up'}/verify`,
  USER_PROFILE: '/user/profile',
}

export const MOCKAPI_URL = process.env.NEXT_PUBLIC_API_URL
