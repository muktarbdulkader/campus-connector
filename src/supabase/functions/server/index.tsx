import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Supabase client for authentication
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper function to verify authentication
// Returns user if valid JWT token, null if anon key or invalid
async function verifyAuth(authHeader: string | null) {
  if (!authHeader) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  
  // Skip auth verification if it's the anon key (public access)
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  if (token === anonKey) {
    return null; // Public access, no user
  }
  
  // Verify JWT token
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return null;
  }
  return user;
}

// Health check endpoint
app.get("/make-server-8ee6abd2/health", (c) => {
  return c.json({ status: "ok" });
});

// ===== AUTHENTICATION ROUTES =====

// Sign up - Public endpoint, no auth required
app.post("/make-server-8ee6abd2/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, fullName, university, department, year, skills } = body;

    // Validate required fields
    if (!email || !password || !fullName) {
      return c.json({ error: "Email, password, and full name are required" }, 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: "Invalid email address format" }, 400);
    }

    // Validate password length
    if (password.length < 6) {
      return c.json({ error: "Password must be at least 6 characters" }, 400);
    }

    console.log("Creating user:", email);

    // Create user in Supabase Auth using service role key
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: fullName },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error("Signup error from Supabase:", error);
      
      // Handle specific error cases
      if (error.message?.includes("already been registered") || error.code === "email_exists") {
        return c.json({ 
          error: "A user with this email address has already been registered" 
        }, 409); // 409 Conflict status
      }
      
      if (error.message?.includes("Invalid email")) {
        return c.json({ error: "Invalid email address" }, 400);
      }
      
      if (error.message?.includes("Password")) {
        return c.json({ error: "Password must be at least 6 characters" }, 400);
      }
      
      return c.json({ error: error.message || "Failed to create user" }, 400);
    }

    if (!data?.user?.id) {
      console.error("Signup error: No user ID returned");
      return c.json({ error: "Failed to create user" }, 500);
    }

    // Store user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      fullName,
      university: university || "",
      department: department || "",
      year: year || "",
      skills: skills || "",
      createdAt: new Date().toISOString(),
      achievements: 0,
      eventsJoined: 0,
      groupsJoined: 0,
    });

    console.log("User created successfully:", data.user.id);

    return c.json({ 
      message: "User created successfully. Please log in.",
      userId: data.user.id 
    });
  } catch (error) {
    console.error("Signup error (catch):", error);
    return c.json({ error: "Failed to create user. Please try again." }, 500);
  }
});

// Login - Public endpoint, no auth required
app.post("/make-server-8ee6abd2/login", async (c) => {
  console.log("=== Login endpoint called ===");
  console.log("Headers:", Object.fromEntries(c.req.raw.headers.entries()));
  
  try {
    const body = await c.req.json();
    const { email, password } = body;

    console.log("Login attempt for email:", email);

    if (!email || !password) {
      console.error("Missing email or password");
      return c.json({ error: "Email and password are required" }, 400);
    }

    // Sign in with Supabase using anon key (public access)
    const authClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data, error } = await authClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error from Supabase:", error);
      return c.json({ error: error.message || "Invalid credentials" }, 401);
    }

    if (!data?.session?.access_token) {
      console.error("Login error: No session returned");
      return c.json({ error: "Failed to create session" }, 500);
    }

    // Get user profile
    const profile = await kv.get(`user:${data.user.id}`);

    console.log("Login successful for user:", data.user.id);

    return c.json({
      accessToken: data.session.access_token,
      user: profile || { id: data.user.id, email: data.user.email }
    });
  } catch (error) {
    console.error("Login error (catch):", error);
    return c.json({ error: "Failed to login. Please try again." }, 500);
  }
});

// Get current user
app.get("/make-server-8ee6abd2/me", async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const profile = await kv.get(`user:${user.id}`);
  return c.json(profile || { id: user.id, email: user.email });
});

// ===== EVENTS ROUTES =====

// Get all events
app.get("/make-server-8ee6abd2/events", async (c) => {
  try {
    const events = await kv.getByPrefix("event:");
    return c.json(events || []);
  } catch (error) {
    console.error("Get events error:", error);
    return c.json({ error: "Failed to get events" }, 500);
  }
});

