import Scan from "../../models/Scan.js";
import User from "../../models/User.js";

const ADMIN_EMAIL = "trustscan.ai@gmail.com";
const DEFAULT_CREDITS = 5;
const CREDIT_RECHARGE_INTERVAL_MS = 2 * 24 * 60 * 60 * 1000;

async function getOrCreateUserRecord(firebaseUid, userEmail) {
  let user = await User.findOne({ firebaseUid });

  if (!user) {
    user = await User.create({
      firebaseUid,
      email: userEmail || null,
      credits: DEFAULT_CREDITS,
      lastCreditRecharge: new Date(),
    });
  } else if (!user.email && userEmail) {
    user.email = userEmail;
    await user.save();
  }

  return user;
}

export async function syncUserProfile(firebaseUid, userEmail = null) {
  const now = new Date();
  const user = await getOrCreateUserRecord(firebaseUid, userEmail);

  const [actualScanCount, actualThreats] = await Promise.all([
    Scan.countDocuments({ userId: firebaseUid }),
    Scan.countDocuments({
      userId: firebaseUid,
      $or: [
        {
          status: { $in: ["fraud", "scam"] },
          userFeedback: { $ne: "incorrect_safe" },
        },
        { userFeedback: "incorrect_fraud" },
      ],
    }),
  ]);

  const lastRecharge = user.lastCreditRecharge || user.createdAt || now;
  const isAdmin = (user.email || userEmail) === ADMIN_EMAIL;
  let shouldSave = false;

  if (
    !isAdmin &&
    (now - lastRecharge > CREDIT_RECHARGE_INTERVAL_MS || user.credits === undefined)
  ) {
    user.credits = DEFAULT_CREDITS;
    user.lastCreditRecharge = now;
    shouldSave = true;
  }

  if (user.totalScans !== actualScanCount || user.totalThreats !== actualThreats) {
    user.totalScans = actualScanCount;
    user.totalThreats = actualThreats;
    shouldSave = true;
  }

  if (shouldSave) {
    await user.save();
  }

  return user;
}

export async function resolveUserScanAccess({ userId, userEmail, depth }) {
  let effectiveDepth = depth || "basic";
  let analysisLayer = 1;
  let ocrDepth = "basic";
  let creditsConsumed = 0;

  if (!userId) {
    if (effectiveDepth === "deep" || effectiveDepth === "standard") {
      effectiveDepth = "basic";
    }

    return { depth: effectiveDepth, analysisLayer, ocrDepth, creditsConsumed };
  }

  const now = new Date();
  const user = await getOrCreateUserRecord(userId, userEmail);
  const effectiveEmail = user.email || userEmail;
  const isAdmin = effectiveEmail === ADMIN_EMAIL;
  const lastRecharge = user.lastCreditRecharge || user.createdAt || now;
  let shouldSave = false;

  if (
    !isAdmin &&
    (now - lastRecharge > CREDIT_RECHARGE_INTERVAL_MS ||
      user.credits === undefined ||
      (user.credits === 0 && !user.lastCreditRecharge))
  ) {
    user.credits = DEFAULT_CREDITS;
    user.lastCreditRecharge = now;
    shouldSave = true;
  }

  if (effectiveDepth === "deep") {
    if (isAdmin || user.credits > 0) {
      analysisLayer = 3;
      ocrDepth = "deep";

      if (!isAdmin) {
        user.credits -= 1;
        creditsConsumed = 1;
        shouldSave = true;
      }
    } else {
      effectiveDepth = "standard";
    }
  }

  if (effectiveDepth === "standard") {
    analysisLayer = 2;
    ocrDepth = "standard";
  }

  if (shouldSave) {
    await user.save();
  }

  return {
    depth: effectiveDepth,
    analysisLayer,
    ocrDepth,
    creditsConsumed,
  };
}

export async function updateUserScanStats({ userId, status, finalRisk, savedDoc }) {
  if (!userId) {
    return;
  }

  const user = await User.findOne({ firebaseUid: userId });
  if (!user) {
    return;
  }

  if (user.plan === "free") {
    savedDoc.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  const oldTotal = user.totalScans || 0;
  const currentOverall = user.overallSafetyScore || 100;
  const scanSafety = 100 - finalRisk;
  const newTotal = oldTotal + 1;
  const newSafety = Math.round(((currentOverall * oldTotal) + scanSafety) / newTotal);

  user.totalScans = newTotal;
  user.overallSafetyScore = newSafety;

  if (status === "fraud" || status === "scam") {
    user.totalThreats = (user.totalThreats || 0) + 1;
  }

  await Promise.all([
    user.save(),
    savedDoc.isModified() ? savedDoc.save() : Promise.resolve(),
  ]);
}
