import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { isDatabaseConnected } from "../config/db.js";
import { generateToken } from "../utils/jwt.js";

// In-memory user store for mock fallback mode
let inMemoryUsers = [
  {
    id: "usr-demo-pilgrim",
    _id: "usr-demo-pilgrim",
    name: "Ramesh Patel",
    email: "pilgrim@divyatra.in",
    passwordHash: bcrypt.hashSync("Pilgrim@123", 10),
    phone: "+91 98250 12345",
    role: "pilgrim",
    assignedTemple: null,
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    id: "usr-demo-authority",
    _id: "usr-demo-authority",
    name: "Inspector R. Jadeja",
    email: "authority@divyatra.in",
    passwordHash: bcrypt.hashSync("Authority@123", 10),
    phone: "+91 98250 88990",
    role: "authority",
    assignedTemple: "somnath",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    id: "usr-demo-admin",
    _id: "usr-demo-admin",
    name: "Pravin Shah (Temple Trust Admin)",
    email: "admin@divyatra.in",
    passwordHash: bcrypt.hashSync("Admin@123", 10),
    phone: "+91 98250 99999",
    role: "admin",
    assignedTemple: "all",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    createdAt: new Date().toISOString(),
  },
];

export const authService = {
  /**
   * Register a new user
   */
  async registerUser({ name, email, password, phone = "", role = "pilgrim", assignedTemple = null }) {
    const cleanEmail = email.toLowerCase().trim();

    if (isDatabaseConnected()) {
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        const error = new Error("An account with this email address already exists.");
        error.statusCode = 409;
        throw error;
      }

      const user = await User.create({
        name,
        email: cleanEmail,
        password,
        phone,
        role: ["pilgrim", "authority", "admin"].includes(role) ? role : "pilgrim",
        assignedTemple,
      });

      const userObj = user.toObject();
      delete userObj.password;
      const token = generateToken(userObj);
      return { user: userObj, token };
    }

    // In-memory fallback
    const exists = inMemoryUsers.find((u) => u.email === cleanEmail);
    if (exists) {
      const error = new Error("An account with this email address already exists.");
      error.statusCode = 409;
      throw error;
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const newUser = {
      id: `usr-${Date.now()}`,
      _id: `usr-${Date.now()}`,
      name,
      email: cleanEmail,
      passwordHash,
      phone,
      role: ["pilgrim", "authority", "admin"].includes(role) ? role : "pilgrim",
      assignedTemple,
      createdAt: new Date().toISOString(),
    };

    inMemoryUsers.push(newUser);
    const { passwordHash: _, ...safeUser } = newUser;
    const token = generateToken(safeUser);
    return { user: safeUser, token };
  },

  /**
   * Authenticate user with email and password
   */
  async loginUser(email, password) {
    const cleanEmail = email.toLowerCase().trim();

    if (isDatabaseConnected()) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        const error = new Error("Invalid email or password.");
        error.statusCode = 401;
        throw error;
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        const error = new Error("Invalid email or password.");
        error.statusCode = 401;
        throw error;
      }

      const userObj = user.toObject();
      delete userObj.password;
      const token = generateToken(userObj);
      return { user: userObj, token };
    }

    // In-memory fallback
    const user = inMemoryUsers.find((u) => u.email === cleanEmail);
    if (!user) {
      const error = new Error("Invalid email or password.");
      error.statusCode = 401;
      throw error;
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      const error = new Error("Invalid email or password.");
      error.statusCode = 401;
      throw error;
    }

    const { passwordHash, ...safeUser } = user;
    const token = generateToken(safeUser);
    return { user: safeUser, token };
  },

  /**
   * Retrieve current user profile
   */
  async getCurrentUser(identifier) {
    if (isDatabaseConnected()) {
      const user = await User.findOne({
        $or: [{ _id: identifier.match(/^[0-9a-fA-F]{24}$/) ? identifier : null }, { email: identifier }],
      }).select("-password").lean();
      if (user) return user;
    }

    const user = inMemoryUsers.find((u) => u.id === identifier || u._id === identifier || u.email === identifier);
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  },

  /**
   * Seed demo accounts to MongoDB Atlas if connected
   */
  async seedDemoUsers() {
    if (!isDatabaseConnected()) return;
    try {
      for (const demo of inMemoryUsers) {
        const existing = await User.findOne({ email: demo.email });
        if (!existing) {
          await User.create({
            name: demo.name,
            email: demo.email,
            password: demo.email.startsWith("admin") ? "Admin@123" : demo.email.startsWith("authority") ? "Authority@123" : "Pilgrim@123",
            phone: demo.phone,
            role: demo.role,
            assignedTemple: demo.assignedTemple,
          });
        }
      }
      console.log("✅ [Seed] Demo accounts verified in MongoDB Atlas.");
    } catch (err) {
      console.warn("⚠️ Demo user seed notice:", err.message);
    }
  },
};
