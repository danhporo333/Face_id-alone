import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import { loginUser } from '../services/userService';
import { prisma } from './client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// JWT Strategy cho việc xác thực token
passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: JWT_SECRET,
        },
        async (payload, done) => {
            try {
                const user = await prisma.user.findUnique({
                    where: { id: payload.id },
                    include: {
                        sinhVien: true,
                        giangVien: true,
                    },
                });

                if (!user) {
                    return done(null, false);
                }

                return done(null, user);
            } catch (error) {
                return done(error, false);
            }
        },
    ),
);

// Local Strategy cho việc đăng nhập
// passport.use(
//   new LocalStrategy(
//     {
//       usernameField: "username",
//       passwordField: "password",
//     },
//     async (username, password, done) => {
//       try {
//         const { user, token } = await loginUser(username, password);
//         return done(null, { user, token });
//       } catch (error: any) {
//         return done(null, false, { message: error.message });
//       }
//     }
//   )
// );

// Không sử dụng session

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user: any, done) => {
    done(null, user);
});

export default passport;
