import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isMember: boolean;
    } & DefaultSession["user"];
  }
}
