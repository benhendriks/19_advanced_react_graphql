const { forwardTo } = require("prisma-binding");
const { hasPermission } = require('../utils');

const Query = {
  items: forwardTo("db"),
  item: forwardTo("db"),
  itemsConnection: forwardTo("db"),
  me(parent, args, ctx, info) {
    //Check if there is a current user ID
    if (!ctx.request.userId) {
      return null;
    }
    return ctx.db.query.user(
    {
      where: { id: ctx.request.userId },
    }, 
    info
    );
  },
  async users(parent, args, ctx, info) {
    //1. Check if they are logged in
    if(!ctx.request.userId) {
      throw new Error('You must be logged in');
    }
    console.log(ctx.request.userId);
    //2. Check if the User has the permissions to queryall the users
    hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE']);
    //3. If they do, query all the users!
    return ctx.db.query.users({}, info);
  },
  async order(parent, args, ctx, info) {
    // 1. Make sure they are logged in
    if(!ctx.request.userId) {
      throw new Error('You arent logged in');
    }
    // 2. Query the current order
    const order = await ctx.db.query.order({
      where: { id: args.id },
    }, info);
    // 3. Check if they have the permissons to see this order
    const ownsOrder = order.user.id === ctx.request.userId;
    const hasPermissionToSeeOrder = ctx.request.user.permissions.includes('ADMIN');
    if(!ownsOrder || !hasPermission) {
      throw new Error('You cant see this!');
    }
    // 4. Return the order 
    return order;
  }
 };
 
module.exports = Query;
