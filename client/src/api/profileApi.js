import axios from "axios";

/**
 * Fetches complete profile data for the logged-in user.
 * Used by ProfilePage.jsx
 */
export const fetchUserProfile = async () => {
  const { data } = await axios.get("/api/v1/user/profile", {
    withCredentials: true,
  });
  return data.profile;
};