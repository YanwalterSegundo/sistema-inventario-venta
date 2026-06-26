import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

type JwtPayload = {
  userId: string;
  email: string;
  role: string;
};

export function authenticate(request: Request, response: Response, next: NextFunction) {
  const header = request.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return response.status(401).json({ message: "Token no enviado" });
  }

  try {
    const token = header.replace("Bearer ", "");
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return response.status(500).json({ message: "JWT_SECRET no configurado" });
    }

    request.user = jwt.verify(token, secret) as JwtPayload;
    return next();
  } catch {
    return response.status(401).json({ message: "Token invalido" });
  }
}
