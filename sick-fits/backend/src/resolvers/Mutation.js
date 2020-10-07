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
};

module.exports = Mutations;
