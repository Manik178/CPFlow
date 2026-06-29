import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      // Use email as the stable identifier since OAuth UUIDs can be unstable without a DB adapter
      if (session.user && token.email) {
        session.user.id = token.email
      }
      return session
    },
    async jwt({ token, user }) {
      if (user && user.email) {
        token.email = user.email
      }
      return token
    }
  },
  session: {
    strategy: "jwt"
  }
})
