const prisma = require("../prisma/client");

async function findUserByAuthId(authId) {
  return prisma.user.findUnique({ where: { authId } });
}

async function ensureUser(authId, { email, name } = {}) {
  let user = await findUserByAuthId(authId);

  if (!user) {
    user = await prisma.user.create({
      data: {
        authId,
        email: email || `${authId}@unknown.com`,
        name: name || null,
        password: "",
      },
    });
  }

  return user;
}

module.exports = { findUserByAuthId, ensureUser };
