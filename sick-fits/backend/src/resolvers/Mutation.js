const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
 

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
  },

  async signup(parent, args, ctx, info) {
    //lowercase their email
    args.email = args.email.toLowerCase();
    //hash their password
    const password = await bcrypt.hash(args.password, 10);
    //create the user in the database
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ['USER'] },
        },
      }, 
      info
    );
    //Create the JWT token for them 
    const token = jwt.sign({
      userId: user.id
    }, process.env.APP_SECRET);
    //We set the JWT as a cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true, 
      maxAge: 1000 * 60 * 60 * 24 * 365, // One year cookie
    })
    //Finally we return the user to the browser
    return user; 
  },
  async signin(parent, { email, password }, ctx, info) {
    //1. check if there is a user with that email
    const user = await ctx.db.query.user({ where: { email } });
    if(!user) {
      throw new Error(`No such user found for that email ${ email }`);
    }
    //2. check if their password is correct
    const valid = await bcrypt.compare(password, user.password);
    if(!valid) {
      throw new Error(`Invalid password`);
    }
    //3. Genaerate the JWT token
    const token = jwt.sign({
      userId: user.id
    }, process.env.APP_SECRET);
    //4. Set the cookie with the token 
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 *365,
    });
    //5. Return the user
    return user;
  },
  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token');
    return { message: 'Goodbye!'};
  },  
  async requestReset(parent, args, ctx, info) {
    //1. Check if this is a real user
    const user = await ctx.db.query.user({ where: { email: args.email } });
    if(!user) {
      throw new Error(`No such user found for email ${args.email}`);
    } 
    //2. Set an reset token ans expiry on that user
    const randomBytesPromiseified = promisify(randomBytes);
    const resetToken = (await randomBytesPromiseified(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; //1 hour from now
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry }
    });
    return { message: 'thanks'};
    //3. Email them that reset token 
  },  
  async resetPassword(parent, args, ctx, info) {
    //1. check the passwords match
    if(args.password !== args.confirmPassword) {
      throw new Error('Yo Password don/`t match ');
    }
    //2. check if a legit reset token 
    //3. check if its expired
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000, 
      },
    });
    if(!user) {
      throw new Error('This token is either invalid or expired!');
    }
    //4. hash their  new password
    const password = await bcrypt.hash(args.password, 10);
    //5. Save the new password to the user and remove the old reset token fields
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokeExpiry: null,
      },
    });
    //6. Generate JWT 
    const token = jwt.sign({ userId: updatedUser.id }, 
      process.env.APP_SECRET);
    //7. Set the JWT cookie
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
    //8. return the new user
    return updatedUser; 
  },
};

module.exports = Mutations; 