// Create event
app.post("/make-server-8ee6abd2/events", async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = await c.req.json();
    const eventId = `event:${Date.now()}`;
    const event = {
      ...body,
      id: eventId,
      creatorId: user.id,
      attendees: [user.id],
      createdAt: new Date().toISOString(),
    };

    await kv.set(eventId, event);
    return c.json(event);
  } catch (error) {
    console.error("Create event error:", error);
    return c.json({ error: "Failed to create event" }, 500);
  }
});

// Join event
app.post("/make-server-8ee6abd2/events/:id/join", async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const eventId = c.req.param('id');
    console.log("Joining event with ID:", eventId);
    
    // The eventId already includes the "event:" prefix
    const event = await kv.get(eventId);
    
    if (!event) {
      console.error("Event not found:", eventId);
      return c.json({ error: "Event not found" }, 404);
    }

    if (!event.attendees.includes(user.id)) {
      event.attendees.push(user.id);
      await kv.set(eventId, event);
      console.log("User added to event attendees:", user.id);
    } else {
      console.log("User already in attendees:", user.id);
    }

    return c.json(event);
  } catch (error) {
    console.error("Join event error:", error);
    return c.json({ error: "Failed to join event" }, 500);
  }
});

// ===== STUDY GROUPS ROUTES =====

// Get all study groups
app.get("/make-server-8ee6abd2/study-groups", async (c) => {
  try {
    const groups = await kv.getByPrefix("group:");
    return c.json(groups || []);
  } catch (error) {
    console.error("Get study groups error:", error);
    return c.json({ error: "Failed to get study groups" }, 500);
  }
});

// Create study group
app.post("/make-server-8ee6abd2/study-groups", async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = await c.req.json();
    const groupId = `group:${Date.now()}`;
    const group = {
      ...body,
      id: groupId,
      creatorId: user.id,
      members: [user.id],
      createdAt: new Date().toISOString(),
    };

    await kv.set(groupId, group);
    return c.json(group);
  } catch (error) {
    console.error("Create study group error:", error);
    return c.json({ error: "Failed to create study group" }, 500);
  }
});

// Join study group
app.post("/make-server-8ee6abd2/study-groups/:id/join", async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const groupId = c.req.param('id');
    console.log("Joining study group with ID:", groupId);
    
    // The groupId already includes the "group:" prefix
    const group = await kv.get(groupId);
    
    if (!group) {
      console.error("Study group not found:", groupId);
      return c.json({ error: "Group not found" }, 404);
    }

    if (!group.members.includes(user.id)) {
      group.members.push(user.id);
      await kv.set(groupId, group);
      console.log("User added to group members:", user.id);
    } else {
      console.log("User already in group members:", user.id);
    }

    return c.json(group);
  } catch (error) {
    console.error("Join study group error:", error);
    return c.json({ error: "Failed to join study group" }, 500);
  }
});

// Get AI-powered study group recommendations
app.get("/make-server-8ee6abd2/study-groups/recommendations", async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    // Get user profile
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile) {
      return c.json({ error: "User profile not found" }, 404);
    }

    // Get all study groups
    const allGroups = await kv.getByPrefix("group:");
    
    // Get user's connections for connection-based recommendations
    const connectionData = await kv.get(`connections:${user.id}`) || { connections: [] };
    const connections = connectionData.connections || [];
    
    // AI-powered recommendation algorithm with connection priority
    const scoredGroups = allGroups
      .filter(group => !group.members?.includes(user.id)) // Exclude groups user is already in
      .filter(group => group.members?.length < group.maxMembers) // Exclude full groups
      .map(group => {
        let score = 0;
        const userSkills = (userProfile.skills || '').toLowerCase().split(',').map((s: string) => s.trim());
        const userDepartment = (userProfile.department || '').toLowerCase();
        const userUniversity = (userProfile.university || '').toLowerCase();
        const groupSubject = (group.subject || '').toLowerCase();
        const groupDescription = (group.description || '').toLowerCase();
        
        // CONNECTION BONUS - Highest priority (groups with connections)
        const groupHasConnection = group.members?.some((memberId: string) => connections.includes(memberId));
        if (groupHasConnection) {
          score += 150;
        }
        
        // University matching (very high weight)
        if (userUniversity && (groupSubject.includes(userUniversity) || groupDescription.includes(userUniversity))) {
          score += 80;
        }
        
        // Department matching (high weight)
        if (groupSubject.includes(userDepartment) || groupDescription.includes(userDepartment)) {
          score += 60;
        }
        
        // Skills matching (medium-high weight)
        userSkills.forEach((skill: string) => {
          if (skill && (groupSubject.includes(skill) || groupDescription.includes(skill))) {
            score += 35;
          }
        });
        
        // Group popularity (low weight)
        const memberCount = group.members?.length || 0;
        score += memberCount * 3;
        
        // Recency bonus (prefer newer groups)
        const groupAge = Date.now() - new Date(group.createdAt).getTime();
        const daysOld = groupAge / (1000 * 60 * 60 * 24);
        if (daysOld < 7) {
          score += 20;
        }
        
        return { ...group, recommendationScore: score };
      })
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 8); // Return top 8 recommendations

    return c.json(scoredGroups);
  } catch (error) {
    console.error("Get study group recommendations error:", error);
    return c.json({ error: "Failed to get recommendations" }, 500);
  }
});

