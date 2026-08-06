const prisma = require("../prisma/client");

async function findUserByAuthId(authId) {
  return prisma.user.findUnique({ where: { authId } });
}

async function ensureUser(authId, { email, name } = {}) {
  if (!authId) throw new Error("Authenticated user id is required.");

  const normalizedEmail = email?.trim().toLowerCase() || `${authId}@unknown.local`;
  let user = await findUserByAuthId(authId);

  if (!user) {
    try {
      user = await prisma.user.create({
        data: {
          authId,
          email: normalizedEmail,
          name: name?.trim() || null,
          password: "",
        },
      });
    } catch (error) {
      // A second request can create the same auth user concurrently.
      if (error?.code !== "P2002") throw error;
      user = await findUserByAuthId(authId);
    }
  }

  if (!user) throw new Error("Unable to synchronize authenticated user.");

  const updates = {};
  if (email && user.email !== normalizedEmail) updates.email = normalizedEmail;
  if (name?.trim() && user.name !== name.trim()) updates.name = name.trim();
  if (Object.keys(updates).length) {
    user = await prisma.user.update({ where: { id: user.id }, data: updates });
  }

  return user;
}

module.exports = { findUserByAuthId, ensureUser };
