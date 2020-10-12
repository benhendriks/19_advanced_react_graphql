const Mutations = {
  async createItem(parent, args, ctx, info) {
    //TODO: Check if there are looged in
    const item = await ctx.db.mutation.createItem(
      {
        data: {
          ...args,
        },
      },
      info
    );
    return item;
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    // 1. findthe item
    const item = await ctx.db.query.item({ where }, `{ id title }`);
    // 2. checkif they own that item, or have the permissions
    //TODO
    // 3. Delete it! 
    return ctx.db.mutation.deleteItem({ where }, info);
  }
};

module.exports = Mutations;