// ===== MARKETPLACE ROUTES =====

// Get all marketplace listings
app.get("/make-server-8ee6abd2/marketplace", async (c) => {
  try {
    const listings = await kv.getByPrefix("listing:");
    return c.json(listings || []);
  } catch (error) {
    console.error("Get marketplace listings error:", error);
    return c.json({ error: "Failed to get marketplace listings" }, 500);
  }
});

// Create marketplace listing
app.post("/make-server-8ee6abd2/marketplace", async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = await c.req.json();
    const listingId = `listing:${Date.now()}`;
    const listing = {
      ...body,
      id: listingId,
      sellerId: user.id,
      createdAt: new Date().toISOString(),
      status: "available",
    };

    await kv.set(listingId, listing);
    return c.json(listing);
  } catch (error) {
    console.error("Create listing error:", error);
    return c.json({ error: "Failed to create listing" }, 500);
  }
});

// Delete marketplace listing
app.delete("/make-server-8ee6abd2/marketplace/:id", async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const listingId = c.req.param('id');
    console.log("Deleting listing with ID:", listingId);
    
    // The listingId already includes the "listing:" prefix
    const listing = await kv.get(listingId);
    
    if (!listing) {
      console.error("Listing not found:", listingId);
      return c.json({ error: "Listing not found" }, 404);
    }

    if (listing.sellerId !== user.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    await kv.del(listingId);
    console.log("Listing deleted:", listingId);
    return c.json({ message: "Listing deleted" });
  } catch (error) {
    console.error("Delete listing error:", error);
    return c.json({ error: "Failed to delete listing" }, 500);
  }
});

// ===== LOST & FOUND ROUTES =====

// Get all lost & found items
app.get("/make-server-8ee6abd2/lost-found", async (c) => {
  try {
    const items = await kv.getByPrefix("lostfound:");
    return c.json(items || []);
  } catch (error) {
    console.error("Get lost & found items error:", error);
    return c.json({ error: "Failed to get lost & found items" }, 500);
  }
});

// Create lost & found item
app.post("/make-server-8ee6abd2/lost-found", async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = await c.req.json();
    const itemId = `lostfound:${Date.now()}`;
    const item = {
      ...body,
      id: itemId,
      reporterId: user.id,
      createdAt: new Date().toISOString(),
      status: "active",
    };

    await kv.set(itemId, item);
    return c.json(item);
  } catch (error) {
    console.error("Create lost & found item error:", error);
    return c.json({ error: "Failed to create item" }, 500);
  }
});

// Update lost & found item status
app.put("/make-server-8ee6abd2/lost-found/:id", async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const itemId = c.req.param('id');
    console.log("Updating lost & found item with ID:", itemId);
    
    // The itemId already includes the "lostfound:" prefix
    const item = await kv.get(itemId);
    
    if (!item) {
      console.error("Lost & found item not found:", itemId);
      return c.json({ error: "Item not found" }, 404);
    }

    const body = await c.req.json();
    const updatedItem = { ...item, ...body };
    await kv.set(itemId, updatedItem);
    console.log("Lost & found item updated:", itemId);
    return c.json(updatedItem);
  } catch (error) {
    console.error("Update lost & found item error:", error);
    return c.json({ error: "Failed to update item" }, 500);
  }
});

// ===== RIDE SHARING ROUTES =====

// Get all rides
app.get("/make-server-8ee6abd2/rides", async (c) => {
  try {
    const rides = await kv.getByPrefix("ride:");
    return c.json(rides || []);
  } catch (error) {
    console.error("Get rides error:", error);
    return c.json({ error: "Failed to get rides" }, 500);
  }
});

