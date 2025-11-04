import { projectId, publicAnonKey } from "../supabase/info";

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-8ee6abd2`;

// Get auth token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem("campus_connect_token");
}

// Generic API call function
async function apiCall(
  endpoint: string,
  options: RequestInit = {},
  requireAuth: boolean = false
): Promise<any> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Always include Authorization header:
  // - Use user token if available (for authenticated requests)
  // - Otherwise use publicAnonKey (for public endpoints like login/signup)
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else if (requireAuth) {
    throw new Error("Authentication required");
  } else {
    // Use anon key for public endpoints
    headers["Authorization"] = `Bearer ${publicAnonKey}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: `Request failed with status ${response.status}`,
      }));
      console.error(`API Error [${endpoint}]:`, error);
      throw new Error(
        error.error ||
          error.message ||
          `Request failed with status ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API Call Error [${endpoint}]:`, error);
    throw error;
  }
}

// ===== AUTH API =====
export const authAPI = {
  signup: async (data: {
    email: string;
    password: string;
    fullName: string;
    department: string;
    year: string;
    skills: string;
    university: string;
  }) => {
    try {
      const response = await apiCall("/signup", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await apiCall("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      // Store token in localStorage
      if (response.accessToken) {
        localStorage.setItem("campus_connect_token", response.accessToken);
        localStorage.setItem(
          "campus_connect_user",
          JSON.stringify(response.user)
        );
      } else {
        throw new Error("No access token received from server");
      }

      return response;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("campus_connect_token");
    localStorage.removeItem("campus_connect_user");
  },

  getCurrentUser: async () => {
    return apiCall("/me", {}, true);
  },

  getStoredUser: () => {
    const userStr = localStorage.getItem("campus_connect_user");
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!getAuthToken();
  },
};

// ===== EVENTS API =====
export const eventsAPI = {
  getAll: async () => {
    return apiCall("/events");
  },

  create: async (event: {
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    category: string;
    organizer: string;
    phone: string;

    university: string;
  }) => {
    return apiCall(
      "/events",
      {
        method: "POST",
        body: JSON.stringify(event),
      },
      true
    );
  },

  join: async (eventId: string) => {
    return apiCall(
      `/events/${eventId}/join`,
      {
        method: "POST",
      },
      true
    );
  },

  update: async (eventId: string, eventData: any) => {
    return apiCall(
      `/events/${eventId}`,
      {
        method: "PUT",
        body: JSON.stringify(eventData),
      },
      true
    );
  },
};

// ===== STUDY GROUPS API =====
export const studyGroupsAPI = {
  getAll: async () => {
    return apiCall("/study-groups");
  },

  create: async (group: {
    subject: string;
    description: string;
    date: string;
    time: string;
    location: string;
    maxMembers: number;
    attendees: string[];
    university: string;
  }) => {
    return apiCall(
      "/study-groups",
      {
        method: "POST",
        body: JSON.stringify(group),
      },
      true
    );
  },

  join: async (groupId: string) => {
    return apiCall(
      `/study-groups/${groupId}/join`,
      {
        method: "POST",
      },
      true
    );
  },

  getRecommendations: async () => {
    return apiCall("/study-groups/recommendations", {}, true);
  },
};

// ===== MARKETPLACE API =====
export const marketplaceAPI = {
  getAll: async () => {
    return apiCall("/marketplace");
  },

  create: async (listing: {
    title: string;
    description: string;
    price: number;
    category: string;
    condition: string;
    image?: string;
  }) => {
    return apiCall(
      "/marketplace",
      {
        method: "POST",
        body: JSON.stringify(listing),
      },
      true
    );
  },

  delete: async (listingId: string) => {
    return apiCall(
      `/marketplace/${listingId}`,
      {
        method: "DELETE",
      },
      true
    );
  },
};

// ===== LOST & FOUND API =====
export const lostFoundAPI = {
  getAll: async () => {
    return apiCall("/lost-found");
  },

  create: async (item: {
    title: string;
    description: string;
    category: string;
    location: string;
    date: string;
    type: "lost" | "found";
    image?: string;
    university: string;
    phone: string;
  }) => {
    return apiCall(
      "/lost-found",
      {
        method: "POST",
        body: JSON.stringify(item),
      },
      true
    );
  },

  updateStatus: async (itemId: string, status: string) => {
    return apiCall(
      `/lost-found/${itemId}`,
      {
        method: "PUT",
        body: JSON.stringify({ status }),
      },
      true
    );
  },

  delete: async (itemId: string) => {
    return apiCall(
      `/lost-found/${itemId}`,
      {
        method: "DELETE",
      },
      true
    );
  },
};

// ===== RIDE SHARING API =====
export const ridesAPI = {
  getAll: async () => {
    return apiCall("/rides");
  },

  create: async (ride: {
    from: string;
    to: string;
    date: string;
    time: string;
    seats: number;
    price: number;
    description?: string;
    university: string;
    phone: string;
  }) => {
    return apiCall(
      "/rides",
      {
        method: "POST",
        body: JSON.stringify(ride),
      },
      true
    );
  },

  request: async (rideId: string) => {
    return apiCall(
      `/rides/${rideId}/request`,
      {
        method: "POST",
      },
      true
    );
  },
};

// ===== PROFILE API =====
export const profileAPI = {
  update: async (data: any) => {
    const response = await apiCall(
      "/profile",
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      true
    );

    // Update stored user
    localStorage.setItem("campus_connect_user", JSON.stringify(response));
    return response;
  },

  getProfile: async () => {
    return apiCall("/profile", {}, true);
  },
};

// ===== CONNECTIONS API =====
export const connectionsAPI = {
  getAllUsers: async () => {
    return apiCall("/users", {}, true);
  },

  getConnections: async () => {
    return apiCall("/connections", {}, true);
  },

  sendRequest: async (targetUserId: string) => {
    return apiCall(
      "/connections/request",
      {
        method: "POST",
        body: JSON.stringify({ targetUserId }),
      },
      true
    );
  },

  acceptRequest: async (requesterId: string) => {
    return apiCall(
      "/connections/accept",
      {
        method: "POST",
        body: JSON.stringify({ requesterId }),
      },
      true
    );
  },

  rejectRequest: async (requesterId: string) => {
    return apiCall(
      "/connections/reject",
      {
        method: "POST",
        body: JSON.stringify({ requesterId }),
      },
      true
    );
  },

  removeConnection: async (userId: string) => {
    return apiCall(
      `/connections/${userId}`,
      {
        method: "DELETE",
      },
      true
    );
  },
};

// ===== EXAM SHARE API =====
export const examResourcesAPI = {
  getAll: async () => {
    return apiCall("/exam-resources");
  },

  create: async (resource: {
    course: string;
    title: string;
    description: string;
    type: string;
    year: string;
    semester: string;
    fileUrl?: string;
  }) => {
    return apiCall(
      "/exam-resources",
      {
        method: "POST",
        body: JSON.stringify(resource),
      },
      true
    );
  },

  download: async (resourceId: string) => {
    return apiCall(
      `/exam-resources/${resourceId}/download`,
      {
        method: "POST",
      },
      true
    );
  },

  markHelpful: async (resourceId: string) => {
    return apiCall(
      `/exam-resources/${resourceId}/helpful`,
      {
        method: "POST",
      },
      true
    );
  },

  delete: async (resourceId: string) => {
    return apiCall(
      `/exam-resources/${resourceId}`,
      {
        method: "DELETE",
      },
      true
    );
  },

  getRecommendations: async () => {
    return apiCall("/exam-resources/recommendations", {}, true);
  },
};
