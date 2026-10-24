import jwt from "jsonwebtoken"
import type { IUser } from "../model/user.js"
import dotenv from "dotenv"
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET as string
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string

export const signAccessToken = (user: IUser): string => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      roles: user.role,
      email: user.email
    },
    JWT_SECRET,
    {
      expiresIn: "30m"
    }
  )
}

export const signRefreshToken = (user: IUser): string => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      roles: user.role,
      email: user.email
    },
    JWT_REFRESH_SECRET,
    {
      expiresIn: "7d"
    }
  )
}