// Create ride
app.post("/make-server-8ee6abd2/rides", async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = await c.req.json();
    const rideId = `ride:${Date.now()}`;
    const ride = {
      ...body,
      id: rideId,
      driverId: user.id,
      passengers: [],
      createdAt: new Date().toISOString(),
      status: "available",
    };

    await kv.set(rideId, ride);
    return c.json(ride);
  } catch (error) {
    console.error("Create ride error:", error);
    return c.json({ error: "Failed to create ride" }, 500);
  }
});

// Request to join ride
app.post("/make-server-8ee6abd2/rides/:id/request", async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const rideId = c.req.param('id');
    console.log("Requesting to join ride with ID:", rideId);
    
    // The rideId already includes the "ride:" prefix
    const ride = await kv.get(rideId);
    
    if (!ride) {
      console.error("Ride not found:", rideId);
      return c.json({ error: "Ride not found" }, 404);
    }

    if (ride.passengers.length >= ride.seats) {
      return c.json({ error: "Ride is full" }, 400);
    }

    if (!ride.passengers.includes(user.id)) {
      ride.passengers.push(user.id);
      await kv.set(rideId, ride);
      console.log("User added to ride passengers:", user.id);
    } else {
      console.log("User already in ride passengers:", user.id);
    }

    return c.json(ride);
  } catch (error) {
    console.error("Request ride error:", error);
    return c.json({ error: "Failed to request ride" }, 500);
  }
});

// ===== PROFILE ROUTES =====

// Update profile
app.put("/make-server-8ee6abd2/profile", async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = await c.req.json();
    const profile = await kv.get(`user:${user.id}`);
    const updatedProfile = { ...profile, ...body };
    await kv.set(`user:${user.id}`, updatedProfile);
    return c.json(updatedProfile);
  } catch (error) {
    console.error("Update profile error:", error);
    return c.json({ error: "Failed to update profile" }, 500);
  }
});

// ===== CONNECTIONS ROUTES =====

// Get all users (for discovery)
app.get("/make-server-8ee6abd2/users", async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const allUsers = await kv.getByPrefix("user:");
    // Filter out current user
    const otherUsers = allUsers.filter((u: any) => u.id !== user.id);
    return c.json(otherUsers);
  } catch (error) {
    console.error("Get users error:", error);
    return c.json({ error: "Failed to get users" }, 500);
  }
});

// Get user's connections
app.get("/make-server-8ee6abd2/connections", async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const connectionData = await kv.get(`connections:${user.id}`) || { connections: [], pending: [], received: [] };
    
    // Get full user profiles for connections
    const connectionProfiles = await Promise.all(
      connectionData.connections.map(async (userId: string) => {
        return await kv.get(`user:${userId}`);
      })
    );

    return c.json({
      connections: connectionProfiles.filter(Boolean),
      pending: connectionData.pending || [],
      received: connectionData.received || []
    });
  } catch (error) {
    console.error("Get connections error:", error);
    return c.json({ error: "Failed to get connections" }, 500);
  }
});

// Send connection request
app.post("/make-server-8ee6abd2/connections/request", async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const { targetUserId } = await c.req.json();
    
    // Get current user's connection data
    const userConnections = await kv.get(`connections:${user.id}`) || { connections: [], pending: [], received: [] };
    
    // Get target user's connection data
    const targetConnections = await kv.get(`connections:${targetUserId}`) || { connections: [], pending: [], received: [] };

    // Add to current user's pending
    if (!userConnections.pending.includes(targetUserId)) {
      userConnections.pending.push(targetUserId);
    }

    // Add to target user's received
    if (!targetConnections.received.includes(user.id)) {
      targetConnections.received.push(user.id);
    }

    await kv.set(`connections:${user.id}`, userConnections);
    await kv.set(`connections:${targetUserId}`, targetConnections);

    return c.json({ message: "Connection request sent" });
  } catch (error) {
    console.error("Send connection request error:", error);
    return c.json({ error: "Failed to send connection request" }, 500);
  }
});

