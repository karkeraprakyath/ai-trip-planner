import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const CreateNewUser = mutation({
    args: {
        clerkId: v.string(),
        name: v.string(),
        email: v.string(),
        imageUrl: v.string()
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.query('UserTable')
            .filter((q) => q.eq(q.field('clerkId'), args.clerkId))
            .collect();

        if (user?.length == 0) {
            const userData = {
                clerkId: args.clerkId,
                name: args.name,
                email: args.email,
                imageUrl: args.imageUrl
            };
            const result = await ctx.db.insert('UserTable', userData);
            return userData;
        }
        return user[0];
    }
});

export const getUserByClerkId = query({
    args: {
        clerkId: v.string()
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.query('UserTable')
            .filter((q) => q.eq(q.field('clerkId'), args.clerkId))
            .first();
        return user;
    }
});
