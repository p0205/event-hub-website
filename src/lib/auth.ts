// // lib/auth.ts

// import { cookies } from 'next/headers';
// import jwt from 'jsonwebtoken';

// interface JwtPayload {
//   sub: string;
//   role: string;
//   exp: number;
//   iat: number;
// }

// export async function getUserFromCookie() {
//   const cookieStore = cookies(); // Read cookies from server context
//   const token = (await cookieStore).get('jwt')?.value;

//   if (!token) return null;

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

//     // You can return anything useful from the token
//     return {
//       email: decoded.sub,
//       role: decoded.role,
//       exp: decoded.exp,
//     };
//   } catch (err) {
//     console.error('Invalid JWT:', err);
//     return null;
//   }
// }