// Accept connection request
app.post("/make-server-8ee6abd2/connections/accept", async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const { requesterId } = await c.req.json();
    
    // Get both users' connection data
    const userConnections = await kv.get(`connections:${user.id}`) || { connections: [], pending: [], received: [] };
    const requesterConnections = await kv.get(`connections:${requesterId}`) || { connections: [], pending: [], received: [] };

    // Remove from received/pending
    userConnections.received = userConnections.received.filter((id: string) => id !== requesterId);
    requesterConnections.pending = requesterConnections.pending.filter((id: string) => id !== user.id);

    // Add to both connections lists
    if (!userConnections.connections.includes(requesterId)) {
      userConnections.connections.push(requesterId);
    }
    if (!requesterConnections.connections.includes(user.id)) {
      requesterConnections.connections.push(user.id);
    }

    await kv.set(`connections:${user.id}`, userConnections);
    await kv.set(`connections:${requesterId}`, requesterConnections);

    return c.json({ message: "Connection accepted" });
  } catch (error) {
    console.error("Accept connection error:", error);
    return c.json({ error: "Failed to accept connection" }, 500);
  }
});

// Reject connection request
app.post("/make-server-8ee6abd2/connections/reject", async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const { requesterId } = await c.req.json();
    
    // Get both users' connection data
    const userConnections = await kv.get(`connections:${user.id}`) || { connections: [], pending: [], received: [] };
    const requesterConnections = await kv.get(`connections:${requesterId}`) || { connections: [], pending: [], received: [] };

    // Remove from received/pending
    userConnections.received = userConnections.received.filter((id: string) => id !== requesterId);
    requesterConnections.pending = requesterConnections.pending.filter((id: string) => id !== user.id);

    await kv.set(`connections:${user.id}`, userConnections);
    await kv.set(`connections:${requesterId}`, requesterConnections);

    return c.json({ message: "Connection rejected" });
  } catch (error) {
    console.error("Reject connection error:", error);
    return c.json({ error: "Failed to reject connection" }, 500);
  }
});

// Remove connection
app.delete("/make-server-8ee6abd2/connections/:userId", async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const targetUserId = c.req.param('userId');
    
    // Get both users' connection data
    const userConnections = await kv.get(`connections:${user.id}`) || { connections: [], pending: [], received: [] };
    const targetConnections = await kv.get(`connections:${targetUserId}`) || { connections: [], pending: [], received: [] };

    // Remove from both connections lists
    userConnections.connections = userConnections.connections.filter((id: string) => id !== targetUserId);
    targetConnections.connections = targetConnections.connections.filter((id: string) => id !== user.id);

    await kv.set(`connections:${user.id}`, userConnections);
    await kv.set(`connections:${targetUserId}`, targetConnections);

    return c.json({ message: "Connection removed" });
  } catch (error) {
    console.error("Remove connection error:", error);
    return c.json({ error: "Failed to remove connection" }, 500);
  }
});

// ===== EXAM SHARE ROUTES =====

// Get all exam resources
app.get("/make-server-8ee6abd2/exam-resources", async (c) => {
  try {
    const resources = await kv.getByPrefix("exam:");
    return c.json(resources || []);
  } catch (error) {
    console.error("Get exam resources error:", error);
    return c.json({ error: "Failed to get exam resources" }, 500);
  }
});

// Create exam resource
app.post("/make-server-8ee6abd2/exam-resources", async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = await c.req.json();
    const resourceId = `exam:${Date.now()}`;
    const resource = {
      ...body,
      id: resourceId,
      uploaderId: user.id,
      uploaderName: user.user_metadata?.name || "Anonymous",
      downloads: 0,
      helpful: 0,
      createdAt: new Date().toISOString(),
    };

    await kv.set(resourceId, resource);
    return c.json(resource);
  } catch (error) {
    console.error("Create exam resource error:", error);
    return c.json({ error: "Failed to create exam resource" }, 500);
  }
});

// Download/view exam resource (increment counter)
app.post("/make-server-8ee6abd2/exam-resources/:id/download", async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const resourceId = c.req.param('id');
    console.log("Downloading exam resource with ID:", resourceId);
    
    // The resourceId already includes the "exam:" prefix
    const resource = await kv.get(resourceId);
    
    if (!resource) {
      console.error("Exam resource not found:", resourceId);
      return c.json({ error: "Resource not found" }, 404);
    }

    resource.downloads = (resource.downloads || 0) + 1;
    await kv.set(resourceId, resource);
    console.log("Download count incremented:", resource.downloads);

    return c.json(resource);
  } catch (error) {
    console.error("Download exam resource error:", error);
    return c.json({ error: "Failed to download exam resource" }, 500);
  }
});

