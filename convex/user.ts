import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const CreateNewUser = mutation({
    args: {
        clerkId: v.optional(v.string()),
        name: v.string(),
        email: v.string(),
        imageUrl: v.string()
    },
    handler: async (ctx, args) => {
        // Try to find user by email first
        const existingUser = await ctx.db.query('UserTable')
            .filter((q) => q.eq(q.field('email'), args.email))
            .first();

        if (existingUser) {
            // If we have a clerkId and the existing user doesn't, update it
            if (args.clerkId && !existingUser.clerkId) {
                await ctx.db.patch(existingUser._id, { clerkId: args.clerkId });
                return { ...existingUser, clerkId: args.clerkId };
            }
            return existingUser;
        }

        // Create new user if not found
        const userData = {
            name: args.name,
            email: args.email,
            imageUrl: args.imageUrl,
            ...(args.clerkId ? { clerkId: args.clerkId } : {})
        };
        const newUserId = await ctx.db.insert('UserTable', userData);
        return { _id: newUserId, ...userData };
    }
});

// Query version for reading
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

// Mutation version for the frontend
export const getUserByClerkIdMutation = mutation({
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
