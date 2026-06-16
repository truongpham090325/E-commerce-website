import { Socket } from "socket.io";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import { pathAdmin } from "../configs/variable.config";

export const authSocket = (socket: Socket, next: any) => {
  try {
    const cookieString = socket.handshake.headers.cookie;
    if (cookieString) {
      const cookieParsed = cookie.parse(cookieString);

      let token: string = "";
      let role: string = "";

      const referer = socket.handshake.headers.referer || "";
      const isAdminPath = referer.includes(`/${pathAdmin}`);

      if (isAdminPath) {
        if (cookieParsed.tokenAdmin) {
          token = cookieParsed.tokenAdmin;
          role = "admin";
        } else if (cookieParsed.tokenUser) {
          token = cookieParsed.tokenUser;
          role = "user";
        }
      } else {
        if (cookieParsed.tokenUser) {
          token = cookieParsed.tokenUser;
          role = "user";
        } else if (cookieParsed.tokenAdmin) {
          token = cookieParsed.tokenAdmin;
          role = "admin";
        }
      }

      if (token && role) {
        const decoded = jwt.verify(
          token,
          `${process.env.JWT_SECRET}`,
        ) as jwt.JwtPayload;
        if (decoded && decoded.id && decoded.email) {
          socket.data.account = {
            id: decoded.id,
            email: decoded.email,
            role: role,
          };
        }
      }
    }
    next();
  } catch (error) {
    console.log(error);
  }
};