// Mark resource as helpful
app.post("/make-server-8ee6abd2/exam-resources/:id/helpful", async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const resourceId = c.req.param('id');
    console.log("Marking exam resource as helpful with ID:", resourceId);
    
    // The resourceId already includes the "exam:" prefix
    const resource = await kv.get(resourceId);
    
    if (!resource) {
      console.error("Exam resource not found:", resourceId);
      return c.json({ error: "Resource not found" }, 404);
    }

    resource.helpful = (resource.helpful || 0) + 1;
    await kv.set(resourceId, resource);
    console.log("Helpful count incremented:", resource.helpful);

    return c.json(resource);
  } catch (error) {
    console.error("Mark helpful error:", error);
    return c.json({ error: "Failed to mark as helpful" }, 500);
  }
});

// Delete exam resource
app.delete("/make-server-8ee6abd2/exam-resources/:id", async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const resourceId = c.req.param('id');
    console.log("Deleting exam resource with ID:", resourceId);
    
    // The resourceId already includes the "exam:" prefix
    const resource = await kv.get(resourceId);
    
    if (!resource) {
      console.error("Exam resource not found:", resourceId);
      return c.json({ error: "Resource not found" }, 404);
    }

    if (resource.uploaderId !== user.id) {
      return c.json({ error: "Unauthorized to delete this resource" }, 403);
    }

    await kv.del(resourceId);
    console.log("Exam resource deleted:", resourceId);
    return c.json({ message: "Resource deleted" });
  } catch (error) {
    console.error("Delete exam resource error:", error);
    return c.json({ error: "Failed to delete exam resource" }, 500);
  }
});

// Get connection-based exam resource recommendations
app.get("/make-server-8ee6abd2/exam-resources/recommendations", async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    // Get user profile and connections
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile) {
      return c.json({ error: "User profile not found" }, 404);
    }

    const connectionData = await kv.get(`connections:${user.id}`) || { connections: [] };
    const connections = connectionData.connections || [];

    // Get all exam resources
    const allResources = await kv.getByPrefix("exam:");
    
    // AI-powered recommendation algorithm with connection weighting
    const scoredResources = allResources
      .map(resource => {
        let score = 0;
        const userSkills = (userProfile.skills || '').toLowerCase().split(',').map((s: string) => s.trim());
        const userDepartment = (userProfile.department || '').toLowerCase();
        const userUniversity = (userProfile.university || '').toLowerCase();
        const userYear = (userProfile.year || '').toLowerCase();
        const resourceCourse = (resource.course || '').toLowerCase();
        const resourceDescription = (resource.description || '').toLowerCase();
        const resourceType = (resource.type || '').toLowerCase();
        
        // CONNECTION BONUS - Highest priority
        if (connections.includes(resource.uploaderId)) {
          score += 200; // Massive boost for content from connections
        }
        
        // University matching (very high weight)
        if (userUniversity && (resourceCourse.includes(userUniversity) || resourceDescription.includes(userUniversity))) {
          score += 80;
        }
        
        // Department matching (high weight)
        if (resourceCourse.includes(userDepartment) || resourceDescription.includes(userDepartment)) {
          score += 70;
        }
        
        // Year matching (high weight for exam materials)
        if (resourceCourse.includes(userYear) || resourceDescription.includes(userYear)) {
          score += 60;
        }
        
        // Skills matching
        userSkills.forEach((skill: string) => {
          if (skill && (resourceCourse.includes(skill) || resourceDescription.includes(skill))) {
            score += 30;
          }
        });
        
        // Quality indicators
        const helpfulRatio = resource.downloads > 0 ? (resource.helpful || 0) / resource.downloads : 0;
        score += helpfulRatio * 50;
        
        // Popularity
        score += (resource.downloads || 0) * 1;
        score += (resource.helpful || 0) * 3;
        
        // Recency bonus
        const resourceAge = Date.now() - new Date(resource.createdAt).getTime();
        const daysOld = resourceAge / (1000 * 60 * 60 * 24);
        if (daysOld < 30) {
          score += 25;
        }
        
        return { ...resource, recommendationScore: score };
      })
      .filter(resource => resource.recommendationScore > 0) // Only show resources with some relevance
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 12); // Return top 12 recommendations

    return c.json(scoredResources);
  } catch (error) {
    console.error("Get exam resource recommendations error:", error);
    return c.json({ error: "Failed to get recommendations" }, 500);
  }
});

Deno.serve(app.fetch);
